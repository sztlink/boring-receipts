# Boring Receipts - findings summary

> Send branch + command shape. We return boring receipts.

A consolidated read of the receipts so far. All on **AYA-3090** (RTX 3090, 24 GB,
Windows), llama.cpp prebuilt **b9286** win-cuda-12.4, dedicated mode unless noted.
Each claim links to a reproducible receipt; nothing here is asserted without one.

## The model library (Q4_K_M, flash-attn on, dedicated)

| model | params | pp512 t/s | tg128 t/s | VRAM peak | PPL\* |
|---|---|---|---|---|---|
| Mistral-7B-v0.3 | 7.25 B | 5054 | 149.2 | 4.9 GiB | 6.23 |
| Qwen2.5-7B | 7.62 B | 5383 | 145.2 | 5.3 GiB | 8.02 |
| Llama-3.1-8B | 8.03 B | 5000 | 139.8 | 5.6 GiB | 7.50 |
| Gemma-2-9B | 9.24 B | 4052 | 102.8 | 6.9 GiB | 8.80 |
| Qwen2.5-14B | 14.77 B | 2777 | 77.2 | 9.2 GiB | 6.13 |

\* PPL is own-tokenizer perplexity on wikitext-2 - comparable **only within a
family** (e.g. Qwen2.5-7B 8.02 vs Qwen2.5-14B 6.13), never across families.

## Key findings

1. **Flash-attention is a free win that scales with context.** `-fa 1` on the stock
   binary: +11% prefill / +4% decode at empty context, but **+127% prefill / +39%
   decode at 16K**, and at 64K it nearly **triples decode** (20.5 → 58.4 t/s) and
   gives **4.6× prefill**. Always pass `-fa 1` for long context. Confirmed
   cross-architecture: on Qwen2.5-7B the 64K decode gain is **+233%** (R12). (R5, R6, R12)

2. **KV-cache quantization moved from blocked to runnable, then to negative long-context evidence.**
   The b9286 win-cuda prebuilt still hangs under the `-ctk/-ctv` command shape (R4),
   but a patched source build with VS2019, CUDA 11.8 and a local PDL guard patch runs
   the KV dtype axis. The result is not a speed win. q8/q8 decode falls from 0.92x
   f16 at depth 0 to 0.69x at 64K. q8/q4 becomes pathological: 1.71 tok/s at 16K
   and `EXIT -1` before any 32K row. (R4, R14, R15)

3. **Beyond 128K is real on the 3090.** R16 is not a failure receipt: Qwen2.5-7B
   Q4_K_M with q4/q4 KV and flash-attn reaches **524K context** on a single RTX 3090.
   The curve is honest about the cost: 128K decode 28.6 tok/s, 262K 15.4 tok/s,
   524K 8.0 tok/s; 786K stalls before a row and 1M is not reached. The result is
   "we went very far, then found the wall", not "long context failed". (R16)

4. **An idle resident process is a VRAM-capacity tax, not a throughput tax.** With
   ComfyUI resident (~1.2 GB idle) vs dedicated (687 MiB idle), throughput is
   identical within noise (±0.6%); only VRAM headroom differs (~515 MiB). Decode is
   bandwidth-bound and an idle process consumes no bandwidth. The receipt format
   gained a `dedicated_mode` field to never hide this again. (R1b, FORMAT v1.1)

5. **Decode ∝ params within an architecture; the constant shifts across them.** Within
   the library decode tracks parameter count cleanly (Mistral 7.25B fastest → Qwen14B
   slowest), but Gemma-2-9B drops −26% decode for only +15% params over Llama - its
   architecture is heavier than its count implies. Prefill is compute-bound and does
   *not* track size as cleanly (Qwen-7B prefills faster than the smaller Mistral).
   (R7, R8, R9, R11)

6. **The weight-quant trade-off generalizes; the quality cost is model-specific.**
   Q4→Q8 costs ~30% decode and grows VRAM on both Llama (R2b) and Qwen (R10)  -
   prefill stays flat (compute-bound). But Q4's perplexity penalty vs Q8 is **+2.3%
   on Llama** and only **+1.5% on Qwen** - "Q4 is fine" is a per-model claim that must
   be measured, which is why the quality gate is per-receipt and contestable. (R2b, R10)

## Negative / no-delta evidence is first-class

The archive deliberately keeps resistance visible:

- **R4 - KV-quant BLOCKED:** the prebuilt hangs under the KV dtype command shape;
  the blocker redirects the next move to a source build.
- **R13 - source-build CUDA BLOCKED:** the source-build attempt reached a CMake /
  MSVC / Windows SDK preflight blocker before any `llama-bench` binary was produced.
- **R14 - patched source KV dtype negative delta:** the blocker was overcome, but
  q8/q8 is slower than f16 and q8/q4 strongly regresses in the short-context test.
- **R15 - KV dtype long-context timeout:** q8/q8 completes 64K but gets worse vs f16
  with depth; q8/q4 exits `-1` before the 32K row.
- **R16 - beyond-128K capacity pass:** Qwen2.5-7B q4/q4 KV reaches 524K on a
  single 3090; 262K remains above the 10 tok/s usability floor, 524K is a capacity
  pass at ~8 tok/s, and 786K is the observed wall.
- **RS1 - mixed:** entity-hop path construction works, strict single-candidate ECD
  fails.
- **RS2 - N=500 NO DELTA:** the 100-case gated-rerank gain does not scale; direct
  entity-hop path prompting remains the non-oracle baseline.

See [`NEGATIVES.md`](NEGATIVES.md) for the public no-delta/blocked shelf.

## Boundary

Offline single-node receipts. Not a leaderboard, not a vendor benchmark, not
serving-readiness. The canonical minimal KV/long-context receipt the upstream
[llama.cpp #18722](https://github.com/ggml-org/llama.cpp/issues/18722) left unowned.

The open frontier is still the **KV-dtype axis** (the heart of the TurboQuant
comparison). R14 makes the axis runnable with a patched source build, and R15 shows
that the long-context curve is also negative/partial for this command shape. The
next real move is source/kernel inspection, an upstream-clean CUDA 12.x build, or
an external branch-and-command request. For beyond-128K context specifically, R16 establishes the local 3090 capacity ladder;
the next useful target is Qwen3.6-27B or a known long-context fork with a quality
gate, not another blind Qwen2.5-7B capacity rerun.


## R18 — Qwen3.6-35B-A3B TurboQuant+ KLD

- **status:** PARTIAL_PASS_CTX512_KLD / CTX16K_KLD_BLOCKED_BY_LOGIT_BASE_SIZE
- **node:** AYA-3090
- **receipt:** `receipts/2026-05-23-3090-qwen36-a3b-turboquant-kld.md`
- **ctx512:** q8_0 KLD 0.005043, same-top-p 97.010; turbo3 KLD 0.020667, same-top-p 93.529.
- **ctx16K:** direct `--kl-divergence-base` attempt failed before result; recorded as harness/logit-base scale constraint, not a quality result.


## R17 — long-context needle quality gate blocked

- **status:** BLOCKED_BY_UNSAFE_LLAMA_CLI_HARNESS
- **node:** AYA-3090
- **receipt:** `receipts/2026-05-23-3090-qwen25-7b-q4q4-needle-harness-blocked.md`
- **meaning:** no quality conclusion. Direct `llama-cli` over SSH entered interactive/console-loop behavior, left a resident CUDA process, and required reboot. Next attempt must use `llama-server` + HTTP timeout, a bounded child-process harness, or a dedicated passkey tool.


## R17b — safe server passkey negative

- **status:** SAFE_HARNESS_RAN__0_OF_9_PASS__SERVER_CTX_CAP_32K
- **node:** AYA-3090
- **receipt:** `receipts/2026-05-24-3090-qwen25-7b-q4q4-server-passkey-negative.md`
- **meaning:** the safer `llama-server` + HTTP harness ran and cleaned up, but did not produce a positive quality result. Three ~24k-token passkey cases failed retrieval; six larger cases were rejected because the server capped Qwen2.5-7B slot context to 32K despite `-c 131072`.


## R19 — AIME 2026 reasoning smoke

- **status:** AIME_AXIS_ADDED__SMOKE_2_OF_5
- **node:** AYA-3090
- **receipt:** `receipts/2026-05-24-3090-aime26-smoke-qwen25-14b.md`
- **meaning:** AIME is now a Boring Receipts reasoning axis. Harness validated on first five AIME 2026 problems with Qwen2.5-14B Q4_K_M: 2/5 correct. This is not yet a Bunn reproduction; it sets the local baseline and scoring surface for stock-vs-ablated Qwen3.6-27B.

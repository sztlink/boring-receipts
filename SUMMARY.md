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

2. **KV-cache quantization is BLOCKED on this prebuilt.** `-ctk q8_0 -ctv q4_0`
   (which needs `-fa 1`) hangs indefinitely on b9286 win-cuda on the 3090; isolated
   that `-fa 1` *alone* works, so the quantized-KV CUDA kernel is the culprit. Needs
   a source build. This is the TurboQuant-relevant axis, so it's a real blocker  -
   documented as a failure reproduction. (R4)

3. **The long-context wall.** On the context axis, **both** prefill and decode
   collapse with depth (pp −94%, tg −85% by 64K with f16 KV, fa off) - the
   bottleneck is attention over the growing KV cache, not the weights. "128K
   context!" hides a ~20 t/s decode on a 3090; flash-attn (finding 1) and KV-quant
   (blocked, finding 2) are the two levers against it. (R3)

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
comparison), but it now has two blockers: the prebuilt runtime hang (R4) and the
source-build environment preflight (R13). The next real move is to repair the
Windows SDK / developer-shell environment, then rerun the source-build KV dtype
benchmark.

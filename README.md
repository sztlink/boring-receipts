# Boring Receipts Lab

> Send branch + command shape. We return boring receipts.

**Live:** https://sztlink.github.io/boring-receipts/ ·
**Findings:** [SUMMARY.md](SUMMARY.md) ·
**Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md) ·
**Research sibling:** [turboquant-cuda-bench](https://github.com/sztlink/turboquant-cuda-bench)

A NVIDIA validation node for the Waffle/TurboQuant community. No hype, no vague
benchmark claims - just verifiable receipts: repo/branch/commit, build flags,
OS/driver/CUDA, GPU/VRAM, exact command, model/quant/context, tok/s, TTFT,
VRAM peak, power, quality smoke or failure reproduction, status, caveats.

**What "boring" actually means: the ladder runs from the noob to the Waffle
House.** The same plain, reproducible receipt format covers the person who just
downloaded a GGUF and ran one command, *and* the expert validating a
TriAttention/longctx branch under load. Every rung is reproducible by the rung
below it. We never skip steps to look advanced - skipping the floor is the
opposite of boring.

Context and rationale: [`https://github.com/sztlink/turboquant-cuda-bench`](https://github.com/sztlink/turboquant-cuda-bench)

## The ladder

| rung | who | what the receipt proves | reproducible by |
|---|---|---|---|
| **1 - noob** | anyone with a GPU | downloaded a prebuilt llama.cpp + a GGUF, ran one command, here are the real tok/s | a beginner in ~10 min |
| **2 - quant** | local user | same model across quants (Q4/Q5/Q8): the speed↔quality trade-off | rung 1 |
| **3 - build** | tinkerer | source build + flags (e.g. flash-attn): the delta vs the prebuilt | rung 2 |
| **4 - serving** | someone who serves | vLLM/SGLang aggregate throughput, req/s, TTFT, ITL under concurrency | rung 3 |
| **5 - Waffle House** | the community | a TriAttention/longctx/MTP branch: delta vs baseline + quality smoke + failures | rung 4 |

The point is the *whole climb*, not the top. A receipt nobody can reproduce is
just a benchmark claim.

## Layout

- `HOW-TO-READ.md` - how to read a boring receipt: claim, target, command,
  environment, results, gate, evidence, non-claims, next step.
- `CANON.md` - the doctrine: *for whom*. A receipt re-executes (it does not address
  a reader); the gesture is truth, the human layer has reading primacy; the ladder
  is transferable trust.
- `AXES.md` - *what*: which axes a receipt may vary (runtime), what it holds
  invariant (the quality gate), what it only cites (the probe/RAG family in the
  parent repo), how it compares (scoring), and its visual form (the delta sheet).
- `PROCESS-INDEX.md` - the library grouped by gesture: baseline, quant ladder,
  context, flash-attn, model library, blocked/no-delta/research siblings.
- `NEGATIVES.md` - blocked, mixed and no-delta receipts with equal public weight.
- `GENEALOGY.md` - crypto detour → Waffle/TurboQuant validation → boring receipts;
  the history that keeps the lab from becoming a decontextualized benchmark shelf.
- `PRESERVATION.md` - static export policy, package contents, hashes and platform
  risk.
- `data/receipts-index.json` - structured receipt index for derived views.
- `scripts/generate-delta-sheet.mjs` - generates the delta-sheet SVG from the data
  (sibling render; edit data, re-run). Output in `assets/` + `../docs/assets/`.
- `scripts/export-static-package.mjs` - freezes Markdown + HTML + JSON + SVG +
  scripts into `exports/<date>-boring-receipts-lab/` with SHA-256 manifests.
- `receipt-template.yaml` - structured receipt skeleton.
- `receipt-template.md` - human-readable receipt skeleton (for PR/Discord).
- `receipts/` - completed receipts, one file per run.
- `GLOSSARY.md` - plain definitions of the terms used *in a receipt* (tok/s, pp/tg,
  TTFT, ITL, quant, ngl, VRAM peak, power…). The human layer that lets a beginner
  distrust a number. Research vocabulary lives in [`https://github.com/sztlink/turboquant-cuda-bench/blob/main/GLOSSARY.md`](https://github.com/sztlink/turboquant-cuda-bench/blob/main/GLOSSARY.md).
- `DRAFT-waffle-message.md` - outreach drafts (clay, **not** posted without approval).

## Engines & regimes

A receipt is **engine-aware**. Single-stream and serving are not comparable:

- **llama.cpp** - single-stream: pp tok/s, tg tok/s (`llama-bench`).
- **vLLM / SGLang / TensorRT-LLM** - serving: aggregate output tok/s, requests/s,
  TTFT, ITL under concurrency (`vllm bench` / `benchmark_serving.py`).

Reporting a single "tok/s" without the regime is the hype this lab refuses.

## Nodes

| node | machine | engine | status |
|---|---|---|---|
| AYA-3090 | felipe-pc, Windows, RTX 3090 24 GB | llama.cpp (native) | live ✅ |
| AYA-3090-wsl | felipe-pc, WSL2 Ubuntu | vLLM / SGLang | available, not set up |
| AYA-4090 | RTX 4090, Win+WSL2 | vLLM (installed) | later - LLM-busy |
| AYA2 | NUC, CPU-only | - | not an inference node |

## Why this exists

Most inference "benchmarks" are claims you can't re-run: a tok/s number with no
commit, no flags, no context length, no quality check. The llama.cpp issue
[#18722](https://github.com/ggml-org/llama.cpp/issues/18722) asked for a canonical
minimal KV/long-context receipt and was closed **not planned** - so nobody owns it.
Boring Receipts fills that vacuum: every number ships with the exact command, build,
hardware, and a quality gate, so you can re-run it and check. **Boring = reproducible
= trustworthy.**

## Receipts

The full library + the six findings are in **[SUMMARY.md](SUMMARY.md)**. Good ones
to start with:

- **R6 - flash-attn × context** - the free flag whose win *scales* with context
  (~3× decode at 64K). [`receipts/2026-05-23-3090-llama31-8b-flash-attn-context-curve.md`](receipts/2026-05-23-3090-llama31-8b-flash-attn-context-curve.md)
- **R10 - Qwen quant ladder** - the Q4/Q5/Q8 speed↔quality↔VRAM trade-off, and how
  it generalizes across models. [`receipts/2026-05-23-3090-qwen25-7b-quant-ladder.md`](receipts/2026-05-23-3090-qwen25-7b-quant-ladder.md)
- **R3 - context wall** - why "128K context!" hides a ~20 t/s decode on a 3090.
  [`receipts/2026-05-23-3090-llama31-8b-context-sweep.md`](receipts/2026-05-23-3090-llama31-8b-context-sweep.md)
- **R4 - KV-quant BLOCKED** - a failure reproduction is still a receipt.
  [`receipts/2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md`](receipts/2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md)

12 runtime receipts (R1–R12) over a **5-model library, 7.25B–14.77B** (Mistral,
Qwen2.5-7B/14B, Llama-3.1-8B, Gemma-2-9B), plus RS1/RS2 research-sibling receipts
citing the RealRAG/EPKV probe family in
[turboquant-cuda-bench](https://github.com/sztlink/turboquant-cuda-bench). All under
`receipts/`. Next rungs climb from here; we don't jump to the top.

Important null result: **RS2 at N=500 is NO DELTA**. The small gated-rerank gain did
not scale, and the receipt says so. Negative, blocked and no-delta receipts are
first-class evidence, not footnotes. See `NEGATIVES.md`.

## Guardrails

- No remote build/benchmark without Felipe's `[CONFIRMAR:INFRA]`.
- No posting without Felipe's explicit visual approval.
- Unknown repos/containers require inspection and sandboxing.
- 3090 is the first validation node; 4090 stays strategic.
- This is a TurboQuant/Waffle front, not a crypto-income thesis.

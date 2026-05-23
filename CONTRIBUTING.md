# Contributing a receipt

> Send branch + command shape. We return boring receipts.
> Reproducible first, interesting second.

There are two ways to get a receipt into the lab.

## 1. Send a branch + command shape (lightest)

Open an issue (or ping) with: a repo/branch (or release), the **exact command**,
and the model + quant. A node validator runs it and returns a receipt — commit,
flags, driver, VRAM, tok/s split prefill/decode, quality gate, failures. No need to
route it through your own repo. Nodes today: AYA-3090 (live), AYA-4090 (later).

## 2. Run it yourself and submit the receipt

1. Copy `receipt-template.yaml` (+ `receipt-template.md` for the readable version).
2. Fill **every** field you can (see required set below). Leave unknowns `null` —
   never guess.
3. Put the file in `receipts/` as `YYYY-MM-DD-<node>-<model>-<axis>.md`.
4. If it's a sweep/curve, generate a delta sheet (`scripts/generate-delta-sheets.mjs`
   pattern) and embed the SVG; keep an ASCII version in the text for terminals.
5. Open a PR.

## Required fields (the honesty floor)

A receipt without these is a benchmark claim, not a receipt:

- **target**: engine, repo/branch/**commit**, build id + build flags (or "official prebuilt release")
- **environment**: OS, driver, CUDA, GPU, VRAM total, **dedicated_mode** + resident processes + idle baseline
- **model**: name, quant, size, params, **source URL** (and GGUF sha256 if you have it)
- **command**: the exact command line that produced the numbers
- **results**: pp/tg t/s (single-stream) *or* output t/s + req/s + TTFT + ITL (serving), with **reps and stddev**
- **quality gate**: a smoke / PPL-delta / needle / KVFidelity — or an explicit `n/a` with the reason
- **caveats** and **next step**

## Reproducibility & determinism (why no seed/temperature)

These receipts measure **throughput and footprint** with `llama-bench`, and
**perplexity** with `llama-perplexity`. Both are **deterministic** given the same
build, model file, and command — there is no sampling, so **seed and temperature do
not apply** (they only matter for generation-*quality* evals that sample, which
would declare them explicitly). Reproducibility here is pinned by:

- the exact **build id** (e.g. `b9286 99d4026b1`) + build flags,
- the **model GGUF source** (HF URL; sha256 is welcome for full provenance),
- the **exact command** and **reps** (stddev shows run-to-run variance — that *is*
  the statistical measure for a stable benchmark; no p-value is meaningful for a
  deterministic kernel measured 5×).

Anyone with the same build + GGUF + command gets the same numbers on the same GPU.
That is the whole point.

## What stays out

The probe / evidence-utilization / RAG family (rank, decoys, distractor taxonomy,
prompt scaffolds) is a research program with its own genealogy — it lives in the
[research sibling](https://github.com/sztlink/turboquant-cuda-bench) and is **cited,
not absorbed** into the runtime axes here (see `AXES.md`).

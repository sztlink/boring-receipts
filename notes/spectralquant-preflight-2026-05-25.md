# SpectralQuant preflight — `Dynamis-Labs/spectralquant`

Date: 2026-05-25  
Repo inspected: [`Dynamis-Labs/spectralquant`](https://github.com/Dynamis-Labs/spectralquant)  
Local clone: `/tmp/pi-github-repos/Dynamis-Labs/spectralquant`  
HEAD: `19ebecb`

## Question

Iván Baldo commented in `ggml-org/llama.cpp#20977` that SpectralQuant should be compared against actual TurboQuant implementations, not only a QJL paper variant, and that the existing evidence should include real evaluations and longer contexts such as 128k.

This preflight asks whether the public SpectralQuant repo gives Boring Receipts a runnable branch/command shape comparable to our local TurboQuant+ receipts.

## Short answer

The repo is **not** a drop-in `llama.cpp` / vLLM runtime branch.

It is a Python/PyTorch research repo with:

- `src/spectralquant/` core library;
- experiment scripts under `experiments/`;
- JSON evidence under `results/`;
- a dependency on `DevTechJr/turboquant_cutile` for the TurboQuant baseline;
- several audit docs that explicitly qualify many claims as local-baseline / paper-valid / blocked.

So the immediate useful response is not “I ran SpectralQuant on 3090.” The useful response is: **a fair runnable comparison needs a defined experiment script, model, context, and baseline; current public repo appears to compare against a local TurboQuant/cuTile baseline rather than an actual `llama.cpp`/TurboQuant+ runtime path.**

## What exists

Quick-start from the README:

```bash
git clone https://github.com/dynamis-labs/spectralquant.git
cd spectralquant
pip install -e ".[dev]"

mkdir -p baseline
git clone https://github.com/DevTechJr/turboquant_cutile.git baseline/turboquant_cutile

PYTHONPATH=src python experiments/run_memory_efficiency.py --quick
```

Stated requirements:

- Python >= 3.10
- PyTorch >= 2.2
- CUDA GPU
- experiments ran on NVIDIA B200

Key code surfaces:

| file | role |
|---|---|
| `src/spectralquant/engine.py` | `SpectralQuantEngine`, subclasses `TurboQuantEngine`; replaces rotation/codebooks/PyTorch fallback paths |
| `src/spectralquant/spectralquant.py` | standalone pipeline and local `TurboQuantBaseline` |
| `src/spectralquant/selective_qjl.py` | selective QJL and full-QJL baseline |
| `experiments/run_memory_efficiency.py` | headline memory/cosine comparison |
| `experiments/run_v3_ppl_niah_v2.py` | PPL + NIAH, monkey-patches HF attention/cache path |
| `experiments/run_longbench.py` / `neurips_llama_full.py` | LongBench-style evaluation |

## What does not appear to exist

No obvious public branch path for:

- `llama.cpp` integration;
- vLLM production `Cache` subclass;
- a `llama-server`-style runtime flag;
- 128k/long-context serving benchmark on 3090/4090;
- an actual TheTom TurboQuant+ runtime comparison.

The repo is therefore not directly comparable to our existing Boring Receipts runtime receipts without designing an experiment adapter.

## Evidence / caveats found in the repo itself

The repo contains a strong internal `docs/claims_discipline.md`. It explicitly blocks or qualifies several broad claims:

- “Beats official TurboQuant implementation” is blocked; the repo uses a **local TurboQuant baseline** unless official Google TurboQuant is run.
- “End-to-end serving speedup” is blocked without deployment/kernel benchmark evidence.
- “LongBench improvement” is blocked for n=5/task unless rerun at larger n.
- “NIAH 10/10” is marked limited until rerun with documented protocol.
- PPL artifacts with identical many-digit values across fp16/TQ/SQ are treated with suspicion and require longer-context/per-step rerun.

This is useful: the repo authors themselves are trying to prevent overclaiming.

## Context lengths observed

Public JSONs and README-visible evidence mostly cover short contexts / small evaluation slices:

- `results/seqlen_sweep/seqlen_sweep.json`: 128–2048 tokens.
- `results/neurips/neurips_qwen7b_ppl.json`: ctx 1024 and 2048.
- `results/v3/v3_niah_llama_v2.json`: includes 4096 and 8192 token NIAH records.
- `results/v3/v3_longbench.json`: n=5 per task in the inspected artifact.

I did not find a public 128k runtime evaluation path in the inspected repo tree.

## Relation to our current TurboQuant+ data

Our closest already-published local runtime receipt is R18:

- [`receipts/2026-05-23-3090-qwen36-a3b-turboquant-kld.md`](../receipts/2026-05-23-3090-qwen36-a3b-turboquant-kld.md)

R18 used an actual TurboQuant+ Windows CUDA prebuilt (`tqp-v0.1.1`, commit printed `4d24ad8`) on RTX 3090 with public Qwen3.6-35B-A3B Q8_0 GGUF.

Short-context KLD/PPL at ctx512:

| KV | PPL | mean KLD | same top p |
|---|---:|---:|---:|
| q8_0/q8_0 | 6.199884 | 0.005043 | 97.010 |
| turbo3/turbo3 | 6.318517 | 0.020667 | 93.529 |

PPL-only at ctx16K:

| KV | PPL |
|---|---:|
| f16/f16 | 5.0291 |
| q8_0/q8_0 | 5.0247 |
| turbo3/turbo3 | 5.0736 |

The ctx16K KLD path failed for harness/logit-file scaling reasons, recorded as a harness constraint rather than a quality failure.

## Fair response shape for `llama.cpp#20977`

A safe reply would be:

```md
Agree that the comparison target should be runnable implementations, not only the QJL paper variant.

I took a first look at `Dynamis-Labs/spectralquant` (HEAD `19ebecb`). It looks like a Python/PyTorch research repo with experiment harnesses and a local `turboquant_cutile` baseline, not a drop-in `llama.cpp` or vLLM runtime branch. Its own `claims_discipline.md` also qualifies several broad claims: official TurboQuant superiority, production speedup, LongBench improvement, and 128k-style runtime claims are not established by the current public artifacts.

Relevant local TurboQuant+ datapoint I do have: actual TurboQuant+ Windows CUDA prebuilt on RTX 3090, public Qwen3.6-35B-A3B Q8_0 GGUF. At ctx512 KLD/PPL vs f16 baseline:

| KV | PPL | mean KLD | same top p |
|---|---:|---:|---:|
| q8_0/q8_0 | 6.199884 | 0.005043 | 97.010 |
| turbo3/turbo3 | 6.318517 | 0.020667 | 93.529 |

ctx16K PPL-only:

| KV | PPL |
|---|---:|
| f16/f16 | 5.0291 |
| q8_0/q8_0 | 5.0247 |
| turbo3/turbo3 | 5.0736 |

Receipt: https://github.com/sztlink/boring-receipts/blob/main/receipts/2026-05-23-3090-qwen36-a3b-turboquant-kld.md

So yes: the useful next step is a long-context receipt against runnable code. I don’t yet see a SpectralQuant runtime branch comparable to `llama.cpp`/TurboQuant+; if someone defines the exact script/model/context/baseline from the repo, I can run/receipt that shape on 3090/4090.
```

Do not post without Felipe approval.

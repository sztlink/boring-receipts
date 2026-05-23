# Boring Receipt - `2026-05-23-3090-llama31-8b-quant-sweep-dedicated` (R2b)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **rung** | 2 - quant sweep, **dedicated mode** |
| **node** | AYA-3090 (Ampere) |
| **date** | 2026-05-23 |
| **supersedes-as-baseline** | R2 (shared mode) - both preserved |

R2b re-runs the weight-quant sweep in **dedicated mode**. The delta sheet
(`assets/delta-sheet-rung2-quant-sweep.svg`) is generated from these dedicated
numbers - the clean canonical baseline.

## Results - dedicated mode

| quant | tg t/s | pp t/s | VRAM peak | PPL (gate) |
|---|---|---|---|---|
| Q4_K_M | 131.76 | 4455 | 5.6 GiB | 7.5002 (+2.3%) |
| Q5_K_M | 118.74 | 4346 | 6.3 GiB | 7.3948 (+0.9%) |
| Q8_0 | 89.80 | 4621 | 8.7 GiB | 7.3285 (ref) |

`gate-v1` (PPL Δ < 5% vs Q8) → **PASS**. PPL is reused from R2 - it is
deterministic and does not depend on background load, so it was not re-measured.

## Dedicated vs shared (the finding holds across quants)

| quant | tg dedicated | tg shared (R2) | Δ | VRAM Δ |
|---|---|---|---|---|
| Q4 | 131.76 | 131.90 | −0.1% | −0.5 GiB |
| Q5 | 118.74 | 118.66 | +0.1% | −0.4 GiB |
| Q8 | 89.80 | 90.30 | −0.6% | −0.5 GiB |

Throughput is identical within noise; VRAM is ~0.4–0.5 GiB lower across the board
(the freed resident process). **An idle background load is a capacity tax, not a
speed tax** - consistent with R1b.

## Environment

| field | value |
|---|---|
| OS / driver / CUDA | Windows 11 Pro / 566.14 / 12.7 runtime (12.4 build) |
| GPU | RTX 3090 (compute 8.6), 24575 MiB |
| build | llama.cpp b9286 (`99d4026b1`), prebuilt win-cuda-12.4 |
| model | Meta-Llama-3.1-8B-Instruct, KV f16 |
| **dedicated mode** | **true** · **resident loads: none** · **idle 687 MiB / 45 W** |
| reps | 5 (throughput) |

## Command

```
llama-bench.exe -m {Q4_K_M,Q5_K_M,Q8_0}.gguf -ngl 99 -p 512 -n 128 -r 5
# gate (deterministic, reused from R2): llama-perplexity -f wiki.test.raw
```

## What this receipt does not prove

- It does not prove a universal leaderboard result; it proves this command shape on the stated node, runtime, model, quant, context and driver stack.
- It does not prove serving readiness, multi-GPU behavior, other operating systems, other drivers or other model families unless explicitly compared here.
- If the quality gate is marked `n/a` or not exercised, it does not prove behavioral preservation beyond the stated smoke or measurement scope.
- It does not replace the research/probe body in `turboquant-cuda-bench`; it is the public reproducibility card for this run.

## Next step

The KV-dtype axis (`-ctk q8_0 -ctv q4_0 -fa on`) re-run against this clean
dedicated baseline - the TurboQuant-relevant rung.

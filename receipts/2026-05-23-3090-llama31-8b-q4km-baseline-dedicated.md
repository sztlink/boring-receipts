# Boring Receipt — `2026-05-23-3090-llama31-8b-q4km-baseline-dedicated` (R1b)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **rung** | 1 — noob, **dedicated mode** |
| **node** | AYA-3090 (Ampere) |
| **date** | 2026-05-23 |
| **supersedes-as-baseline** | R1 (`...-q4km-baseline.md`, shared mode) — both preserved |

R1b re-runs the rung-1 baseline with the GPU in **dedicated mode** (no ComfyUI or
other resident process). R1 was generated on a shared workstation. Both are true,
each tagged with its machine state — R1b is the clean baseline future rungs
(flash-attn, vLLM) compare against.

## Results — dedicated vs shared

| metric | R1b dedicated | R1 shared | Δ |
|---|---|---|---|
| pp512 t/s | 4455.45 ± 89.96 | ~4448 | ~0% |
| tg128 t/s | 131.76 ± 0.41 | 131.55 ± 0.10 | +0.2% |
| VRAM peak | **5.6 GiB** (5744 MiB) | 6.1 GiB (6259 MiB) | **−515 MiB** |
| idle VRAM | 687 MiB | 1202 MiB | −515 MiB |
| idle power | 45 W | 43 W | ~0 |

## The boring finding

An **idle resident GPU process (ComfyUI, ~515 MiB) costs VRAM headroom but not
throughput.** Decode is memory-*bandwidth*-bound; an idle process consumes no
bandwidth, only static VRAM. So `dedicated_mode` matters for **capacity** (the max
context / batch that fits — see the context sweep, where 128K f16-KV already
OOM-stalled) and **not** for tok/s. This is the number nobody documents because it
looks obvious — but the specific figure (~0% speed, −515 MiB) wasn't written down
anywhere.

## Environment

| field | value |
|---|---|
| OS / driver / CUDA | Windows 11 Pro / 566.14 / 12.7 runtime (12.4 build) |
| GPU | RTX 3090 (compute 8.6), 24575 MiB |
| build | llama.cpp b9286 (`99d4026b1`), prebuilt win-cuda-12.4 |
| model | Meta-Llama-3.1-8B-Instruct Q4_K_M, KV f16 |
| **dedicated mode** | **true** |
| **resident loads** | **none** (ComfyUI closed) |
| **idle VRAM** | **687 MiB** (system + display only) |
| **idle power** | **45 W** |
| reps | 5 |

## Command

```
llama-bench.exe -m Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf -ngl 99 -p 512 -n 128 -r 5
```

## Quality gate

n/a for a pure baseline (throughput/footprint). PPL is in R2/R2b.

## Next step

R2b (dedicated quant sweep) confirms the same finding across Q5/Q8. Then rung 3
(source build + flash-attn) and the KV-dtype axis, both compared against this clean
dedicated baseline.

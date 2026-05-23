# Boring Receipt — `2026-05-23-3090-qwen25-7b-quant-ladder` (R10)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **rung** | 2 — quant sweep, **second model**, dedicated mode |
| **node** | AYA-3090 (Ampere) |
| **date** | 2026-05-23 |
| **axis** | weight quant Q4/Q5/Q8 on **Qwen2.5-7B** — does the Llama R2b trade-off generalize? |

R10 repeats the R2b weight-quant sweep on a different architecture (Qwen2.5-7B
instead of Llama-3.1-8B) to test whether the trade-off shape is a property of
quantization or of one model.

## Qwen2.5-7B quant ladder (fa on, dedicated)

| quant | size | pp512 t/s | tg128 t/s | VRAM peak | PPL | Δ-PPL vs Q8 |
|---|---|---|---|---|---|---|
| Q4_K_M | 4.36 GiB | 5382 | **144.0** | 5.0 GiB | 8.0193 | +1.5% |
| Q5_K_M | 5.07 GiB | 5252 | 132.4 | 5.7 GiB | 7.9355 | +0.6% |
| Q8_0 | 7.54 GiB | 5617 | 100.2 | 8.0 GiB | 7.9001 | ref |

## Reading — the shape generalizes, the quality cost does not

**Same shape as Llama (R2b):** decode falls hard with bits (Q4→Q8 −30.4%, vs
Llama's −31.5%), prefill stays flat/noisy (5382/5252/5617 — Q8 even highest, well
within noise; bits don't touch compute-bound prefill), VRAM grows with bits. So the
speed/footprint trade-off is a property of *quantization*, not of one model. Good —
the boring rule travels.

**But the quality cost differs by model.** Q4's PPL penalty vs Q8 is **+1.5% on
Qwen** but **+2.3% on Llama-3.1-8B (R2b)**. Same quant scheme, different model
tolerance — Qwen2.5-7B takes Q4 with less measurable degradation than Llama did.
This is exactly why the gate is *per-receipt and contestable*: "Q4 is fine" is a
model-specific claim, not a universal one. The number has to be measured, not
assumed.

(Reminder: PPL compared *within* a model across quants — valid. Across models —
not; different tokenizers.)

## Environment

| field | value |
|---|---|
| OS / driver / CUDA | Windows 11 Pro / 566.14 / 12.7 runtime (12.4 build) |
| GPU | RTX 3090 (compute 8.6), 24575 MiB |
| build | llama.cpp b9286 (`99d4026b1`), prebuilt win-cuda-12.4 |
| model | Qwen2.5-7B-Instruct (bartowski GGUF), KV f16, `-fa 1` |
| dedicated mode | true · resident: none · idle ~580 MiB |
| reps | 5 (throughput) |

## Command

```
llama-bench.exe -m Qwen2.5-7B-Instruct-{Q4_K_M,Q5_K_M,Q8_0}.gguf -ngl 99 -p 512 -n 128 -fa 1 -r 5
llama-perplexity.exe -m <each> -f wiki.test.raw -ngl 99 -fa 1
```

## Quality gate

gate-v1 (PPL Δ < 5% vs Q8) → **PASS** for all (Q4 +1.5%, Q5 +0.6%). On Qwen even a
1%-tolerance gate would pass Q4 — unlike Llama, where Q4 (+2.3%) fails a 1% bar.

## Next step

Two-model quant evidence now exists (R2b Llama, R10 Qwen). The open frontier stays
KV-dtype (BLOCKED on prebuilt, R4). A cross-model task gate would let quality be
compared properly across the library.

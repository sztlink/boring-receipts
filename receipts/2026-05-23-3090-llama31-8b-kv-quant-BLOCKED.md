# Boring Receipt — `2026-05-23-3090-llama31-8b-kv-quant-BLOCKED` (R4)

> Send branch + command shape. We return boring receipts.
> A failure reproduction is still a receipt.

| field | value |
|---|---|
| **rung** | 4-prep — KV-dtype axis (the TurboQuant-relevant one) |
| **node** | AYA-3090 (Ampere) |
| **date** | 2026-05-23 |
| **status** | **BLOCKED** — quantized-KV path hangs on this prebuilt build |

## What was attempted

Re-run the context curve with a **quantized KV cache** — `-fa 1 -ctk q8_0 -ctv q4_0`
— to measure the TurboQuant-relevant payoff: does quantizing the KV cache buy back
VRAM headroom (so 128K fits) and decode speed in long context?

## What happened

Two runs hung with **zero output** for >35 min each, then had to be killed:

```
# attempt 1 (hung):
llama-bench -m Llama-3.1-8B-Q4_K_M.gguf -ngl 99 -p 512 -n 128 -d 0,16384,65536 -fa 1 -ctk q8_0 -ctv q4_0 -r 2
# attempt 2 (hung, even at low depth):
llama-bench ... -d 0,16384 -fa 1 -ctk q8_0 -ctv q4_0 -r 2
```

## Isolation — it is NOT flash-attn, it IS the KV quantization

A bounded control proves the cause:

| config | result |
|---|---|
| `-fa 1` alone (no KV quant) | **works**, faster — see R5 (pp512 5000 t/s) |
| `-fa 1 -ctk q8_0 -ctv q4_0` | **hangs** indefinitely, no output |

So flash attention is fine; the **quantized-KV CUDA kernel path** in the official
prebuilt `b9286` win-cuda-12.4 binary deadlocks on this RTX 3090 / Windows 11 setup.

## Caveat / honest scope

This is a finding about **the prebuilt Windows CUDA binary on this specific box** —
not a claim that KV quantization is broken in llama.cpp generally. It very likely
works from a **source build** (different CUDA arch flags / kernel selection). The
boring point: anyone reaching for KV-cache quantization on the stock Windows
prebuilt should expect this hang and budget a source build.

## Next step

Unblock requires a source build of llama.cpp with the quantized-KV CUDA path
enabled for SM86 (3090), or the Ada node (4090). Until then the KV-dtype axis —
the heart of the TurboQuant comparison — stays BLOCKED here. Flash-attn (R5) and
weight-quant (R2b) carry the speed story in the meantime.

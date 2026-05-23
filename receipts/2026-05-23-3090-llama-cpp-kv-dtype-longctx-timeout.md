# Boring Receipt - `2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout` (R15)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **PARTIAL / TIMEOUT / negative delta** |
| **node** | AYA-3090 |
| **date** | 2026-05-23 |
| **requested by** | szt.link internal validation after R14 |

## Claim

The long-context KV dtype curve does not rescue the patched-source result from R14.

`K=q8_0 / V=q8_0` completes the full 0→64K curve, but is slower than f16 KV at every
measured depth, with decode penalty increasing as context grows. `K=q8_0 / V=q4_0`
becomes pathological: it completes 0, 4K and 16K, then does not emit the 32K row
before a 7200 s outer timeout.

This is not a TurboQuant win. It is a public negative receipt for this exact patched
llama.cpp build, hardware and command shape.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build |
| regime | single-stream `llama-bench`, long-context depth sweep |
| repo | `https://github.com/ggml-org/llama.cpp` |
| tag | `b9286` |
| commit | `99d4026` |
| local patch | `GGML_CUDA_USE_PDL` guard raised from CUDA 11.8 to CUDA 12.0 |
| axis | KV dtype × context depth |
| depths | 0, 4096, 16384, 32768, 65536 |
| KV variants | f16/f16, q8_0/q8_0, q8_0/q4_0 |

## Environment

| field | value |
|---|---|
| node | AYA-3090 / felipe-pc |
| host | `Sztutman` |
| GPU | NVIDIA GeForce RTX 3090, 24576 MiB |
| driver | 566.14 |
| idle VRAM before run | 617 MiB |
| GPU util before run | 0% |
| CUDA toolkit | v11.8 |
| Visual Studio | VS2019 BuildTools, MSVC 19.29.30156.0 |
| Windows SDK tools | 10.0.22621.0 `rc.exe` and `mt.exe` |
| model | `Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf` |

## Command shape

```powershell
llama-bench.exe \
  -m C:\Users\user\boring\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
  -ngl 99 -fa 1 -ctk <K> -ctv <V> \
  -p 512 -n 128 -d 0,4096,16384,32768,65536 -r 2 -o jsonl
```

The outer SSH/Pi command timed out or disconnected during the `q8_0/q4_0` variant.
On follow-up inspection, the run had emitted only partial q8/q4 rows and the stderr
ended with `EXIT -1`; the 3090 had returned to idle.

## Result

### Complete variants

| depth | f16/f16 pp512 | q8/q8 pp512 | q8/q8 pp vs f16 | f16/f16 tg128 | q8/q8 tg128 | q8/q8 tg vs f16 |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 4881.33 | 4633.67 | 0.949x | 140.24 | 128.91 | 0.919x |
| 4096 | 4191.39 | 3985.50 | 0.951x | 128.11 | 113.57 | 0.886x |
| 16384 | 2888.81 | 2712.36 | 0.939x | 103.59 | 84.26 | 0.813x |
| 32768 | 1990.28 | 1835.78 | 0.922x | 82.75 | 60.79 | 0.735x |
| 65536 | 1220.14 | 1143.60 | 0.937x | 58.54 | 40.18 | 0.686x |

Reading:

- q8/q8 does not beat f16 at any measured depth.
- Its decode penalty gets worse with depth: 0.92x at depth 0, 0.69x at 64K.
- Prefill penalty is smaller and fairly stable, around 0.92x to 0.95x.

### Partial q8/q4 variant

| depth | q8/q4 pp512 | pp vs f16 | q8/q4 tg128 | tg vs f16 |
|---:|---:|---:|---:|---:|
| 0 | 206.80 | 0.042x | 76.03 | 0.542x |
| 4096 | 14.01 | 0.003x | 7.64 | 0.060x |
| 16384 | 3.07 | 0.001x | 1.71 | 0.017x |
| 32768 | no row / exited `-1` | n/a | no row / exited `-1` | n/a |
| 65536 | not reached | n/a | not reached | n/a |

Reading:

- q8/q4 is not merely slower in this build. It becomes unusable as context grows.
- The 16K decode value is 1.71 tok/s, compared with 103.59 tok/s for f16.
- The run did not produce a 32K row before ending with `EXIT -1`.

## Quality gate

| field | value |
|---|---|
| gate version | `kv-dtype-longctx-v1` |
| runtime criterion | all KV variants complete all depths and emit JSONL rows |
| runtime passed | **false** for q8/q4 |
| quality criterion | deferred because runtime gate failed |
| speed-win criterion | quantized KV must beat or trade clearly against f16 at depth |
| speed-win passed | **false** |

## Evidence

Primary artifacts:

```txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/bench-longctx.cmd
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/f16-f16.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/q8_0-q8_0.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/q8_0-q4_0.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/q8_0-q4_0.stderr.txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/timeout-note.txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/summary.json
```

The same local patch and binary evidence from R14 are included again:

```txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/pdl-disable.patch
logs/2026-05-23-3090-llama-cpp-kv-dtype-longctx-timeout/binary-manifest.txt
```

## What this receipt does not prove

- It does not prove that KV-cache quantization is universally bad.
- It does not test upstream-clean CUDA 12.x builds.
- It does not test Hopper, where PDL behavior may matter.
- It does not include a quality probe, because the runtime gate failed first.
- It does not prove memory-capacity benefit or lack of benefit, only speed and
  completion behavior under this command.

## Caveats

- This is still a patched-source receipt, not an upstream-clean receipt.
- q8/q4 ended with `EXIT -1`, so the 32K and 64K q8/q4 cells are absent/not
  reached, not measured numbers.
- The result should redirect work away from this exact q8/q4 path, not close the
  larger KV dtype or TurboQuant question.

## Next step

Do not keep looping this command shape. The next useful technical move is either:

1. test an upstream-clean CUDA 12.x build of the same commit or newer commit; or
2. inspect the q4 V CUDA path before benchmarking it again.

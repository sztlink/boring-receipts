# Boring Receipt - `2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch` (R14)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **PASS, negative delta** |
| **node** | AYA-3090 |
| **date** | 2026-05-23 |
| **requested by** | szt.link internal validation after R4/R13 |

## Claim

The KV-cache dtype axis can be measured on AYA-3090 if llama.cpp is built from
source with a CUDA 11.8 compatible local patch that disables host-side PDL compile
usage.

The runtime result is not a win on this setup. `K=q8_0 / V=q8_0` runs, but is
slower than f16 KV on decode. `K=q8_0 / V=q4_0` runs, but is much slower on both
prefill and decode under this command shape.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build |
| regime | single-stream `llama-bench` |
| repo | `https://github.com/ggml-org/llama.cpp` |
| tag | `b9286` |
| commit | `99d4026` |
| local patch | change `GGML_CUDA_USE_PDL` guard from `CUDART_VERSION >= 11080` to `CUDART_VERSION >= 12000` |
| build flags | `-DGGML_CUDA=ON -DLLAMA_CURL=OFF -DCMAKE_CUDA_ARCHITECTURES=86` |
| benchmark axis | f16 KV vs `K=q8_0 / V=q8_0` vs `K=q8_0 / V=q4_0`, flash-attn on |

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
| model size | 4,912,898,304 bytes |
| params | 8,030,261,312 |

## Why a local patch was needed

The R13 source build first failed in the Windows toolchain environment. That was
fixed by using a confirmed VS2019 developer shell plus explicit Windows SDK paths.

The next blocker was CUDA 11.8 compatibility. The selected llama.cpp tag compiled a
host-side PDL path guarded at `CUDART_VERSION >= 11080`, but the available CUDA 11.8
headers did not expose `cudaLaunchKernelEx` for this build. On RTX 3090, PDL is not
used at runtime because the device is Ampere, not Hopper.

The local patch only raises that guard to CUDA 12.0:

```diff
-#if !defined(GGML_USE_HIP) && !defined(GGML_USE_MUSA) && CUDART_VERSION >= 11080
+#if !defined(GGML_USE_HIP) && !defined(GGML_USE_MUSA) && CUDART_VERSION >= 12000
 #    define GGML_CUDA_USE_PDL
-#endif  // !defined(GGML_USE_HIP) && !defined(GGML_USE_MUSA) && CUDART_VERSION >= 11080
+#endif  // !defined(GGML_USE_HIP) && !defined(GGML_USE_MUSA) && CUDART_VERSION >= 12000
```

This makes the result a patched-source receipt, not an upstream-clean source
receipt.

## Command shape

Build:

```powershell
call "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\Common7\Tools\VsDevCmd.bat" -arch=x64 -host_arch=x64
set PATH=C:\Program Files (x86)\Windows Kits\10\bin\10.0.22621.0\x64;C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin;%PATH%
cmake -S . -B build -G "NMake Makefiles" \
  -DCMAKE_BUILD_TYPE=Release \
  -DGGML_CUDA=ON \
  -DLLAMA_CURL=OFF \
  -DCMAKE_CUDA_COMPILER="C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v11.8/bin/nvcc.exe" \
  -DCMAKE_RC_COMPILER="C:/Program Files (x86)/Windows Kits/10/bin/10.0.22621.0/x64/rc.exe" \
  -DCMAKE_MT="C:/Program Files (x86)/Windows Kits/10/bin/10.0.22621.0/x64/mt.exe" \
  -DCMAKE_CUDA_ARCHITECTURES=86
cmake --build build --config Release
```

Benchmark, repeated once per KV pair:

```powershell
llama-bench.exe \
  -m C:\Users\user\boring\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
  -ngl 99 -fa 1 -ctk <K> -ctv <V> -p 512 -n 128 -r 5 -o jsonl
```

## Result

All three KV pairs completed with exit code 0.

| KV dtype | pp512 t/s | pp vs f16 | tg128 t/s | tg vs f16 |
|---|---:|---:|---:|---:|
| K=f16, V=f16 | 4893.22 | 1.000x | 140.00 | 1.000x |
| K=q8_0, V=q8_0 | 4745.13 | 0.970x | 128.82 | 0.920x |
| K=q8_0, V=q4_0 | 190.14 | 0.039x | 76.42 | 0.546x |

Interpretation:

- `K=q8_0 / V=q8_0` is runnable, but not faster in this single-stream short-context
  test.
- `K=q8_0 / V=q4_0` is runnable, but severely regresses throughput here.
- The prebuilt R4 hang is not reproduced in this patched source build.
- This does not validate a TurboQuant win. It validates the axis and records a
  negative delta for this exact software/hardware/command shape.

## Quality gate

| field | value |
|---|---|
| gate version | `kv-dtype-runtime-v1` |
| build gate | source build produces `llama-bench.exe` and `llama-cli.exe --version` reports `99d4026` |
| runtime gate | each KV pair exits 0 and writes JSONL rows for pp512 and tg128 |
| quality gate | not run in this receipt |
| passed | **true for build/runtime, false for any speed-win claim** |

## Evidence

Primary artifacts:

```txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/build.cmd
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/bench.cmd
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/pdl-disable.patch
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/CMakeCache.txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/llama-cli-version.txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/binary-manifest.txt
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/f16-f16.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/q8_0-q8_0.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/q8_0-q4_0.jsonl
logs/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch/summary.json
```

Version proof:

```txt
version: 1 (99d4026)
built with MSVC 19.29.30156.0 for Windows AMD64
```

## What this receipt does not prove

- It does not prove that upstream-clean llama.cpp builds with CUDA 11.8 on Windows.
- It does not prove that KV-cache quantization is bad in general.
- It does not measure long-context behavior, where KV footprint can matter more.
- It does not include a quality/perplexity smoke for changed KV dtype.
- It does not compare against CUDA 12.x or a Hopper GPU where PDL may matter.

## Caveats

- This is a patched-source receipt. The local patch must travel with the evidence.
- The test is short-context single-stream `llama-bench`, not serving.
- The q4 V result is a strong negative signal under this exact command, but it should
  be retested with long context before closing the KV dtype axis.

## Next step

Run a long-context KV dtype curve with the same binary, then add a small quality gate
so memory savings, speed and answer stability are judged together.

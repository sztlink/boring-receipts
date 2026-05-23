# Boring Receipt - `2026-05-23-3090-llama-cpp-source-build-cuda-BLOCKED` (R13)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **BLOCKED** |
| **node** | AYA-3090 |
| **date** | 2026-05-23 |
| **requested by** | szt.link internal validation after R4 |

## Claim

The next move after R4 was to unblock the KV-cache dtype axis by building a fresh
llama.cpp source checkout with CUDA on the AYA-3090 node.

That did not reach benchmarking. The source-build attempt is blocked at CMake/toolchain
configuration before `llama-bench.exe` is produced.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build |
| regime | build preflight for single-stream `llama-bench` |
| repo | `https://github.com/ggml-org/llama.cpp` |
| branch | `master` |
| commit | `b0df4c0` |
| build flags | `-DGGML_CUDA=ON -DLLAMA_CURL=OFF` |
| intended generator | `NMake Makefiles` after Visual Studio generator failed to find CUDA toolset |
| intended benchmark | f16 KV vs `K=q8_0 / V=q8_0` vs `K=q8_0 / V=q4_0`, flash-attn on |

## Environment

| field | value |
|---|---|
| node | AYA-3090 / felipe-pc |
| host | `Sztutman` |
| GPU | NVIDIA GeForce RTX 3090, 24576 MiB |
| driver | 566.14 |
| idle VRAM | 609 MiB |
| GPU util | 0% |
| Visual Studio | 2022 Community, MSVC 19.41.34120 |
| CMake | `C:\Program Files\CMake\bin\cmake.exe` |
| CUDA toolkit | v11.8, `nvcc.exe` present |
| model staged | `C:\Users\user\boring\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf` |

## Command shape

Source was cloned to:

```txt
C:\Users\user\boring\kvdtype-source-build-20260523\llama.cpp
```

NMake configure attempt:

```powershell
cmake -S . \
  -B "C:\Users\user\boring\kvdtype-source-build-20260523\llama.cpp\build-nmake-cuda-release" \
  -G "NMake Makefiles" \
  -DCMAKE_BUILD_TYPE=Release \
  -DGGML_CUDA=ON \
  -DLLAMA_CURL=OFF \
  -DCMAKE_CUDA_COMPILER="C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin\nvcc.exe"
```

Intended benchmark if build succeeded:

```powershell
llama-bench.exe \
  -m C:\Users\user\boring\models\Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf \
  -ngl 99 -p 512 -n 128 -fa 1 -r 3

llama-bench.exe ... -ctk q8_0 -ctv q8_0
llama-bench.exe ... -ctk q8_0 -ctv q4_0
```

## Result

No benchmark result. Build preflight failed.

Observed blockers:

1. Visual Studio generator path found MSVC but CMake reported no CUDA toolset.
2. NMake generator path found CUDA and MSVC but failed the simple C compiler link
   test because the Windows SDK resource/manifest tools were not available in the
   effective environment:

```txt
-- Check for working C compiler: ... cl.exe - broken
-- Configuring incomplete, errors occurred!
...
--mt=CMAKE_MT-NOTFOUND
...
RC Pass 1: command "rc ... manifest.rc" failed
no such file or directory
```

## Quality gate

| field | value |
|---|---|
| gate version | `build-preflight-v1` |
| signal | source build must produce `llama-bench.exe` before any KV dtype claim |
| criterion | CMake configure + build complete, `llama-bench.exe --version` runs |
| passed | **false** |

## Evidence

Primary log:

```txt
logs/2026-05-23-3090-llama-cpp-source-build-blocked/build-attempt.txt
logs/2026-05-23-3090-llama-cpp-source-build-blocked/summary.json
```

Relevant excerpt:

```txt
GIT branch=master commit=b0df4c0
STEP cmake-configure :: cmake.exe ... -G "NMake Makefiles" ... -DGGML_CUDA=ON
-- Check for working C compiler: ... cl.exe - broken
--mt=CMAKE_MT-NOTFOUND
RC Pass 1: command "rc ... manifest.rc" failed
BORING_KV_SOURCE_FAILED step cmake-configure failed
```

## What this receipt does not prove

- It does not prove that fresh llama.cpp cannot build on Windows or on AYA-3090.
- It does not prove that KV-cache quantization is still blocked in source builds.
- It does not measure f16, q8/q8 or q8/q4 KV runtime performance.
- It only proves that this source-build command shape did not get past the current
  Windows CMake/MSVC/CUDA environment.

## Caveats

- The prior prebuilt R4 blocker remains the runtime blocker.
- This receipt is a build-environment blocker, not a model/runtime blocker.
- The next attempt should avoid another blind CMake loop and first repair the build
  environment with an explicit Windows SDK `rc.exe`/`mt.exe` path or a known-good
  developer shell.

## Next step

Do not rerun the same command. Fix the build environment first:

```txt
1. verify Windows SDK rc.exe and mt.exe paths;
2. run CMake from a confirmed VsDevCmd environment where rc and mt resolve;
3. if Visual Studio CUDA integration is absent, use NMake or install/use Ninja only after environment preflight;
4. only then rerun the KV dtype benchmark.
```

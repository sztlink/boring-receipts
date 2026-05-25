# Boring Receipt - `2026-05-24-4090-ds4-pr243-turbo3-cuda-build-regression` (R24)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **BUILD_AND_CUDA_REGRESSION_PASS__NO_MODEL_BENCH** |
| **node** | AYA-4090 |
| **date** | 2026-05-24 |
| **requested by** | Felipe / TheTom ds4#243 validation thread |

## Claim

`antirez/ds4#243` / TheTom's `--kv-cache turbo3` CUDA path builds on an RTX 4090 WSL2 host with CUDA 13.0 pip toolchain, when compiled explicitly for `sm_89`, and its CUDA long-context regression smoke passes while the existing vLLM service remains resident.

This receipt is a **build + CUDA regression validation only**. It does not validate DS4 model throughput, PPL/KLD, or TurboQuant quality because the DS4 Flash model target requires a much larger memory class than this WSL2 4090 environment exposes.

## Upstream target

| field | value |
|---|---|
| repo | `antirez/ds4` |
| PR | `#243` — `Add --kv-cache turbo3 (TurboQuant+ 3-bit KV cache, CUDA + Metal)` |
| PR URL | https://github.com/antirez/ds4/pull/243 |
| checkout | `pr-243-turbo3` |
| commit | `5eb01d5` — `Style: terse comments matching surrounding ds4.c voice` |

## Host

| field | value |
|---|---|
| host | AYA-4090 / `DESKTOP-CTAHC6D` |
| OS | WSL2 Ubuntu-24.04 |
| kernel | `6.6.114.1-microsoft-standard-WSL2` |
| GPU | NVIDIA GeForce RTX 4090 |
| driver | `595.79` |
| WSL visible RAM | `31Gi` total, `27Gi` available at start |
| live service | `VLLM-AutoStart` left running; ~22GiB resident VRAM |

## Build environment

Reused the local CUDA 13.0 toolchain previously installed for the vLLM TurboQuant build:

```txt
CUDA_HOME=/home/felipe/vllm-lab/venv-tq-fresh-20260515/lib/python3.12/site-packages/nvidia/cu13
nvcc release 13.0, V13.0.88
gcc 13.3.0
```

The build used the 4090-specific architecture flag, not the PR's `cuda-spark` `sm_120` target:

```txt
make cuda CUDA_ARCH=sm_89 CUDA_HOME=$CU \
  CUDA_LDLIBS="-lm -Xcompiler -pthread -L$CU/lib -L/usr/lib/wsl/lib -lcudart -lcublas" -j2
```

## Result

Build output binaries:

```txt
ds4         11M
ds4-agent   11M
ds4-bench  9.9M
ds4-eval    11M
ds4-server  11M
```

CUDA regression:

```txt
./tests/cuda_long_context_smoke
ds4: CUDA backend initialized on NVIDIA GeForce RTX 4090 (sm_89)
cuda-regression: top-k n_comp=32768 n_tokens=32 elapsed=0.003s
cuda long-context regression: OK
```

Final marker:

```txt
RESULT build_and_cuda_regression_ok
```

## What this is / is not

This is useful feedback for the DS4 TurboQuant PR because it checks that the CUDA code path compiles and that the included CUDA regression runs on a consumer Ada GPU (`sm_89`), not only on the PR author's GB10/`sm_120` target.

It is **not** a throughput reproduction of the PR's GX10/GB10 numbers.

It is **not** a quality reproduction of the PR's PPL/KLD/top-k agreement numbers.

It did **not** stop or alter the live AYA-4090 vLLM service.

## Logs

```txt
logs/2026-05-24-4090-ds4-pr243-turbo3-cuda-build-regression/build-and-cuda-regression.log
```

Remote build path:

```txt
/home/felipe/ds4-lab/ds4-pr243
/home/felipe/ds4-lab/ds4-pr243-4090-20260524-232701.log
```

## Next useful variants

1. Post a short PR comment with this build/regression result if Felipe approves external posting.
2. If a suitable DS4 Flash model target becomes available for the 4090/WSL2 memory envelope, run `ds4-bench` `fp8` vs `turbo3`.
3. If TheTom wants coverage beyond Ada, repeat the build/regression on the 3090 (`sm_86`) without touching the long-running AIME job.

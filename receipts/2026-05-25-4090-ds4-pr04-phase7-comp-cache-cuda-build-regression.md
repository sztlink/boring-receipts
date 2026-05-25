# Boring Receipt - `2026-05-25-4090-ds4-pr04-phase7-comp-cache-cuda-build-regression` (R25)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **BUILD_AND_CUDA_REGRESSION_PASS__NO_MODEL_BENCH** |
| **node** | AYA-4090 |
| **date** | 2026-05-25 |
| **requested by** | Felipe / TheTom ds4 phase7 comp-cache follow-up |

## Claim

TheTom's `ds4` branch `pr/04-phase7-comp-cache`, the follow-up branch that extends TurboQuant+ compression to the DS4 comp-cache pool, builds on an RTX 4090 WSL2 host with CUDA 13.0 when compiled for `sm_89`, and its CUDA long-context regression smoke passes while the existing vLLM service remains resident.

This receipt is a **build + CUDA regression validation only**. It does not validate DS4 model throughput, PPL/KLD, comp-cache memory savings, or long-context quality because the DS4 Flash model target requires a much larger memory class than this WSL2 4090 environment exposes.

## Upstream target

| field | value |
|---|---|
| upstream repo | `TheTom/ds4` |
| branch | `pr/04-phase7-comp-cache` |
| branch URL | https://github.com/TheTom/ds4/tree/pr/04-phase7-comp-cache |
| related PR | `antirez/ds4#243` |
| related PR URL | https://github.com/antirez/ds4/pull/243 |
| commit | `ea322b5` — `Phase 7.4: drop float comp pool, pack stage->packed directly` |

## Why this branch matters

In `antirez/ds4#243`, antirez asked whether the initial raw-cache-only `turbo3` PR saves only a small fraction of total memory at high context. TheTom answered with `pr/04-phase7-comp-cache`, reporting ~73-77% total KV memory savings when both `--kv-cache turbo3` and `--comp-cache turbo3` are active.

This receipt checks that the follow-up branch at least builds and passes the included CUDA regression on consumer Ada (`sm_89`).

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

```txt
CUDA_HOME=/home/felipe/vllm-lab/venv-tq-fresh-20260515/lib/python3.12/site-packages/nvidia/cu13
nvcc release 13.0, V13.0.88
gcc 13.3.0
```

Build command shape:

```txt
make cuda CUDA_ARCH=sm_89 CUDA_HOME=$CU \
  CUDA_LDLIBS="-lm -Xcompiler -pthread -L$CU/lib -L/usr/lib/wsl/lib -lcudart -lcublas" -j2
```

## Result

Build output binaries:

```txt
ds4         11M
ds4-agent   12M
ds4-bench   11M
ds4-eval    12M
ds4-server  12M
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

This is useful as **cross-hardware build/regression coverage** for TheTom's DS4 comp-cache compression follow-up on an Ada consumer GPU.

It is **not** a reproduction of TheTom's reported GB10/Spark memory savings.

It is **not** a quality result for `--kv-cache turbo3 --comp-cache turbo3`.

It did **not** stop or alter the live AYA-4090 vLLM service.

## Logs

```txt
logs/2026-05-25-4090-ds4-pr04-phase7-comp-cache-cuda-build-regression/build-and-cuda-regression.log
```

Remote build path:

```txt
/home/felipe/ds4-lab/ds4-pr04-phase7-comp-cache
/home/felipe/ds4-lab/ds4-pr04-4090-20260525-000433.log
```

## Next useful variants

1. Post a short follow-up comment in `antirez/ds4#243` with this branch validation.
2. If a small model/test fixture appears, run a true `--kv-cache turbo3 --comp-cache turbo3` quality/footprint check.
3. When AYA-3090 is free, repeat build/regression on `sm_86` for Ampere coverage.

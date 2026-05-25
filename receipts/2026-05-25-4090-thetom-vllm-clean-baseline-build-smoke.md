# Boring Receipt - `2026-05-25-4090-thetom-vllm-clean-baseline-build-smoke` (R27)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **CLEAN_BUILD_AND_SERVER_SMOKE_PASS__NO_SERVICE_CHANGE** |
| **node** | AYA-4090 |
| **date** | 2026-05-25 |
| **requested by** | Felipe / clean TheTom vLLM baseline split |

## Claim

A clean checkout of `TheTom/vllm-turboquant@36fc048255d0bbdab05811d667182a965fe05936`, built in a separate WSL2 virtualenv on AYA-4090, can import vLLM, start an OpenAI-compatible server on a separate port (`11436`), select the TurboQuant attention backend with `kv_cache_dtype=turboquant_k8v4`, and answer a deterministic arithmetic smoke prompt.

The existing `VLLM-AutoStart` scheduled task and its port `11435` were not modified. This clean baseline server was started manually for the smoke and then stopped; it was not installed as an autostart service.

## Why this receipt exists

The historical AYA-4090 vLLM service is useful but not clean upstream evidence. It was `TheTom/vllm-turboquant@36fc048` plus `sztlink` EPKV/sampler/backend overlays. This receipt creates the separate baseline required by the rule:

> Only call something an upstream TheTom bug if it reproduces on a clean TheTom checkout without `sztlink` overlays.

## Target

| field | value |
|---|---|
| upstream repo | `https://github.com/TheTom/vllm-turboquant` |
| commit | `36fc048255d0bbdab05811d667182a965fe05936` |
| local source | `/home/felipe/vllm-lab/vllm-turboquant-clean-20260525` |
| local venv | `/home/felipe/vllm-lab/venv-tq-clean-20260525` |
| build mode | editable install, separate venv |
| live service changed | no |
| `VLLM-AutoStart` changed | no |
| clean server left running | no |

Clean checkout verification:

```txt
git status --short   # empty
git rev-parse HEAD   # 36fc048255d0bbdab05811d667182a965fe05936
no vllm/v1/attention/evidence_paged_kv directory
```

## Host

| field | value |
|---|---|
| host | AYA-4090 / `DESKTOP-CTAHC6D` |
| OS | WSL2 Ubuntu-24.04 |
| kernel | `6.6.114.1-microsoft-standard-WSL2` |
| GPU | NVIDIA GeForce RTX 4090 |
| driver | `595.79` |
| initial VRAM | `202 MiB / 24564 MiB` |

## Build environment

```txt
Python: 3.12.3
Torch: 2.11.0+cu130
CUDA nvcc: 13.0.88
TORCH_CUDA_ARCH_LIST=8.9
MAX_JOBS=4
```

Build result:

```txt
vllm 0.19.2rc1.dev341+g36fc04825
TQ_IMPORT_OK
```

## Server smoke

Server command shape:

```txt
python -m vllm.entrypoints.openai.api_server \
  --host 0.0.0.0 \
  --port 11436 \
  --model Qwen/Qwen2.5-7B-Instruct \
  --served-model-name thetom-clean qwen2.5-7b-tq-clean \
  --kv-cache-dtype turboquant_k8v4 \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.82 \
  --enforce-eager \
  --hf-overrides '{"rope_scaling":{"rope_type":"yarn","factor":4.0,"original_max_position_embeddings":32768}}' \
  --generation-config vllm \
  --disable-uvicorn-access-log
```

Intentional clean env:

- TriAttention V3 variables retained to match the TheTom runtime class.
- `VLLM_EPKV_*` variables unset.
- No `sztlink` EPKV directory or sampler patches present.

Observed server logs:

```txt
kv_cache_dtype=turboquant_k8v4
Using max model len 8192
Using TURBOQUANT attention backend out of potential backends: ['TURBOQUANT']
TriAttention V3 worker init: layers=28 heads=28 kv=4 head_dim=128 ... budget=2048 window=128 prefix=128
```

Local WSL smoke:

```txt
/health: OK
/v1/models: thetom-clean, qwen2.5-7b-tq-clean
prompt: Compute 17 * 23. Answer with just the number.
answer: 391
```

LAN smoke from AYA2 via existing portproxy `11436`:

```txt
http://192.168.15.133:11436/health: OK
/v1/models: thetom-clean, qwen2.5-7b-tq-clean
chat answer: 391
```

Peak observed during smoke:

```txt
NVIDIA GeForce RTX 4090, 20280 MiB / 24564 MiB, util 100%, temp 36C
```

After stopping the clean server:

```txt
NVIDIA GeForce RTX 4090, 202 MiB / 24564 MiB, util 0%, temp 36C
```

## What this is / is not

This is a build + import + server smoke receipt for a clean TheTom vLLM baseline.

It is **not** a performance benchmark.

It is **not** a quality evaluation.

It does **not** claim the historical `sztlink` overlay behavior is upstream.

It does **not** change the default 4090 service. In fact, the default `VLLM-AutoStart` service was already not running before this receipt; this smoke used port `11436` and a separate manual process.

## Logs

```txt
logs/2026-05-25-4090-thetom-vllm-clean-baseline-build-smoke/
├── thetom-clean-vllm-4090.sh
├── thetom-clean-build-smoke-20260525-140119.log
├── thetom-clean-server-20260525-140119.log
├── thetom-clean-models-20260525-140119.json
├── thetom-clean-chat-request-20260525-140119.json
└── thetom-clean-chat-response-20260525-140119.json
```

Remote artifacts:

```txt
/home/felipe/vllm-lab/vllm-turboquant-clean-20260525
/home/felipe/vllm-lab/venv-tq-clean-20260525
/home/felipe/vllm-lab/clean-baseline-logs/thetom-clean-build-smoke-20260525-140119.log
/home/felipe/vllm-lab/clean-baseline-logs/thetom-clean-server-20260525-140119.log
```

## Next useful variants

1. If needed, turn the build recipe into a concise upstream build note for RTX 4090 / WSL2 / CUDA 13.0.
2. Run a minimal clean bug/perf reproduction only when there is a concrete target.
3. If the default 4090 vLLM service should be restored, do it separately with explicit `[CONFIRMAR:INFRA] reiniciar VLLM-AutoStart na AYA-4090`.

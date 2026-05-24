# Boring Receipt - `2026-05-24-3090-aime26-smoke-huihui-qwen36-27b-abl-q4km` (R20)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **AIME_SMOKE_5_OF_5_WITH_REASONING_OFF** |
| **node** | AYA-3090 |
| **date** | 2026-05-24 |
| **requested by** | Felipe / Bunn ablation-context discussion |

## Claim

The Huihui Qwen3.6-27B abliterated Q4_K_M GGUF is a strong local AIME smoke candidate on a single RTX 3090 **when server reasoning mode is disabled**.

This is not an exact reproduction of Bunn's result. Bunn reported BF16 Qwen3.6-27B ablation models on AIME '26 I & II with a 30k-token budget. This receipt is a local 24GB-GPU GGUF smoke test on the first five AIME 2026 problems.

## Model acquisition

The model was staged through Unraid after Windows `curl`/`hf download` attempts proved brittle.

| field | value |
|---|---|
| staging host | Unraid `AYA1` |
| staging path | `/mnt/user/boring-models/staging/huihui-qwen3.6-27b-abliterated-q4_k_m.gguf` |
| transfer path | `http://10.10.10.10:18080/...` to `felipe-pc` |
| final path | `C:\Users\user\boring\models\huihui-qwen3.6-27b-abliterated-q4_k_m.gguf` |
| final size | `16,547,399,328` bytes |
| source repo | `googlecs/Huihui-Qwen3.6-27B-abliterated-Q4_K_M-GGUF` |

## Dataset

| field | value |
|---|---|
| dataset | `math-ai/aime26` |
| local file | `data/aime26/aime2026.jsonl` |
| size | 30 problems |
| smoke subset | first 5 problems |

## Target

| field | value |
|---|---|
| engine | llama.cpp source build |
| binary | `llama-server.exe` |
| host | `felipe-pc` / AYA-3090 |
| model | `huihui-qwen3.6-27b-abliterated-q4_k_m.gguf` |
| KV dtype | `K=f16 / V=f16` |
| flash-attn | on |
| ctx | `32768` |
| max completion tokens | `4096` |
| temperature | `0` |
| seed | `42` |

## Command shape that worked

```txt
llama-server.exe \
  -m C:\Users\user\boring\models\huihui-qwen3.6-27b-abliterated-q4_k_m.gguf \
  -ngl 99 -fa on -ctk f16 -ctv f16 \
  -c 32768 --host 127.0.0.1 --port 18021 -np 1 \
  --alias huihui-qwen36-27b-abl-q4km --jinja --slots \
  --reasoning off
```

Each problem was submitted through `/v1/chat/completions` with a fixed prompt requiring final answer as `\boxed{NNN}`.

## Result: reasoning off

| # | expected | predicted | result | elapsed | completion tokens |
|---:|---:|---:|---|---:|---:|
| 1 | 277 | 277 | PASS | 22s | 887 |
| 2 | 62 | 62 | PASS | 66s | 2378 |
| 3 | 79 | 79 | PASS | 40s | 1277 |
| 4 | 70 | 70 | PASS | 92s | 2822 |
| 5 | 65 | 65 | PASS | 39s | 1165 |

Summary:

```txt
5 / 5 correct
```

## Negative control: default reasoning mode

A prior run with default/auto reasoning mode did **not** produce usable answers within `4096` completion tokens:

```txt
0 / 5 scored
finish_reason: length
content: empty
reasoning_content: filled
```

This is an important harness finding: for Qwen3.6 reasoning models through llama-server, the reasoning channel can consume the whole token budget while leaving `content` empty. For this local smoke, `--reasoning off` is required.

## Comparison to R19 local baseline

| model | config | AIME26 smoke score |
|---|---|---:|
| Qwen2.5-14B-Instruct-Q4_K_M | f16 KV, reasoning n/a | 2 / 5 |
| Huihui-Qwen3.6-27B-abliterated-Q4_K_M | f16 KV, `--reasoning off` | 5 / 5 |

This is not a stock-vs-ablated comparison yet; it is a strong local signal that the Huihui ablated 27B candidate is worth the full stock-vs-ablated R21 run.

## Logs

```txt
logs/2026-05-24-3090-aime26-smoke-huihui-qwen36-27b-abl-q4km/
├── reasoning-on/
│   ├── run.log
│   ├── server.err.log
│   ├── results.jsonl
│   └── remote-SUMMARY.md
└── reasoning-off/
    ├── run.log
    ├── server.err.log
    ├── results.jsonl
    └── remote-SUMMARY.md
```

## Interpretation

- The AIME axis immediately surfaced a useful model-serving tweak: disable Qwen reasoning mode for bounded smoke scoring.
- Huihui Qwen3.6-27B abliterated Q4_K_M materially outperformed the existing Qwen2.5-14B local baseline on the same first five problems.
- This contextualizes Bunn's claim in the same direction but does not reproduce it exactly: precision, prompt, full 30-problem set, and stock Qwen3.6-27B comparison are still missing.

## Next step

R21 should run stock Qwen3.6-27B Q4_K_M against the same five-problem smoke, then expand both stock and Huihui to all 30 AIME 2026 problems if the smoke comparison is meaningful.

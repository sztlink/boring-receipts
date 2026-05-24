# Boring Receipt - `2026-05-24-3090-aime26-smoke-stock-vs-huihui-qwen36-27b-q4km` (R21)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **SMOKE_TIE_5_OF_5_STOCK_AND_HUIHUI** |
| **node** | AYA-3090 |
| **date** | 2026-05-24 |
| **requested by** | Felipe / Bunn ablation-context discussion |

## Claim

On the first five AIME 2026 problems, local Q4_K_M GGUF smoke testing does **not** distinguish stock Qwen3.6-27B from Huihui Qwen3.6-27B abliterated: both scored **5/5** under the same serving shape with `--reasoning off`.

This contextualizes Bunn's claim but does not reproduce it exactly. Bunn reported BF16 ablation variants over AIME '26 I & II with a 30k-token budget; this receipt is a local 24GB-GPU GGUF smoke comparison on a five-problem subset.

## Model acquisition notes

| model | source | final path | size |
|---|---|---|---:|
| stock Qwen3.6-27B Q4_K_M | `unsloth/Qwen3.6-27B-GGUF` | `C:\Users\user\boring\models\Qwen3.6-27B-Q4_K_M.gguf` | `16,817,244,384` |
| Huihui abliterated Q4_K_M | `googlecs/Huihui-Qwen3.6-27B-abliterated-Q4_K_M-GGUF` | `C:\Users\user\boring\models\huihui-qwen3.6-27b-abliterated-q4_k_m.gguf` | `16,547,399,328` |

Unraid staging worked well for the Huihui model. The stock model was ultimately downloaded directly to `felipe-pc`; the first Unraid `/mnt/user/boring-models` attempt produced an I/O-error artifact and should not be used as a canonical path until cleaned up.

## Dataset

| field | value |
|---|---|
| dataset | `math-ai/aime26` |
| local file | `data/aime26/aime2026.jsonl` |
| size | 30 problems |
| smoke subset | first 5 problems |

## Common serving shape

```txt
llama-server.exe \
  -m <model> \
  -ngl 99 -fa on -ctk f16 -ctv f16 \
  -c 32768 --host 127.0.0.1 --port <port> -np 1 \
  --alias <alias> --jinja --slots \
  --reasoning off
```

Each problem was submitted through `/v1/chat/completions` with a fixed prompt requiring final answer as `\boxed{NNN}`.

## Result

| # | expected | stock Qwen3.6-27B | Huihui abliterated | result |
|---:|---:|---:|---:|---|
| 1 | 277 | 277 | 277 | both PASS |
| 2 | 62 | 62 | 62 | both PASS |
| 3 | 79 | 79 | 79 | both PASS |
| 4 | 70 | 70 | 70 | both PASS |
| 5 | 65 | 65 | 65 | both PASS |

Summary:

```txt
stock Qwen3.6-27B Q4_K_M: 5 / 5
Huihui abliterated Q4_K_M: 5 / 5
Qwen2.5-14B Q4_K_M baseline from R19: 2 / 5
```

## Timing / token budget

| model | #1 | #2 | #3 | #4 | #5 |
|---|---:|---:|---:|---:|---:|
| stock Qwen3.6-27B | 23s / 906 tok | 84s / 3210 tok | 34s / 1222 tok | 80s / 2729 tok | 117s / 3769 tok |
| Huihui abliterated | 22s / 887 tok | 66s / 2378 tok | 40s / 1277 tok | 92s / 2822 tok | 39s / 1165 tok |

Huihui used fewer completion tokens on problems 2 and 5 in this smoke, but this is not statistically meaningful yet.

## Logs

```txt
logs/2026-05-24-3090-aime26-smoke-stock-qwen36-27b-q4km/
├── run.log
├── server.err.log
├── results.jsonl
└── remote-SUMMARY.md

logs/2026-05-24-3090-aime26-smoke-huihui-qwen36-27b-abl-q4km/
└── reasoning-off/...
```

## Interpretation

- The AIME smoke axis now separates 27B-class Qwen3.6 from the older local Qwen2.5-14B baseline.
- The five-problem smoke does **not** provide evidence that abliterated is better than stock; it only shows that Huihui does not collapse on these first five problems.
- `--reasoning off` remains an important serving tweak for bounded scoring. Without it, Qwen3.6 can fill `reasoning_content` and leave `content` empty until length stop.

## Next step

Run the full 30-problem AIME 2026 set for stock and Huihui with the same harness. Only the full run can meaningfully contextualize Bunn's 80% vs 70% report.

# Boring Receipt - `2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km` (R22)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **STOCK_17_OF_30__HUIHUI_15_OF_30__NO_ABLATED_WIN_LOCAL_GGUF** |
| **node** | AYA-3090 |
| **date** | 2026-05-24 |
| **requested by** | Felipe / Bunn ablation-context discussion |

## Claim

On local 24GB-GPU Q4_K_M GGUF inference, using the same AIME 2026 harness and `--reasoning off`, stock Qwen3.6-27B scored **17/30** and Huihui Qwen3.6-27B abliterated scored **15/30**.

This does **not** reproduce Bunn's direction of ablated > stock. It contextualizes it: under our quantization, server build, prompt, and scoring harness, the stock model slightly outperformed Huihui on the full 30-problem set.

## What this is / is not

This is a local reproducibility/contextualization receipt.

It is **not** a direct reproduction of Bunn because:

- Bunn reports BF16 ablation models; this run uses Q4_K_M GGUF.
- Bunn used a 30k-token budget; this run uses 4096 completion tokens per problem.
- Prompt and harness may differ.
- We use llama.cpp server with `--reasoning off` because default reasoning mode can consume the full token budget into `reasoning_content` and leave `content` empty.

## Dataset

| field | value |
|---|---|
| dataset | `math-ai/aime26` |
| local file | `data/aime26/aime2026.jsonl` |
| size | 30 problems |

## Common serving shape

```txt
llama-server.exe \
  -m <model> \
  -ngl 99 -fa on -ctk f16 -ctv f16 \
  -c 32768 --host 127.0.0.1 --port <port> -np 1 \
  --alias <alias> --jinja --slots \
  --reasoning off
```

Prompt shape: fixed AIME prompt requiring final answer as `\boxed{NNN}`. Scorer extracts boxed answer, then falls back to last integer.

## Score

| model | quant | score |
|---|---|---:|
| stock Qwen3.6-27B | Q4_K_M GGUF | **17 / 30** |
| Huihui Qwen3.6-27B abliterated | Q4_K_M GGUF | **15 / 30** |

## Per-problem comparison

| # | expected | stock pred | stock | Huihui pred | Huihui |
|---:|---:|---:|---|---:|---|
| 1 | 277 | 277 | PASS | 277 | PASS |
| 2 | 62 | 62 | PASS | 62 | PASS |
| 3 | 79 | 79 | PASS | 79 | PASS |
| 4 | 70 | 70 | PASS | 70 | PASS |
| 5 | 65 | 65 | PASS | 65 | PASS |
| 6 | 441 | 441 | PASS | 441 | PASS |
| 7 | 396 | 396 | PASS | 396 | PASS |
| 8 | 244 | 244 | PASS | 244 | PASS |
| 9 | 29 | 1 | FAIL | 1 | FAIL |
| 10 | 156 | 3 | FAIL | 120 | FAIL |
| 11 | 896 | 896 | PASS | 32 | FAIL |
| 12 | 161 | 161 | PASS | 161 | PASS |
| 13 | 39 | 1 | FAIL | 5 | FAIL |
| 14 | 681 | 681 | PASS | 1 | FAIL |
| 15 | 83 | 3 | FAIL | 2 | FAIL |
| 16 | 178 | 178 | PASS | 178 | PASS |
| 17 | 243 | 2 | FAIL | 10 | FAIL |
| 18 | 503 | 4 | FAIL | 20 | FAIL |
| 19 | 279 | 279 | PASS | 279 | PASS |
| 20 | 190 | 190 | PASS | 190 | PASS |
| 21 | 50 | 50 | PASS | 50 | PASS |
| 22 | 754 | 4 | FAIL | 754 | PASS |
| 23 | 245 | 245 | PASS | 500 | FAIL |
| 24 | 669 | 1 | FAIL | 9 | FAIL |
| 25 | 850 | 850 | PASS | 850 | PASS |
| 26 | 132 | 0 | FAIL | 1 | FAIL |
| 27 | 223 | 5 | FAIL | 5 | FAIL |
| 28 | 107 | 2 | FAIL | 2 | FAIL |
| 29 | 157 | 0 | FAIL | 3 | FAIL |
| 30 | 393 | 25 | FAIL | 5 | FAIL |

## Logs

```txt
logs/2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km/
├── stock/
│   ├── run.log
│   ├── server.err.log
│   ├── results.jsonl
│   └── remote-SUMMARY.md
└── huihui/
    ├── run.log
    ├── server.err.log
    ├── results.jsonl
    └── remote-SUMMARY.md
```

## Interpretation

- The five-problem smoke was too easy: both 27B models scored 5/5.
- The full set separates them modestly in favor of stock under this local GGUF setup.
- This does not falsify Bunn's BF16 result; it shows the result does not trivially transfer to our Q4_K_M llama.cpp configuration.
- `--reasoning off` remains a serving requirement for this bounded scoring harness.

## Next useful variants

1. Increase completion budget toward Bunn's 30k token budget.
2. Test Q5/UD quantization if storage/VRAM allows.
3. Run a second seed/prompt variant to estimate harness sensitivity.

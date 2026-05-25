# Boring Receipt - `2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on` (R23)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **STOCK_18_OF_30__HUIHUI_15_OF_30__NO_ABLATED_WIN_LOCAL_GGUF_30K_REASONING** |
| **node** | AYA-3090 |
| **date** | 2026-05-25 |
| **requested by** | Felipe / Bunn ablation-context discussion |

## Claim

On local 24GB-GPU Q4_K_M GGUF inference, using the same AIME 2026 harness with `--reasoning on` and `max_tokens=30000`, stock Qwen3.6-27B scored **18/30** and Huihui Qwen3.6-27B abliterated scored **15/30**.

This does **not** reproduce Bunn's direction of ablated > stock. It extends R22: even with a much larger completion budget and reasoning mode enabled, the local Q4_K_M setup still showed stock > Huihui.

## What this is / is not

This is a local reproducibility/contextualization receipt.

It is closer to Bunn's reported shape than R22 because it uses a 30k-token completion budget and `--reasoning on`.

It is still **not** a direct reproduction of Bunn because:

- Bunn reports BF16 ablation models; this run uses Q4_K_M GGUF.
- Bunn's exact prompt, runtime, and scoring harness may differ.
- This uses `llama.cpp` / `llama-server` on a single RTX 3090.
- Many cases reached `finish_reason=length`; answers were scored from `content` when present, otherwise from `reasoning_content`.

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
  --reasoning on
```

Request shape:

```txt
max_tokens: 30000
temperature: 0
top_p: 0.95
seed: 42
stream: false
```

Prompt shape: fixed AIME prompt requiring final answer as `\boxed{NNN}`. Scorer extracts boxed answer, then falls back to `final answer`, then last integer. For reasoning-mode responses, scorer uses `message.content || message.reasoning_content`.

## Score

| model | quant | score | avg elapsed | completion tokens | finish=stop | finish=length |
|---|---|---:|---:|---:|---:|---:|
| stock Qwen3.6-27B | Q4_K_M GGUF | **18 / 30** | 1001s | 814,404 | 15 | 15 |
| Huihui Qwen3.6-27B abliterated | Q4_K_M GGUF | **15 / 30** | 951s | 797,474 | 15 | 15 |

Wall-clock compute represented by per-case elapsed sums:

- stock: ~8.34h
- Huihui: ~7.92h
- combined: ~16.26h

## Per-problem comparison

| # | expected | stock pred | stock | stock finish | Huihui pred | Huihui | Huihui finish |
|---:|---:|---:|---|---|---:|---|---|
| 1 | 277 | 277 | PASS | stop | 277 | PASS | stop |
| 2 | 62 | 62 | PASS | stop | 62 | PASS | stop |
| 3 | 79 | 79 | PASS | stop | 79 | PASS | stop |
| 4 | 70 | 70 | PASS | length | 31 | FAIL | length |
| 5 | 65 | 65 | PASS | stop | 65 | PASS | stop |
| 6 | 441 | 431 | FAIL | length | 65 | FAIL | length |
| 7 | 396 | 396 | PASS | stop | 396 | PASS | stop |
| 8 | 244 | 244 | PASS | stop | 244 | PASS | stop |
| 9 | 29 | 29 | PASS | stop | 1 | FAIL | length |
| 10 | 156 | 180 | FAIL | length | 50 | FAIL | length |
| 11 | 896 |  | FAIL | length | 47 | FAIL | length |
| 12 | 161 | 161 | PASS | stop | 161 | PASS | stop |
| 13 | 39 |  | FAIL | length | 1 | FAIL | length |
| 14 | 681 | 2 | FAIL | length | 681 | PASS | stop |
| 15 | 83 | 10 | FAIL | length | 1 | FAIL | length |
| 16 | 178 | 178 | PASS | stop | 178 | PASS | stop |
| 17 | 243 | 0 | FAIL | length | 0 | FAIL | length |
| 18 | 503 | 503 | PASS | length | 180 | FAIL | length |
| 19 | 279 | 279 | PASS | stop | 279 | PASS | stop |
| 20 | 190 | 190 | PASS | stop | 190 | PASS | stop |
| 21 | 50 | 50 | PASS | stop | 50 | PASS | stop |
| 22 | 754 | 754 | PASS | stop | 754 | PASS | stop |
| 23 | 245 | 7 | FAIL | length | 1 | FAIL | length |
| 24 | 669 | 0 | FAIL | length | 669 | PASS | stop |
| 25 | 850 | 850 | PASS | length | 850 | PASS | stop |
| 26 | 132 | 132 | PASS | stop | 0 | FAIL | length |
| 27 | 223 | 223 | PASS | stop | 48 | FAIL | length |
| 28 | 107 | 37 | FAIL | length | 2 | FAIL | length |
| 29 | 157 | 6 | FAIL | length | 1 | FAIL | length |
| 30 | 393 | 1 | FAIL | length | 2 | FAIL | length |

## Comparison with R22

R22 used the same local Q4_K_M models with `--reasoning off` and `max_tokens=4096`:

| receipt | serving | stock | Huihui |
|---|---|---:|---:|
| R22 | `--reasoning off`, `max_tokens=4096` | 17/30 | 15/30 |
| R23 | `--reasoning on`, `max_tokens=30000` | 18/30 | 15/30 |

Observed local delta from R22 to R23:

- stock: +1 problem
- Huihui: no score change
- direction: still stock > Huihui

## Logs

```txt
logs/2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on/
├── stock/
│   ├── config.json
│   ├── run.log
│   ├── server.err.log
│   ├── results.jsonl
│   └── SUMMARY.md
└── huihui/
    ├── config.json
    ├── run.log
    ├── server.err.log
    ├── results.jsonl
    └── SUMMARY.md
```

Remote roots:

```txt
C:\Users\user\boring\aime26-r23b-full-stock-qwen36-27b-q4km-30k-reasoning-on-curl
C:\Users\user\boring\aime26-r23b-full-huihui-qwen36-27b-abl-q4km-30k-reasoning-on-curl
```

## Interpretation

- The local GGUF result continues not to show Huihui/abliterated outperforming stock.
- Increasing budget from 4096 to 30000 tokens improved stock by one problem and did not improve Huihui's aggregate score.
- `finish=length` remained common: 15/30 for both models. This means the run is expensive and still budget-limited on hard cases, even at 30k completion tokens.
- The result should be framed as **local Q4_K_M contextual evidence**, not a BF16 claim.

## Next useful variants

1. Do not keep expanding token budget blindly; many cases already hit 30k.
2. If storage/VRAM allows, test a higher-fidelity quant or BF16-like runtime closer to Bunn's setup.
3. If publishing to `club-3090`, phrase narrowly: local GGUF, not direct BF16 reproduction, stock 18/30 vs Huihui 15/30 under reasoning-on 30k.

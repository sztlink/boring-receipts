# Boring Receipt - `2026-05-25-3090-aime26-stock-qwen36-27b-q4km-bounded-gae-4096` (R26)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **BOUNDED_THINKING_12_OF_30__GRAMMAR_FIRED_30_OF_30__LOWER_THAN_NO_THINK** |
| **node** | AYA-3090 |
| **date** | 2026-05-25 |
| **requested by** | `noonghunna/club-3090#221` bounded-thinking follow-up |

## Claim

On local 24GB-GPU Q4_K_M GGUF inference, using stock Qwen3.6-27B on AIME 2026 with `--reasoning on`, `max_tokens=4096`, and a strict GBNF bounded-thinking grammar, the model scored **12/30**.

The grammar structure fired on **30/30** cases, and the reasoning block stayed short by character count, but the score was lower than both prior stock baselines:

- no-think / `--reasoning off` / 4096 tokens: **17/30**
- free-thinking / `--reasoning on` / 30k tokens: **18/30**
- bounded-thinking GAE / `--reasoning on` / 4096 tokens: **12/30**

In this setup, bounded thinking worked as a structural constraint, but did **not** improve AIME math accuracy.

## Important grammar note

This run used a strict local `GOAL/APPROACH/EDGE` grammar (`gae-bounded.llamacpp.gbnf`) rather than the more permissive club-3090 `deepseek-scratchpad.llamacpp.gbnf`.

Reason: a five-case smoke with the DeepSeek scratchpad grammar parsed/fired on most cases, but one case degenerated into repeated `PLAN: 1. 1. 1...` and hit the 4096-token limit before emitting a valid answer. For the full run, the grammar was tightened with bounded line lengths:

```txt
GOAL: <bounded line>
APPROACH: <bounded line>
EDGE: <bounded line>
</think>

<answer text>
```

This makes the receipt a **bounded-thinking GAE arm**, not an exact reproduction of club-3090's recommended DeepSeek scratchpad grammar.

## Dataset

| field | value |
|---|---|
| dataset | `math-ai/aime26` |
| local file | `data/aime26/aime2026.jsonl` |
| size | 30 problems |

## Serving shape

```txt
llama-server.exe \
  -m C:/Users/user/boring/models/Qwen3.6-27B-Q4_K_M.gguf \
  -ngl 99 -fa on -ctk f16 -ctv f16 \
  -c 32768 --host 127.0.0.1 --port 18031 -np 1 \
  --alias stock-qwen36-27b-q4km-bounded-gae \
  --jinja --slots \
  --reasoning on
```

Request shape:

```txt
max_tokens: 4096
temperature: 0
top_p: 0.95
seed: 42
grammar: gae-bounded.llamacpp.gbnf
stream: false
```

Scorer extracts boxed answer, then falls back to `final answer`, then last integer. For reasoning-mode responses, scorer uses `message.content || message.reasoning_content`.

## Score

| arm | score | grammar fired | avg elapsed | completion tokens | finish=stop | finish=length |
|---|---:|---:|---:|---:|---:|---:|
| stock Qwen3.6-27B bounded GAE | **12/30** | **30/30** | 111s | 96,041 | 13 | 17 |

Reasoning block character count, from `message.reasoning_content`:

| min chars | avg chars | max chars |
|---:|---:|---:|
| 108 | 241 | 392 |

## Per-problem results

| # | expected | predicted | result | finish | tokens | grammar |
|---:|---:|---:|---|---|---:|---|
| 1 | 277 | 277 | PASS | stop | 782 | true |
| 2 | 62 | 62 | PASS | stop | 2055 | true |
| 3 | 79 | 79 | PASS | stop | 1199 | true |
| 4 | 70 | 70 | PASS | stop | 2553 | true |
| 5 | 65 | 65 | PASS | stop | 1157 | true |
| 6 | 441 | 441 | PASS | stop | 1147 | true |
| 7 | 396 | 396 | PASS | stop | 3142 | true |
| 8 | 244 | 17 | FAIL | length | 4096 | true |
| 9 | 29 | 2 | FAIL | length | 4096 | true |
| 10 | 156 | 2 | FAIL | length | 4096 | true |
| 11 | 896 | 920 | FAIL | stop | 3831 | true |
| 12 | 161 | 1 | FAIL | length | 4096 | true |
| 13 | 39 | 50 | FAIL | length | 4096 | true |
| 14 | 681 | 5 | FAIL | length | 4096 | true |
| 15 | 83 | 5 | FAIL | length | 4096 | true |
| 16 | 178 | 178 | PASS | stop | 1062 | true |
| 17 | 243 | 0 | FAIL | length | 4096 | true |
| 18 | 503 | 1 | FAIL | length | 4096 | true |
| 19 | 279 | 279 | PASS | stop | 1870 | true |
| 20 | 190 | 190 | PASS | stop | 1794 | true |
| 21 | 50 | 80 | FAIL | length | 4096 | true |
| 22 | 754 | 2 | FAIL | length | 4096 | true |
| 23 | 245 | 2 | FAIL | length | 4096 | true |
| 24 | 669 | 669 | PASS | stop | 3071 | true |
| 25 | 850 | 850 | PASS | stop | 2746 | true |
| 26 | 132 | 0 | FAIL | length | 4096 | true |
| 27 | 223 | 12 | FAIL | length | 4096 | true |
| 28 | 107 | 1 | FAIL | length | 4096 | true |
| 29 | 157 | 1 | FAIL | length | 4096 | true |
| 30 | 393 | 3 | FAIL | length | 4096 | true |

## Three-way comparison

| receipt | stock arm | score | completion budget | note |
|---|---|---:|---:|---|
| R22 | no-think | 17/30 | 4096 | `--reasoning off` |
| R23 | free-thinking | 18/30 | 30000 | 15/30 length finishes |
| R26 | bounded-thinking GAE | 12/30 | 4096 | grammar fired 30/30, lower accuracy |

## Interpretation

- Bounded thinking did constrain the reasoning header: `GOAL/APPROACH/EDGE` appeared on every case, and the reasoning block stayed short.
- It did not eliminate all length finishes because the answer body after `</think>` could still run to 4096 tokens on hard cases.
- The stricter 3-line plan appears too tight or otherwise harmful for AIME 2026 in this setup.
- The result supports a narrow reading: **bounded thinking is a containment tool, but this specific bounded GAE arm did not out-reason no-think on hard math**.

## Logs

```txt
logs/2026-05-25-3090-aime26-stock-qwen36-27b-q4km-bounded-gae-4096/
├── config.json
├── gae-bounded.llamacpp.gbnf
├── run.log
├── server.err.log
├── results.jsonl
└── SUMMARY.md
```

Remote root:

```txt
C:\Users\user\boring\aime26-r24-full-stock-qwen36-27b-q4km-bounded-gae-4096
```

## Next useful variants

1. If `club-3090` wants an exact DeepSeek scratchpad run, first fix the smoke degeneracy or use a larger bounded line/NOTE design that cannot repeat indefinitely.
2. Try bounded GAE at `max_tokens=8192` to distinguish answer-body truncation from reasoning containment.
3. Do not claim bounded-thinking fails in general; this receipt only covers one strict GAE grammar on local Q4_K_M AIME 2026.

# Boring Receipt - `2026-05-24-3090-qwen25-7b-q4q4-server-passkey-negative` (R17b)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **SAFE_HARNESS_RAN__0_OF_9_PASS__SERVER_CTX_CAP_32K** |
| **node** | AYA-3090 |
| **date** | 2026-05-24 |
| **requested by** | Felipe / szt.link |

## Claim

This is the safe follow-up to R17. After the direct `llama-cli` harness proved unsafe, R17b used `llama-server` + bounded HTTP requests to test passkey retrieval without interactive SSH/console-loop risk.

The safe harness ran and cleaned up. It did **not** produce a positive quality result.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build used for R16 |
| binary | `llama-server.exe` |
| host | `felipe-pc` / AYA-3090 |
| model | `Qwen2.5-7B-Instruct-Q4_K_M.gguf` |
| KV dtype | `K=q4_0 / V=q4_0` |
| flash-attn | on |
| requested server ctx | `131072` |
| effective server slot ctx | `32768` |
| API | OpenAI-compatible `/v1/chat/completions` |
| timeout | bounded request timeout, no interactive stdin |

## Command shape

```txt
llama-server.exe \
  -m C:\Users\user\boring\models\Qwen2.5-7B-Instruct-Q4_K_M.gguf \
  -ngl 99 -fa on -ctk q4_0 -ctv q4_0 \
  -c 131072 --host 127.0.0.1 --port 18017 -np 1 \
  --alias r17-qwen25-7b-q4km --jinja --slots
```

The server loaded, then capped the slot:

```txt
slot context (131072) exceeds the training context of the model (32768) - capping
new slot, n_ctx = 32768
```

## Result

| case | prompt tokens / request | position | HTTP | answer | result |
|---|---:|---|---:|---|---|
| 32k-ish-begin | 24,110 | 10% | 200 | repeated distractor words | FAIL |
| 32k-ish-middle | 24,110 | 50% | 200 | repeated distractor words | FAIL |
| 32k-ish-end | 24,110 | 90% | 200 | repeated distractor words | FAIL |
| 64k-ish-begin | ~48,110 | 10% | 400 | context exceeded | BLOCKED |
| 64k-ish-middle | ~48,110 | 50% | 400 | context exceeded | BLOCKED |
| 64k-ish-end | ~48,110 | 90% | 400 | context exceeded | BLOCKED |
| 128k-ish-begin | ~96,110 | 10% | 400 | context exceeded | BLOCKED |
| 128k-ish-middle | ~96,110 | 50% | 400 | context exceeded | BLOCKED |
| 128k-ish-end | ~96,110 | 90% | 400 | context exceeded | BLOCKED |

Summary:

```txt
0 / 9 pass
3 / 9 executed and failed retrieval at ~24k prompt tokens
6 / 9 rejected by server context cap
```

## Logs

```txt
logs/2026-05-24-3090-qwen25-7b-q4q4-server-passkey/
├── run.log
├── server.err.log
├── results.jsonl
└── remote-SUMMARY.md
```

## Interpretation

This receipt separates two things:

1. **Harness safety improved.** `llama-server` + HTTP bounded requests avoided the `llama-cli` interactive-loop failure from R17.
2. **Quality was not demonstrated.** At ~24k prompt tokens, the model did not return the passkey. Above that, this server/model combination capped at 32k despite the requested 131k context.

This does not falsify all long-context retrieval on the 3090. It does falsify this particular safe harness + Qwen2.5-7B-Instruct-Q4_K_M + q4_0/q4_0 server configuration as a positive quality receipt.

## Next useful variant

A better R17c should avoid this cap or change target:

- use the Qwen3.6-35B-A3B model, whose metadata advertises `262144` context, if VRAM/server behavior allows;
- or use `llama-bench`/dedicated passkey tooling that does not cap to training context;
- or reduce the claim to ≤32K and improve the prompt/haystack so a small-context sanity case passes before scaling.

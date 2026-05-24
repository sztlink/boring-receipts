# Boring Receipt - `2026-05-23-3090-qwen36-a3b-turboquant-kld` (R18)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **PARTIAL_PASS_CTX512_KLD / CTX16K_KLD_BLOCKED_BY_LOGIT_BASE_SIZE** |
| **node** | AYA-3090 |
| **date** | 2026-05-23/24 overnight |
| **requested by** | Felipe / Discord thread reproduction |
| **provenance** | upstream/community-adjacent reproduction attempt |

## Claim

The TurboQuant+ Windows CUDA prebuilt can run the public Qwen3.6-35B-A3B Q8_0 GGUF on one RTX 3090 for short-context KLD/PPL checks after supplying missing OpenSSL DLLs.

This receipt is **not** an exact confirmation of the earlier cited numbers. It is an honest reproduction node:

- model used: public `ggml-org/Qwen3.6-35B-A3B-GGUF`, not a private/local Qwen3.5/Qwopus artifact;
- KLD/PPL completed at `ctx=512, chunks=8`;
- the attempted `ctx=16384` KLD-base path failed before producing results, consistent with the enormous `--kl-divergence-base` logit-file scaling for a 248k-token vocabulary;
- additional PPL/performance logs, if present below, are exploratory receipts rather than the original PR claim.

## Target

| field | value |
|---|---|
| engine | TurboQuant+ prebuilt |
| tag | `tqp-v0.1.1` |
| build commit printed | `4d24ad8` |
| binary dir | `C:\Users\user\boring\r18-defilan-pr138\prebuilt` |
| model | `Qwen3.6-35B-A3B-Q8_0.gguf` |
| model source | `ggml-org/Qwen3.6-35B-A3B-GGUF` |
| model file size | `36,903,139,360` bytes |
| model type printed | `qwen35moe 35B.A3B Q8_0` |
| corpus | `wiki.test.raw` |
| GPU | NVIDIA GeForce RTX 3090, 24 GiB |

## Setup caveat

The prebuilt initially failed with Windows loader exit `-1073741515` / `0xC0000135`. `dumpbin /dependents` showed OpenSSL dependencies. Copying `libssl-3-x64.dll` and `libcrypto-3-x64.dll` into the prebuilt directory made the llama binaries launch.

## Command shape: ctx512 KLD

```txt
llama-perplexity.exe -m C:\Users\user\boring\r18-defilan-pr138\models\Qwen3.6-35B-A3B-Q8_0.gguf -f C:\Users\user\boring\wiki.test.raw -c 512 --chunks 8 -ngl 99 -fa on -ctk <f16|q8_0|turbo3> -ctv <f16|q8_0|turbo3> --kl-divergence[-base] C:\Users\user\boring\r18-defilan-pr138\f16_logits_ctx512_chunks8.kld
```

## Result: ctx512 KLD/PPL

| KV | PPL | PPL/base ratio | mean KLD | RMS Δp | Same top p | prompt eval |
|---|---:|---:|---:|---:|---:|---:|
| f16/f16 base | 6.2041 +/- 0.33800 | — | — | — | — | 82.43 tokens per second |
| q8_0/q8_0 | 6.199884 | 1.000918 | 0.005043 | 1.806 | 97.010 | 82.41 tokens per second |
| turbo3/turbo3 | 6.318517 | 1.020070 | 0.020667 | 4.039 | 93.529 | 83.02 tokens per second |

## ctx16K KLD attempt

The direct `--kl-divergence-base` path at `-c 16384 --chunks 8` did not complete.

| field | value |
|---|---|
| status | FAILED |
| observed exit | 9 |
| last phase | started perplexity after model/context allocation |
| likely constraint | base-logit file size scales with `ctx × chunks × vocab`; 16K×8×248k is too large for this host/run shape |

This is recorded as a harness/capacity constraint, not a TurboQuant quality failure.

## Optional ctx16K PPL-only results

| KV | PPL |
|---|---:|
| f16/f16 | 5.0291 +/- 0.04426 |
| q8_0/q8_0 | 5.0247 +/- 0.04420 |
| turbo3/turbo3 | 5.0736 +/- 0.04471 |

## Optional performance bench rows

| KV | test | depth | tok/s |
|---|---:|---:|---:|
| q8_0/q8_0 | tg128 | 0 | 4.98 |
| q8_0/q8_0 | tg128 | 4096 | 3.90 |
| q8_0/q8_0 | tg128 | 8192 | 5.23 |
| q8_0/q8_0 | tg128 | 16384 | 5.03 |
| q8_0/q8_0 | tg128 | 32768 | 4.95 |
| turbo3/turbo3 | tg128 | 0 | 5.01 |
| turbo3/turbo3 | tg128 | 4096 | 4.46 |
| turbo3/turbo3 | tg128 | 8192 | 5.32 |
| turbo3/turbo3 | tg128 | 16384 | 5.25 |
| turbo3/turbo3 | tg128 | 32768 | 5.13 |

## Logs

```txt
logs/2026-05-23-3090-qwen36-a3b-turboquant-kld/
├── f16-base-ctx512-chunks8.log
├── q8-kld-ctx512-chunks8.log
├── turbo3-kld-ctx512-chunks8.log
├── ctx16k-combined.log
├── ppl-f16-ctx16k-chunks8.log          # if completed
├── ppl-q8_0-ctx16k-chunks8.log         # if completed
├── ppl-turbo3-ctx16k-chunks8.log       # if completed
├── bench-q8_0-depths-jsonl.log         # if completed
└── bench-turbo3-depths-jsonl.log       # if completed
```

## Interpretation

- Short-context CUDA KLD receipt completed and is useful for comparison.
- On this public Qwen3.6 model, `turbo3` had materially larger distribution shift than `q8_0` at ctx512.
- The exact long-context KLD reproduction needs a different harness strategy: fewer chunks/tokens, a smaller vocab/model, a larger disk budget for base logits, or a streaming KLD implementation.
- No claim is made here about needle retrieval or long-context answer quality.

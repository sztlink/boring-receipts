# Boring Receipt - `2026-05-23-3090-qwen25-7b-q4q4-needle-harness-blocked` (R17)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **BLOCKED_BY_UNSAFE_LLAMA_CLI_HARNESS** |
| **node** | AYA-3090 |
| **date** | 2026-05-23 |
| **requested by** | Felipe / szt.link |

## Claim

R17 was intended to be the quality counterweight to R16: after proving that a single RTX 3090 could step through 128K, 262K and 524K context with q4_0/q4_0 KV, test whether that context is **useful** with a deterministic needle/passkey-style prompt.

This receipt records that the first R17 attempt is **blocked**, not failed on model quality. The harness choice was unsafe: direct `llama-cli` over SSH entered an interactive/console-loop behavior and left a CUDA process holding VRAM with no useful output. The machine ultimately required a reboot.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build used for R16 |
| host | `felipe-pc` / AYA-3090 |
| model | `Qwen2.5-7B-Instruct-Q4_K_M.gguf` |
| planned KV dtype | `K=q4_0 / V=q4_0` |
| planned flash-attn | on |
| planned contexts | 128K, 262K, optional 524K |
| planned gate | deterministic needle/passkey retrieval |

## What happened

- A smoke/needle attempt was launched via `llama-cli.exe`.
- The process entered interactive/console-loop behavior, repeatedly printing prompts rather than completing a bounded request.
- A CUDA process remained resident with roughly `~5345 MiB` VRAM and `0%` GPU utilization.
- Kill attempts did not clear the process reliably.
- The host was rebooted with Felipe's confirmation.
- After reboot, the 3090 returned to idle: roughly `~498 MiB` VRAM, `0%` utilization, no active `llama-cli`/`llama-bench` compute process.

## Artifacts observed on `felipe-pc`

```txt
C:\Users\user\boring\r17-smoke.txt
C:\Users\user\boring\r17-smoke.out
C:\Users\user\boring\r17-smoke.err
```

Known stuck process observations during the incident:

```txt
llama-cli.exe PID 11924, later PID 999012
VRAM ~5345 MiB
GPU util 0%
```

## Result

| check | result |
|---|---|
| quality answer produced | no |
| deterministic needle/passkey score | not measured |
| model/GPU quality conclusion | none |
| harness conclusion | direct `llama-cli` over SSH is unsafe for this R17 gate |
| infra state after cleanup | recovered by reboot |

## Decision

Do **not** use direct `llama-cli` over SSH for long-context quality tests.

The next R17 attempt must use one of:

1. `llama-server` + bounded HTTP request timeout;
2. a purpose-built child-process harness with hard timeout, stdin closed, output bounded, and process-tree cleanup;
3. a dedicated llama.cpp passkey/NIAH tool if available.

## Interpretation

This is a negative operational receipt. It does not say q4_0/q4_0 KV failed at retrieval. It says the chosen harness failed before a valid quality measurement existed.

R16 remains a capacity receipt. R17 remains open as the quality receipt that should answer: **fits ≠ useful?**

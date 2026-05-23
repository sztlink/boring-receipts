# Request a boring receipt

> Send branch + command shape. We return boring receipts.

This repo is a validation node, not a benchmark leaderboard. The useful request is small, reproducible, and falsifiable.

## What to send

Open an issue, PR, or ping with as many of these fields as possible:

| field | required | notes |
|---|---:|---|
| repo / release | yes | GitHub URL, release page, or archive URL |
| branch / commit | yes for branches | exact commit beats branch name |
| command shape | yes | build command + run command; placeholders are OK if named |
| expected metric | yes | pp/tg, TTFT/ITL, req/s, PPL, KLD, pass/fail, etc. |
| model | yes | model name, size, quant, source URL, context length |
| hardware target | optional | AYA-3090 or AYA-4090; if unspecified we choose the safer lane |
| quality gate | optional but preferred | PPL delta, known prompt, needle, KVFidelity, checksum, or explicit `n/a` |
| baseline | optional | mainline, prior commit, official binary, or your current result |
| caveat to test | optional | e.g. “only fails at 64K”, “requires flash-attn”, “3090 OOM?” |

## Hardware lanes

| lane | node | current role | good for |
|---|---|---|---|
| 3090 | AYA-3090 / `felipe-pc` | llama.cpp runtime receipts | prebuilt/source llama.cpp, quant ladders, context curves, flash-attn, KV dtype |
| 4090 | AYA-4090 | vLLM / strategic receipts | serving runs, RealRAG/EPKV siblings, high-VRAM branch validation |

The lanes do not cross by default. If a request needs both GPUs, the receipt will say why.

## What we return

A boring receipt includes:

- exact repo/branch/commit or release;
- build flags and binary identity;
- OS, driver, CUDA, GPU, VRAM, dedicated/shared state;
- exact command(s);
- raw metric summary with reps/stddev where applicable;
- quality gate result or explicit reason it was not run;
- failures and blockers with the same weight as successes;
- caveats and next step.

## What we will not do

- No private token, credential, or closed dataset validation.
- No “trust me” benchmark claims without command and environment.
- No public hype framing; a no-delta or blocked result is still a valid receipt.
- No production-serving mutation or remote install without explicit infrastructure confirmation.
- No raw per-case dump by default; public artifacts prefer compact summaries, manifests, and commands.

## Minimal request template

```md
### Receipt request

- repo/release:
- branch/commit:
- build command:
- run command:
- model / quant / context:
- expected metric:
- baseline to compare:
- preferred node: AYA-3090 / AYA-4090 / no preference
- quality gate:
- known caveats:
```

If the command is under-specified, the first receipt may be a blocker receipt. That is not a failure; it is the floor being made visible.

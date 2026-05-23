# Boring Receipt - `2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial` (R16)

> Send branch + command shape. We return boring receipts.

| field | value |
|---|---|
| **status** | **PASS to 524K / STALLED at 786K** |
| **node** | AYA-3090 |
| **date** | 2026-05-23 |
| **requested by** | Felipe / szt.link |

## Claim

A small local Qwen model can be pushed well beyond 128K on a single RTX 3090 with
llama.cpp, flash-attn and q4_0/q4_0 KV cache.

This run reached **524,288 context depth** with exit code 0. The next rung,
**786,432**, started but produced no JSONL row; the process was gone by the time it
was inspected and the 3090 had returned to idle. The 1M rung was not reached.

This is a capacity receipt, not a quality receipt. It says what the command could
allocate and step through; it does not prove useful reasoning or retrieval at 524K.

## Target

| field | value |
|---|---|
| engine | llama.cpp source build |
| regime | single-stream `llama-bench`, capacity ramp |
| repo | `https://github.com/ggml-org/llama.cpp` |
| tag | `b9286` |
| commit | `99d4026` |
| local patch | same CUDA 11.8 PDL guard patch used by R14/R15 |
| model | `Qwen2.5-7B-Instruct-Q4_K_M.gguf` |
| params | 7,615,616,512 |
| KV dtype | `K=q4_0 / V=q4_0` |
| flash-attn | on |
| planned depths | 128K, 262K, 524K, 786K, 1M |

## Environment

| field | value |
|---|---|
| node | AYA-3090 / felipe-pc |
| GPU | NVIDIA GeForce RTX 3090, 24576 MiB |
| idle VRAM before run | 496–617 MiB observed around the run |
| CUDA toolkit | v11.8 |
| Visual Studio | VS2019 BuildTools, MSVC 19.29.30156.0 |
| model size | 4,683,074,240 bytes |

## Command shape

Each depth was run as a separate `llama-bench` process to preserve partial results:

```powershell
llama-bench.exe `
  -m C:\Users\user\boring\models\Qwen2.5-7B-Instruct-Q4_K_M.gguf `
  -ngl 99 -fa 1 -ctk q4_0 -ctv q4_0 `
  -p 32 -n 16 -d <depth> -r 1 -o jsonl
```

Depth sequence:

```txt
131072 → 262144 → 524288 → 786432 → 1048576
```

## Result

| depth | status | pp32 tok/s | tg16 tok/s | note |
|---:|---|---:|---:|---|
| 131,072 | PASS | 557.80 | 28.62 | exit 0 |
| 262,144 | PASS | 318.54 | 15.42 | exit 0 |
| 524,288 | PASS | 171.37 | 8.01 | exit 0; below 10 tok/s usable floor |
| 786,432 | STALLED / no row | n/a | n/a | started; no JSONL row; process gone at inspection |
| 1,048,576 | NOT REACHED | n/a | n/a | skipped after 786K stall |

Interpretation:

- 128K and 262K are clean capacity passes for this small-model/q4_0-KV setup.
- 524K also passes, but decode is only ~8 tok/s; it is a capacity pass, not a good
  interactive experience.
- 786K is the observed wall for this command shape.
- 1M was discussed and targeted, but not reached here.

## Quality gate

| field | value |
|---|---|
| gate version | `context-capacity-ramp-v1` |
| runtime criterion | depth emits JSONL pp/tg rows and process exits 0 |
| runtime passed | true through 524K; false at 786K |
| usability floor | decode > 10 tok/s |
| usability passed | true through 262K; false at 524K |
| quality / retrieval | not run |

## Evidence

Primary artifacts:

```txt
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/bench.cmd
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/run.log
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/q4q4-depth-131072.jsonl
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/q4q4-depth-262144.jsonl
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/q4q4-depth-524288.jsonl
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/q4q4-depth-786432.jsonl
logs/2026-05-23-3090-qwen25-7b-q4q4-1m-ramp-partial/summary.json
```

`run.log` closed at:

```txt
DEPTH 131072 EXIT 0
DEPTH 262144 EXIT 0
DEPTH 524288 EXIT 0
DEPTH 786432 START ...
```

No `DEPTH 786432 EXIT` was written.

## What this receipt does not prove

- It does not prove 1M context on a 3090.
- It does not prove Qwen3.6-27B at 262K or 1M; this used Qwen2.5-7B because it was
  already local.
- It does not prove quality, retrieval, instruction following, or KV fidelity at
  long context.
- It does not validate TurboQuant, sparse attention, YaRN extrapolation, or SubQ.

## Caveats

- This uses a small 7B Qwen2.5 model, not the Qwen3.6 27B stack discussed in some
  community recipes.
- Reps are `-r 1`; this is a capacity/stall probe, not a stable throughput benchmark.
- The process disappearance at 786K was not accompanied by an explicit exit marker
  in `run.log`; the honest status is partial/stalled, not a measured failure code.

## Next step

If the goal is a community-relevant beyond-128K receipt, the next branch-and-command
shape should be Qwen3.6-27B GGUF or a known long-context fork, not another blind
Qwen2.5-7B rerun. A quality gate should start at the highest usable pass here:
**262K**, not 524K.

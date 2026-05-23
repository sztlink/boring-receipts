# Process index

The receipt list is chronological. This index is behavioral. It groups receipts by
what kind of gesture they perform so the lab reads as process, not inventory.

## Runtime baselines

| ID | receipt | gesture |
|---|---|---|
| R1 | [`2026-05-22-3090-llama31-8b-q4km-baseline.md`](receipts/2026-05-22-3090-llama31-8b-q4km-baseline.md) | Shared-workstation baseline. |
| R1b | [`2026-05-23-3090-llama31-8b-q4km-baseline-dedicated.md`](receipts/2026-05-23-3090-llama31-8b-q4km-baseline-dedicated.md) | Dedicated-mode baseline, makes idle VRAM tax explicit. |

## Weight quantization ladders

| ID | receipt | gesture |
|---|---|---|
| R2 | [`2026-05-22-3090-llama31-8b-quant-sweep.md`](receipts/2026-05-22-3090-llama31-8b-quant-sweep.md) | First Q4/Q5/Q8 sweep with quality gate. |
| R2b | [`2026-05-23-3090-llama31-8b-quant-sweep-dedicated.md`](receipts/2026-05-23-3090-llama31-8b-quant-sweep-dedicated.md) | Dedicated-mode rerun. |
| R10 | [`2026-05-23-3090-qwen25-7b-quant-ladder.md`](receipts/2026-05-23-3090-qwen25-7b-quant-ladder.md) | Cross-model quant-ladder generalization with different quality cost. |

## Context and flash-attn behavior

| ID | receipt | gesture |
|---|---|---|
| R3 | [`2026-05-23-3090-llama31-8b-context-sweep.md`](receipts/2026-05-23-3090-llama31-8b-context-sweep.md) | Long-context wall, 0→64K. |
| R5 | [`2026-05-23-3090-llama31-8b-flash-attn.md`](receipts/2026-05-23-3090-llama31-8b-flash-attn.md) | Flash-attn point delta. |
| R6 | [`2026-05-23-3090-llama31-8b-flash-attn-context-curve.md`](receipts/2026-05-23-3090-llama31-8b-flash-attn-context-curve.md) | Flash-attn curve across context. |
| R12 | [`2026-05-23-3090-qwen25-7b-flash-attn-context-curve.md`](receipts/2026-05-23-3090-qwen25-7b-flash-attn-context-curve.md) | Cross-architecture flash-attn/context confirmation. |

## Model library

| ID | receipt | gesture |
|---|---|---|
| R7 | [`2026-05-23-3090-qwen25-7b-q4km.md`](receipts/2026-05-23-3090-qwen25-7b-q4km.md) | Qwen2.5-7B model card. |
| R8 | [`2026-05-23-3090-mistral-7b-v03-q4km.md`](receipts/2026-05-23-3090-mistral-7b-v03-q4km.md) | Mistral-7B model card. |
| R9 | [`2026-05-23-3090-gemma2-9b-q4km.md`](receipts/2026-05-23-3090-gemma2-9b-q4km.md) | Gemma-2-9B model card. |
| R11 | [`2026-05-23-3090-qwen25-14b-q4km.md`](receipts/2026-05-23-3090-qwen25-14b-q4km.md) | Qwen2.5-14B model card. |

## Blockers, no-delta and falsification

| ID | receipt | gesture |
|---|---|---|
| R4 | [`2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md`](receipts/2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md) | KV-cache quantization blocked on prebuilt. |
| R13 | [`2026-05-23-3090-llama-cpp-source-build-cuda-BLOCKED.md`](receipts/2026-05-23-3090-llama-cpp-source-build-cuda-BLOCKED.md) | Source-build CUDA path blocked at CMake/MSVC/Windows SDK preflight. |
| R14 | [`2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch.md`](receipts/2026-05-23-3090-llama-cpp-kv-dtype-pdlpatch.md) | Patched source build makes KV dtype runnable; short-context result is negative for speed. |
| RS1 | [`2026-05-23-4090-vllm-realrag-entity-hop-path.md`](receipts/2026-05-23-4090-vllm-realrag-entity-hop-path.md) | Positive path-construction bridge plus failed strict ECD shortcut. |
| RS2 | [`2026-05-23-4090-vllm-realrag-gated-answer-rerank.md`](receipts/2026-05-23-4090-vllm-realrag-gated-answer-rerank.md) | Small-slice gain demoted by N=500 no-delta. |

## Open frontier

The KV-dtype axis remains the sharpest next runtime frontier. The prebuilt blocks
it, but a patched source build now runs the axis. The next honest move is not to
claim victory from a runnable command. It is to run a long-context KV dtype curve
and add a small quality gate.

# Negative, blocked and no-delta receipts

> A lab that only preserves gains is a marketing surface. A lab that preserves
> resistance from the real is an archive.

This page gives blocked, mixed and no-delta results the same public dignity as
positive results. These receipts remove false paths, expose stack boundaries and
keep the lab from turning every experiment into a growth curve.

## Canonical examples

| ID | receipt | status | why it matters |
|---|---|---|---|
| R4 | [`2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md`](receipts/2026-05-23-3090-llama31-8b-kv-quant-BLOCKED.md) | BLOCKED | KV-cache quantization hangs on the llama.cpp b9286 win-cuda prebuilt when `-ctk/-ctv` are used with flash-attn. This identifies a real source-build frontier instead of pretending the axis was measured. |
| RS1 | [`2026-05-23-4090-vllm-realrag-entity-hop-path.md`](receipts/2026-05-23-4090-vllm-realrag-entity-hop-path.md) | MIXED | Entity-hop path prompting beats BM25→BGE, but strict single-candidate ECD fails. The mixed result preserves the boundary between evidence construction and sampler control. |
| RS2 | [`2026-05-23-4090-vllm-realrag-gated-answer-rerank.md`](receipts/2026-05-23-4090-vllm-realrag-gated-answer-rerank.md) | 100-case PASS; 500-case NO DELTA | The small gated-rerank gain does not scale to N=500. Publishing the no-delta follow-up keeps the receipt from becoming a cherry-picked claim. |

## How to read a negative receipt

A negative receipt should answer four questions:

1. **What exact tempting claim did it test?**
2. **What part of the stack resisted?** Runtime, kernel, driver, dataset, prompt,
   candidate selector, quality gate?
3. **What remains true after the failure?**
4. **What path does it close or redirect?**

## Design rule

Positive, negative and no-delta states should use the same receipt structure and the
same visual weight. Color may label a state, but it must not make positive results
look more authoritative than failed or null results.

## Current lesson

The most important current negative is RS2 at N=500:

```txt
entity-hop path prompt == gated rerank v1
```

That does not erase the 100-case signal. It demotes it to what it is: a small-slice
historical signal, not a scaled quality claim.

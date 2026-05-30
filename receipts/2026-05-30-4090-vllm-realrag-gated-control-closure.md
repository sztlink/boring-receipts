# Boring Receipt - `2026-05-30-4090-vllm-realrag-gated-control-closure` (RS4)

> Send branch + command shape. We return boring receipts.

Research sibling receipt. This closes the current hand-written gated-control line
for RealRAG/EPKV after a fresh holdout failed to reproduce the inspected-slice
signal.

## Title

Gated Control Closure - Option A / Option B

| field | value |
|---|---|
| **status** | **CLOSED AFTER HOLDOUT; PIVOT TO RETRIEVAL/PATH** |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 for vLLM source runs; local postprocess for detectors |
| **date** | 2026-05-30 |
| **depends on** | RS1, RS2, RS3 |
| **final decision** | close gated control for now |

## Claim

Two hand-written detector attempts were tested after the RS2 N=500 no-delta:

- **Option A:** pre-registered shadow eligibility detector.
- **Option B:** redesigned alternative-signal shadow detector using only available
  proxy signals.

Option A was too small on inspected N=500. Option B looked better on inspected
N=500 but failed fresh holdout.

The correct conclusion is:

```txt
close gated control for now
pivot to retrieval/path construction
```

## Baseline context

RS2 already demoted the original gated rerank claim:

```txt
N=500 path_prompt EM: 0.216
N=500 gated_v1 EM:   0.216
wins/losses/ties:    2 / 2 / 496
```

Day 1 autopsy showed that many failures were upstream:

```txt
path prompt failures: 392/500
retrieval/path-limited failures: 201/392
potentially control-relevant failures: 187/392
```

## Side-by-side detector results

| run | dataset | eligible | EM wins | EM losses | EM ties | projected global EM delta | decision |
|---|---|---:|---:|---:|---:|---:|---|
| Option A shadow | inspected N=500 | 4 | 2 | 0 | 2 | +0.004 | too small, do not promote |
| Option B shadow | inspected N=500 | 8 | 5 | 0 | 3 | +0.010 | freeze for holdout only |
| Option B holdout | fresh offset500 N=100 | 1 | 0 | 0 | 1 | 0.000 | fail, close line |

## Option A

Option A was the disciplined detector proposed after the Casey/Giselle/Opus review:
pre-register the eligibility spec, run shadow only, and do not use gold-derived
fields as detector inputs.

Result:

```txt
eligible rows: 4/500
EM wins/losses/ties if used: 2 / 0 / 2
projected global EM delta: +0.004
projected global F1 delta: +0.002154
decision: do_not_promote_pivot_or_redesign_detector
```

Interpretation:

```txt
clean but anecdotal
not enough coverage for an override policy
```

## Option B

Option B tried one last redesign using different available signal families:

```txt
selection_entropy_proxy
answerer_agreement_entropy
character-trigram similarity
path_uncertainty_score
direct_evidence_score
specificity direction / compression
candidate variant evidence
```

Important limitation: the existing artifacts did not contain true logits, token
probabilities, calibrated confidence distributions, hidden-state embeddings, or
non-empty retriever score arrays.

Inspected N=500 result:

```txt
eligible rows: 8/500
EM wins/losses/ties if used: 5 / 0 / 3
projected global EM delta: +0.010
bootstrap EM CI95: [0.002, 0.020]
decision: freeze_option_b_for_fresh_holdout_shadow_only
```

Fresh holdout result:

```txt
holdout: offset 500, N=100
eligible rows: 1/100
EM wins/losses/ties if used: 0 / 0 / 1
eligible target-relevant rows: 0
eligible retrieval/path-limited rows: 1
projected global EM delta: 0.000
bootstrap EM CI95: [0, 0]
decision: stop_option_b_or_redesign_again_not_recommended
```

## Holdout details

Fresh holdout raw entity-hop quality:

```txt
path_prompt EM: 0.210
path_prompt F1: 0.295
rerank EM:      0.210
rerank F1:      0.322
raw rerank vs path: 2 wins / 2 losses
```

The only Option B eligible holdout row:

| idx | lane | outcome | path | proposed |
|---:|---|---|---|---|
| 557 | `low_selection_entropy_rescue` | tie | `Place of origin` | `Lugdunum in Roman Gaul` |

Posthoc label for that row:

```txt
path_schema_miss_answer_present_elsewhere
```

That is retrieval/path-limited, not a reproduced control-relevant slice.

## Final decision

```txt
close_gated_control_for_now
```

Reasons:

```txt
Option A eligible_count too small
Option B inspected-slice signal did not reproduce on fresh holdout
holdout eligible_count < 5
holdout EM wins < 3
holdout target-relevant concentration below baseline
holdout eligible row was retrieval/path-limited
raw rerank remained symmetric at 2 wins / 2 losses
```

## Evidence

TurboQuant sibling artifacts:

```txt
bench/epkv-control-eligibility-v0-2026-05-30/ELIGIBILITY-SPEC.md
bench/epkv-control-eligibility-v0-2026-05-30/SHADOW-RUN.md
bench/epkv-control-eligibility-v0-2026-05-30/shadow-summary.json
bench/epkv-control-eligibility-v0-2026-05-30/OPTION-B-REDESIGN-SPEC.md
bench/epkv-control-eligibility-v0-2026-05-30/OPTION-B-SHADOW-RUN.md
bench/epkv-control-eligibility-v0-2026-05-30/option-b-summary.json
bench/epkv-control-eligibility-v0-2026-05-30/holdout-offset500-n100/option-b-holdout-shadow-run.md
bench/epkv-control-eligibility-v0-2026-05-30/holdout-offset500-n100/option-b-holdout-summary.json
bench/epkv-control-eligibility-v0-2026-05-30/FINAL-DECISION.md
```

Related Boring Receipts:

```txt
RS1 - entity-hop path construction positive, strict ECD negative
RS2 - gated rerank small-slice gain demoted by N=500 no-delta
RS3 - Option B inspected slice failed fresh holdout
```

## What this receipt does not prove

- It does not prove all control methods are impossible.
- It does not prove EPKV hurts RealRAG.
- It does not invalidate entity-hop path prompting.
- It does not test true logit entropy or calibrated uncertainty, because those signals were not stored.
- It does not provide serving latency or throughput evidence.

## What remains true

```txt
Entity-hop path prompting remains the non-oracle baseline.
Hand-written verifier gates did not produce a reproducible natural-quality gain.
Most remaining error mass points back toward retrieval/path construction.
```

## Next step

Pivot to retrieval/path construction.

Only revisit a future Option C if a new run stores genuinely different signals
before scoring, such as:

```txt
token logprobs or logits entropy
calibrated verifier probability vectors
retriever/reranker numeric score margins
real embedding vectors with pre-registered thresholds
multiple independent verifier samples for disagreement distribution
```

Without those, Option C would just be another string-heuristic redesign and should
be skipped.

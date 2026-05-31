# Boring Receipt - `2026-05-31-4090-vllm-realrag-path-construction-prompt-guards` (RS5)

> Send branch + command shape. We return boring receipts.

Research sibling receipt. This closes the first RealRAG retrieval/path-construction
sprint after retrieval coverage reproduced but prompt-level guards failed.

## Title

RealRAG Path Construction v1 - Retrieval Coverage Reproduced, Prompt Guards Failed

| field | value |
|---|---|
| **status** | **MIXED / NEGATIVE - RETRIEVAL COVERAGE REPRODUCED; PROMPT GUARDS FAILED** |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 for vLLM source runs; local postprocess for comparisons |
| **date** | 2026-05-31 |
| **depends on** | RS1, RS2, RS3, RS4 |
| **final decision** | stop prompt guards; move upstream to explicit path-candidate construction |

## Claim tested

After RS4 closed hand-written gated control, the next question was:

```txt
Can retrieval/path construction improve RealRAG answer quality by changing the evidence geometry before answer generation?
```

A cheap retrieval-only grid found a cleaner top-10 evidence geometry. A bounded
answer-quality run improved the known offset500 slice. A fresh offset1500 run
reproduced the coverage gain but did not clear the answer-quality gate. Two prompt
repair attempts then failed:

```txt
global guarded path prompt
narrow guard-family prompts
```

The correct conclusion is:

```txt
retrieval/path construction remains the right frontier
prompt guards are closed for now
next step is explicit path-candidate construction, not more prompt wording
```

## What changed

The winning retrieval config was smaller and less expansion-heavy:

```txt
bm25_first: 8
seed_top: 0
second_per_mention: 0
max_seed_expansions: 4
max_doc_mentions: 3
pool_limit: 80
top_k: 10
```

Interpretation:

```txt
Bigger candidate pools added distractors faster than useful support.
A cleaner top-10 helped coverage, but did not reliably convert to final answers.
```

## Retrieval-only grid

No LLM calls were used in this phase.

| offset | support title recall | full support recall | answer present | full support + answer |
|---:|---:|---:|---:|---:|
| 0 | 0.690 | 0.420 | 0.730 | 0.420 |
| 500 | 0.713 | 0.390 | 0.760 | 0.390 |
| 1000 | 0.673 | 0.380 | 0.700 | 0.380 |

Against the current-config retrieval-only comparator:

| offset | full support + answer current | full support + answer config0 | delta |
|---:|---:|---:|---:|
| 0 | 0.230 | 0.420 | +0.190 |
| 500 | 0.260 | 0.390 | +0.130 |

Coverage gate:

```txt
passed
```

## Answer-quality run - known offset500

Comparison:

```txt
current entity_hop_path_prompt vs config0 entity_hop_path_prompt
offset 500, N=100
```

| metric | current | config0 | delta |
|---|---:|---:|---:|
| EM | 0.210 | 0.270 | +0.060 |
| contains | 0.270 | 0.330 | +0.060 |
| F1 | 0.295 | 0.376 | +0.082 |

Per-case EM movement:

```txt
wins: 10
losses: 4
ties: 86
```

This passed the answer-quality gate on a known slice.

## Answer-quality run - fresh offset1500

Because offset500 was already in the working context, a fresh offset1500 run was
required before any positive claim.

Comparison:

```txt
current entity_hop_path_prompt vs config0 entity_hop_path_prompt
offset 1500, N=100
```

Retrieval reproduced:

| metric | current | config0 | delta |
|---|---:|---:|---:|
| support title recall | 0.520 | 0.674 | +0.154 |
| full support recall | 0.230 | 0.380 | +0.150 |
| answer present | 0.570 | 0.760 | +0.190 |

Answer quality was mixed:

| metric | current | config0 | delta | CI95 |
|---|---:|---:|---:|---:|
| EM | 0.140 | 0.180 | +0.040 | [-0.040, +0.120] |
| contains | 0.200 | 0.260 | +0.060 | [-0.040, +0.160] |
| F1 | 0.248 | 0.288 | +0.040 | [-0.040, +0.124] |

Per-case EM movement:

```txt
wins: 10
losses: 6
ties: 84
```

Pre-registered answer-quality gate:

```txt
EM wins > losses
EM delta >= +0.03
F1 delta >= +0.05
```

Observed:

```txt
wins > losses: yes
EM delta: pass
F1 delta: fail
CI lower bounds cross zero
```

Decision:

```txt
mixed_or_gate_fail
```

## Global guarded prompt

The next test added answer-type, relation-depth, attribute-owner, generic-title,
same-neighborhood and media-chain guards to the prompt.

Same-run comparison:

```txt
entity_hop_path_prompt -> entity_hop_path_guarded
offset 1500, N=100
```

| metric | path prompt | guarded path | delta |
|---|---:|---:|---:|
| EM | 0.150 | 0.080 | -0.070 |
| contains | 0.240 | 0.090 | -0.150 |
| F1 | 0.271 | 0.120 | -0.151 |

Per-case EM movement:

```txt
wins: 0
losses: 7
ties: 93
```

Refusal behavior:

```txt
path prompt refusal rate: 0.01
guarded path refusal rate: 0.68
```

Decision:

```txt
guarded_prompt_failed_do_not_continue
```

## Narrow guard-family prompts

The global prompt may have been too blunt, so four narrow guard families were
tested with softer UNKNOWN pressure.

Same-run baseline:

```txt
entity_hop_path_prompt
offset 1500, N=100
EM: 0.150
F1: 0.277
```

| guard family | EM | F1 | EM delta | F1 delta | wins | losses | ties | refusal rate |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| attribute_owner | 0.130 | 0.221 | -0.020 | -0.056 | 1 | 3 | 96 | 0.47 |
| relation_depth | 0.130 | 0.212 | -0.020 | -0.065 | 3 | 5 | 92 | 0.53 |
| generic_title | 0.100 | 0.186 | -0.050 | -0.091 | 1 | 6 | 93 | 0.55 |
| answer_granularity | 0.100 | 0.173 | -0.050 | -0.104 | 2 | 7 | 91 | 0.53 |

Decision:

```txt
all_narrow_guard_families_failed_vs_same_run_path_prompt
```

## Final decision

```txt
stop_prompt_guards
continue_only_with_explicit_path_candidate_construction
```

Reasons:

```txt
retrieval coverage reproduced on fresh offset
answer quality did not clear the fresh gate
prompt-level global guards failed by over-refusal
narrow prompt guards also underperformed same-run path prompt
repeated prompt wording tweaks are now a closed path
```

## Evidence

TurboQuant sibling commit:

```txt
722620637ba1ce20e29e0f0e45d266192a864c3e
```

Primary artifacts:

```txt
bench/realrag-path-construction-v1-2026-05-30/RETRIEVAL-GRID.md
bench/realrag-path-construction-v1-2026-05-30/retrieval-grid-summary.json
bench/realrag-path-construction-v1-2026-05-30/ANSWER-QUALITY-OFFSET500.md
bench/realrag-path-construction-v1-2026-05-30/answer-quality-offset500-n100-comparison.json
bench/realrag-path-construction-v1-2026-05-30/ANSWER-QUALITY-OFFSET1500.md
bench/realrag-path-construction-v1-2026-05-30/answer-quality-offset1500-n100-comparison.json
bench/realrag-path-construction-v1-2026-05-30/PATH-RISK-INSTRUMENTATION.md
bench/realrag-path-construction-v1-2026-05-30/ANSWER-TYPE-GUARDS.md
bench/realrag-path-construction-v1-2026-05-30/GUARDED-PATH-OFFSET1500.md
bench/realrag-path-construction-v1-2026-05-30/guarded-path-offset1500-n100-comparison.json
bench/realrag-path-construction-v1-2026-05-30/NARROW-GUARDS-OFFSET1500.md
bench/realrag-path-construction-v1-2026-05-30/narrow-guards-offset1500-n100-comparison.json
```

Related Boring Receipts:

```txt
RS1 - entity-hop path construction positive, strict ECD negative
RS2 - gated rerank small-slice gain demoted by N=500 no-delta
RS3 - Option B inspected slice failed fresh holdout
RS4 - gated control closed after Option A too small and Option B holdout failed
```

## What this receipt does not prove

- It does not prove retrieval/path construction is useless.
- It does not prove explicit path construction will fail.
- It does not prove EPKV improves or hurts RealRAG globally.
- It does not test new model uncertainty signals.
- It does not provide runtime throughput or serving evidence.
- It does not justify a positive public claim about RealRAG quality.

## What remains true

```txt
Cleaner evidence geometry can improve support and answer availability.
That improvement does not automatically become final-answer quality.
Prompt instructions are too blunt for the observed failure modes.
The next object to build is a path candidate, not another answer override.
```

## Next step

Move one level upstream before spending more 4090 time:

```txt
construct explicit path candidates from the title graph
score/filter candidate paths without using gold answers
apply relation-depth and attribute-owner templates to path construction
suppress generic titles in candidate selection, not prompt text
ask answer-from-chain only after a candidate path is selected
```

No more 4090 runs should be spent on prompt wording tweaks for this branch.

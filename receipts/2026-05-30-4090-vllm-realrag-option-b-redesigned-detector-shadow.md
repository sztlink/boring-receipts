# Boring Receipt - `2026-05-30-4090-vllm-realrag-option-b-redesigned-detector-shadow` (RS3)

> Send branch + command shape. We return boring receipts.

Research sibling receipt. This cites the RealRAG/EPKV control-eligibility probe in
`turboquant-cuda-bench`; it is not a canonical runtime-axis benchmark receipt.

## Title

Option B - Redesigned Detector Shadow Run

| field | value |
|---|---|
| **status** | **HOLDOUT FAILED; CLOSE GATED CONTROL FOR NOW** |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 for source RealRAG outputs; local postprocess for detector |
| **date** | 2026-05-30 |
| **depends on** | RS2 N=500 no-delta |
| **does not supersede** | RS2. The N=500 no-delta remains the scaled result for gated rerank v1. |

## Claim

A redesigned, shadow-only detector found a small repair-heavy slice inside the
already-inspected N=500 RealRAG entity-hop run:

```txt
eligible rows: 8/500
EM wins/losses/ties if used: 5 / 0 / 3
projected global EM delta if used: +0.010
```

Because this redesign was created after the N=500 autopsy, it was exploratory. A
fresh holdout was then run at offset 500, N=100. The holdout did not reproduce the
inspected-slice signal:

```txt
eligible rows: 1/100
EM wins/losses/ties if used: 0 / 0 / 1
projected global EM delta if used: 0.000
```

Final decision: close gated control for now.

## Target

| field | value |
|---|---|
| project | RealRAG / EPKV Control Eligibility v0 |
| repo | `https://github.com/sztlink/turboquant-cuda-bench` |
| branch | `main` |
| source baseline | RS2 entity-hop answer rerank N=500 no-delta |
| detector name | Option B alternative-signal shadow detector |
| detector mode | shadow only, final answers unchanged |
| inspected dataset | local 2Wiki dev slice, N=500 used for RS2 follow-up |
| holdout dataset | same 2Wiki dev slice, offset 500, N=100 |
| baseline answer | entity-hop path prompt |
| proposed answer source | verifier/rerank output only when Option B detector marks eligible |

## Signal availability

The existing N=500 artifacts did **not** contain:

```txt
raw logits
token probabilities
calibrated verifier confidence distributions
hidden-state embeddings
non-empty retriever selected_scores
```

Therefore Option B did not use true entropy or true embedding signals. It used
operational proxies only:

```txt
selection_entropy_proxy from verifier selected ids
answerer_agreement_entropy across bge / strong / path / verifier outputs
surface similarity via character-trigram cosine and token Jaccard
path_uncertainty_score from refusal/schema/shape markers
direct_evidence_score from verifier rationale
specificity direction and compression ratio
candidate variant evidence
```

This distinction matters: the receipt is not evidence that logit entropy works. It
is evidence that available proxy signals found a small candidate slice on inspected
data and then failed fresh holdout.

## Command shape

Inspected N=500 shadow detector:

```bash
cd /home/aya/implante/research/turboquant-cuda-bench
node bench/epkv-control-eligibility-v0-2026-05-30/build-option-b-shadow.mjs
```

Fresh holdout path:

```bash
python3 07-scripts/vllm-hook/epkv-entity-hop-retrieval.py --offset 500 --limit 100 ...
python3 07-scripts/vllm-hook/epkv-entity-hop-answer-rerank.py --summary holdout/entity-hop-llm/summary.json ...
node bench/epkv-control-eligibility-v0-2026-05-30/build-option-b-shadow.mjs \
  --output-prefix option-b-holdout \
  --llm-summary holdout/entity-hop-llm/summary.json \
  --gated-summary holdout/entity-hop-answer-rerank/summary.json \
  --taxonomy holdout/taxonomy/holdout-taxonomy-all.jsonl
```

## Detector lanes

| lane | purpose |
|---|---|
| `date_specificity_repair` | expand a year-only path answer into a directly supported full date |
| `compressed_span_repair` | extract a shorter answer span from an overlong or schema-prefixed path answer |
| `alias_embedding_repair` | repair near-identical answer strings without broad semantic replacement |
| `low_selection_entropy_rescue` | rescue visibly broken path outputs only when verifier dispersion is minimal |

Negative guards include unsupported inference, relation-depth confusion,
attribute-owner-as-attribute, answer-type mismatch, UNKNOWN selection, and semantic
replacement of a concrete path answer.

## Inspected N=500 result

| metric | value |
|---|---:|
| total rows | 500 |
| eligible rows | 8 |
| EM wins | 5 |
| EM losses | 0 |
| EM ties | 3 |
| target-relevant eligible rows | 7 |
| retrieval/path-limited eligible rows | 1 |
| projected global EM delta if used | +0.010 |
| bootstrap EM delta CI95 | [0.002, 0.020] |

Eligible rows:

| idx | lane | outcome | path | proposed |
|---:|---|---|---|---|
| 102 | `date_specificity_repair` | win | `1770` | `2 September 1770` |
| 128 | `low_selection_entropy_rescue` | tie | `Not specified` | `Oslo` |
| 135 | `compressed_span_repair` | win | `Imanol Uribe's spouse is María Barranco.` | `María Barranco` |
| 183 | `alias_embedding_repair` | win | `Hugh Stafford, 2nd Earl of Stafford` | `Hugh de Stafford, 2nd Earl of Stafford` |
| 204 | `low_selection_entropy_rescue` | win | `Not mentioned in the passages.` | `Christ's College, Cambridge` |
| 219 | `compressed_span_repair` | win | `Place of birth: San Juan, Puerto Rico` | `San Juan, Puerto Rico` |
| 415 | `low_selection_entropy_rescue` | tie | `Place of birth` | `Manhattan` |
| 418 | `compressed_span_repair` | tie | `Barry Mahon was born in Ireland.` | `Ireland` |

## Fresh holdout result

After `[CONFIRMAR:INFRA]`, the vLLM service was restarted through `VLLM-AutoStart`
and the frozen detector was run on fresh offset 500, N=100.

| metric | value |
|---|---:|
| total rows | 100 |
| path prompt EM | 0.210 |
| raw rerank vs path | 2 wins / 2 losses |
| Option B eligible rows | 1 |
| Option B EM wins | 0 |
| Option B EM losses | 0 |
| Option B EM ties | 1 |
| eligible target-relevant rows | 0 |
| eligible retrieval/path-limited rows | 1 |
| projected global EM delta | 0.000 |
| bootstrap EM delta CI95 | [0, 0] |

Only eligible holdout row:

| idx | lane | outcome | path | proposed |
|---:|---|---|---|---|
| 557 | `low_selection_entropy_rescue` | tie | `Place of origin` | `Lugdunum in Roman Gaul` |

Holdout decision:

```txt
stop_option_b_or_redesign_again_not_recommended
```

## Quality / behavior gate

| field | value |
|---|---|
| mode | shadow only |
| final answer changed | no |
| detector inputs used gold | no |
| posthoc scoring used gold | yes, after detector decisions only |
| inspected N=500 criteria | pass for fresh-holdout shadow only |
| fresh holdout criteria | fail |
| override promotion | rejected |

Final decision:

```txt
close_gated_control_for_now
```

## Evidence

TurboQuant sibling artifacts:

```txt
bench/epkv-control-eligibility-v0-2026-05-30/OPTION-B-REDESIGN-SPEC.md
bench/epkv-control-eligibility-v0-2026-05-30/OPTION-B-SHADOW-RUN.md
bench/epkv-control-eligibility-v0-2026-05-30/option-b-summary.json
bench/epkv-control-eligibility-v0-2026-05-30/holdout-offset500-n100/option-b-holdout-summary.json
bench/epkv-control-eligibility-v0-2026-05-30/holdout-offset500-n100/option-b-holdout-shadow-run.md
bench/epkv-control-eligibility-v0-2026-05-30/FINAL-DECISION.md
```

Previous control-line receipts:

```txt
RS1 - entity-hop path construction positive, strict ECD negative
RS2 - gated rerank small-slice gain demoted by N=500 no-delta
```

## What this receipt does not prove

- It does not prove EPKV improves RealRAG globally.
- It does not overturn RS2's N=500 no-delta for gated rerank v1.
- It does not prove the detector is deployable; the holdout failed.
- It does not prove logit entropy or calibrated uncertainty works, because those fields were unavailable.
- It does not provide serving latency or throughput evidence.
- It does not use human adjudication; metrics are automatic EM/contains/F1.

## Caveats

- Option B was designed after inspecting the N=500 autopsy. Treat the inspected result as exploratory.
- The apparent clean slice was small: 8/500 eligible rows.
- Most inspected wins were repairs of answer surface or specificity, not broad semantic rescue.
- Fresh holdout was mandatory and failed to reproduce the inspected-slice signal.

## Interpretation

The control line now has three states:

```txt
RS1: entity-hop path construction helps, strict ECD fails.
RS2: verifier gate v1 does not scale at N=500.
RS3: Option B finds a small clean slice on inspected data, then fails fresh holdout.
```

The honest next step is not an override policy and not another string-gate redesign.
The gated-control line should close for now.

## Next step

```txt
close gated control for now
pivot to retrieval/path construction
only revisit Option C if a future run stores genuinely new uncertainty signals before scoring
```

# Boring Receipt — `2026-05-23-4090-vllm-realrag-entity-hop-path` (RS1)

> Send branch + command shape. We return boring receipts.

This is a **research sibling receipt**, not a runtime-axis benchmark receipt. It
cites the probe/RAG program in `turboquant-cuda-bench` without absorbing that
program into Boring Receipts' canonical runtime axes (`AXES.md`).

| field | value |
|---|---|
| **status** | mixed: **PASS** for entity-hop path construction; **FAIL** for strict single-candidate ECD |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 |
| **date** | 2026-05-23 |
| **requested by** | szt.link internal validation |

## Claim

A cheap title/entity-hop retrieval layer creates a better evidence distribution
than BM25→BGE top-10 for this 2Wiki multi-hop slice, and this translates into
better answer quality with a graph/path prompt.

The same run falsifies the next tempting shortcut: forcing the improved evidence
through a strict single-candidate extractor before sampler-side ECD loses many
cases the direct path prompt already solves.

## Target

| field | value |
|---|---|
| engine | vLLM, OpenAI-compatible chat endpoint |
| regime | single request / offline 100-case QA sweep |
| project | RealRAG / Evidence-Controlled Decoding research sibling |
| repo | `git@github.com:sztlink/turboquant-cuda-bench.git` |
| branch | `main` |
| commits | `6c23ed5` constructor · `7a263d1` path-prompt run · `2792852` extractor+ECD run |
| dataset | local 2Wiki dev slice, first 100 compositional/inference records with ≥2 evidences |
| corpus | 56,687 context docs built from local 2Wiki contexts |
| baseline | BM25 top-30 → BGE rerank top-10 + strong answer-only prompt (`33cae3b`) |

## Environment

| field | value |
|---|---|
| node | AYA-4090 |
| GPU | RTX 4090 |
| host | `192.168.15.133` |
| endpoint | `http://192.168.15.133:11435/v1/chat/completions` |
| model label | `local-vllm` |
| sampler policy state after run | `{"enabled": false, "tag": "default-off"}` |
| runtime hook state | `VLLM_EPKV_RUNTIME_HOOK=0`, `VLLM_EPKV_LOGIT_BIAS=0` |
| health after run | `/health OK` |

## Command shape

Retrieval-only grid:

```bash
python3 07-scripts/vllm-hook/epkv-entity-hop-grid.py \
  --out-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-grid-100 \
  --limit 100
```

Best config selected by `full_support_and_answer`:

```json
{
  "bm25_first": 8,
  "seed_top": 0,
  "second_per_mention": 0,
  "max_seed_expansions": 4,
  "max_doc_mentions": 3,
  "pool_limit": 80
}
```

Entity-hop path prompt sweep:

```bash
python3 07-scripts/vllm-hook/epkv-entity-hop-retrieval.py \
  --out-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-llm-100 \
  --limit 100 \
  --skip-bge \
  --skip-extract \
  --disable-ecd \
  --bm25-first 8 \
  --seed-top 0 \
  --second-per-mention 0 \
  --max-doc-mentions 3 \
  --doc-chars 500 \
  --max-tokens 24
```

Strict extractor + ECD follow-up:

```bash
python3 07-scripts/vllm-hook/epkv-entity-hop-retrieval.py \
  --out-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-ecd-100 \
  --limit 100 \
  --skip-bge \
  --bm25-first 8 \
  --seed-top 0 \
  --second-per-mention 0 \
  --max-doc-mentions 3 \
  --doc-chars 500 \
  --max-tokens 24 \
  --extract-max-tokens 128
```

## Retrieval results

| condition | support-title recall | full-support recall | answer present |
|---|---:|---:|---:|
| BM25→BGE baseline | 0.512 | 0.140 | 0.400 |
| entity-hop grid best | 0.708 | 0.460 | 0.780 |
| entity-hop path-prompt run | 0.688 | 0.420 | 0.740 |
| entity-hop extractor+ECD run | 0.677 | 0.410 | 0.730 |

## Answer results

| condition | EM | contains | F1 |
|---|---:|---:|---:|
| BM25→BGE strong baseline | 0.090 | 0.160 | 0.185 |
| entity-hop strong prompt | 0.190 | 0.310 | 0.290 |
| entity-hop graph/path prompt | **0.250** | **0.340** | **0.330** |
| entity-hop graph/path prompt (ECD run repeat) | **0.260** | **0.340** | **0.320** |
| strict path extractor candidate | 0.110 | 0.200 | 0.158 |
| strict path extractor + ECD | 0.130 | 0.200 | 0.172 |

## Win/loss

Entity-hop path prompt vs BM25→BGE strong baseline:

```txt
BGE EM:          9/100
path prompt EM: 25/100
path wins:      19
path losses:    3
```

Strict extractor + ECD vs entity-hop path prompt:

```txt
path prompt EM:      26/100
extractor+ECD EM:    13/100
ECD wins vs path:     1
ECD losses vs path:  14
```

Extractor status:

```txt
FOUND:   44
MISSING: 56
```

## Quality / behavior gate

| field | value |
|---|---|
| gate version | `realrag-rs1` |
| signal | EM / contains / token-F1 + support recall + answer-present |
| criterion A | entity-hop path prompt must beat BM25→BGE strong baseline |
| passed A | **true**: EM 0.25 vs 0.09; F1 0.33 vs 0.185 |
| criterion B | strict extractor+ECD must beat direct entity-hop path prompt without increasing losses |
| passed B | **false**: EM 0.13 vs 0.26; 14 losses vs path |

## Evidence

Primary artifacts in the research sibling repo:

```txt
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-LLM-100.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-llm-100/summary.json
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-ECD-100.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-ecd-100/summary.json
```

Log excerpts:

```txt
entity-hop path prompt:
BGE rerank strong:       EM 0.090 | contains 0.160 | F1 0.185
entity-hop strong:       EM 0.190 | contains 0.310 | F1 0.290
entity-hop path prompt:  EM 0.250 | contains 0.340 | F1 0.330

entity-hop extractor+ECD:
entity-hop path prompt:  EM 0.260 | contains 0.340 | F1 0.320
path extractor:          EM 0.110 | contains 0.200 | F1 0.158
extractor + ECD:         EM 0.130 | contains 0.200 | F1 0.172
```

## Caveats

- This is a QA/probe receipt, not a throughput receipt. It is intentionally kept
  as a research sibling card because Boring Receipts' canonical axes are runtime
  load axes.
- Dataset slice is local 2Wiki dev; the receipt proves this command shape on this
  slice, not general RAG dominance.
- The model behind `local-vllm` is the local serving model used by the lab; exact
  hosted model identity should be pinned in a future public rerun.
- Entity-hop selection is title/entity heuristic; it may overfit to Wikipedia-like
  title structure.
- Oracle ECD remains much stronger in compact-evidence controls (EM ≈0.91), but
  that is not an end-to-end retrieval proof.

## Interpretation

The first RealRAG bridge is not sampler-side ECD. It is upstream evidence
construction:

```txt
retrieval/path construction -> graph/path prompt -> answer quality
```

Sampler-side ECD becomes useful only after candidate/path confidence is reliable.
A single strict candidate is too narrow; the next shape should be soft or
multi-candidate evidence control.

## Next step

```txt
entity-hop docs
-> N answer/path candidates
-> multi-candidate sampler bias
-> fallback to direct path prompt when extractor is missing
```

Success criterion for the next receipt:

```txt
beat entity-hop path prompt EM 0.26 / F1 0.32 without adding losses.
```

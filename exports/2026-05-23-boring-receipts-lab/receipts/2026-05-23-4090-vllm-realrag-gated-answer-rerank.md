# Boring Receipt - `2026-05-23-4090-vllm-realrag-gated-answer-rerank` (RS2)

> Send branch + command shape. We return boring receipts.

Research sibling receipt. This cites the RealRAG/EPKV probe program in
`turboquant-cuda-bench`; it is not a canonical runtime-axis benchmark receipt.

| field | value |
|---|---|
| **status** | **100-case PASS; 300-case small; 500-case NO DELTA** |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 |
| **date** | 2026-05-23 |
| **supersedes** | Does not supersede RS1 at N=500; preserves 100-case positive slice as historical signal |

## Claim

A conservative verifier should not replace the direct entity-hop graph/path prompt
by default. It should only intervene when the direct strong/path prompts disagree
and the verifier has high confidence in a non-overlapping answer.

That confidence gate adds two exact-match wins and zero losses over the direct
entity-hop path prompt on the 100-case 2Wiki slice.

300-case v0 follow-up: the positive signal did **not** robustly scale. Gated rerank
was +1 EM over path prompt but introduced 2 EM losses.

300-case v1 follow-up: adding two abstention guards removed those losses and produced
a small clean gain: EM 0.230 / F1 0.340 vs path EM 0.220 / F1 0.333, with 3 wins and 0 losses.

500-case machine-only follow-up: the apparent gain disappears. Gated v1 ties direct
path prompting on EM (0.216 vs 0.216) and is microscopically lower on F1 (0.323 vs 0.324),
with 2 wins and 2 losses. This receipt should not be read as a scaled positive claim.

## Target

| field | value |
|---|---|
| engine | vLLM, OpenAI-compatible chat endpoint |
| regime | offline 100-case QA sweep |
| project | RealRAG / EPKV research sibling |
| repo | `git@github.com:sztlink/turboquant-cuda-bench.git` |
| branch | `main` |
| commit | `dce28e4` - `Add confidence-gated entity-hop answer rerank` |
| follow-up commit | `55fd4b5` - `Scale entity-hop gated rerank to 300 cases` |
| v1 follow-up commit | `a2192ce` - `Add stricter gated rerank v1` |
| 500-case follow-up commit | `f8c2741` - `Run 500-case machine-only RealRAG reality check` |
| dataset | local 2Wiki dev slice, first 100 compositional/inference records with ≥2 evidences |
| baseline | RS1 entity-hop path prompt and BM25→BGE strong baseline |

## Environment

| field | value |
|---|---|
| node | AYA-4090 |
| GPU | RTX 4090 |
| host | `192.168.15.133` |
| endpoint | `http://192.168.15.133:11435/v1/chat/completions` |
| model label | `local-vllm` |
| sampler policy | not used in rerank |
| final service check | policy disabled, runtime hook/logit bias off, `/health OK` |

## Command shape

Answer rerank pass:

```bash
python3 07-scripts/vllm-hook/epkv-entity-hop-answer-rerank.py \
  --summary bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-llm-100/summary.json \
  --responses-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-llm-100/responses \
  --out-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-100 \
  --limit 100 \
  --only-disagreements
```

Conservative gate postprocess:

```bash
python3 07-scripts/vllm-hook/epkv-summarize-answer-rerank-gated.py \
  --summary bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-100/summary.json \
  --out-dir bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-gated-100
```

Gate rule:

```txt
default: keep entity-hop graph/path prompt
run verifier only when strong/path outputs disagree
override only if:
  verifier confidence == high
  verifier output does not contain path output
  path output does not contain verifier output
```

## Results

| condition | EM | contains | F1 |
|---|---:|---:|---:|
| BM25→BGE strong baseline | 0.090 | 0.160 | 0.185 |
| entity-hop strong prompt | 0.190 | 0.310 | 0.290 |
| entity-hop graph/path prompt (RS1) | 0.250 | 0.340 | 0.330 |
| raw answer rerank | 0.240 | 0.350 | 0.325 |
| confidence-gated answer rerank | **0.270** | **0.360** | **0.345** |

Win/loss vs RS1 path prompt:

```txt
wins:      2
losses:    0
overrides: 3
```

Successful exact-match overrides:

| idx | gold | path output | verifier output |
|---:|---|---|---|
| 14 | Catherine Robbe-Grillet | Martha De Laurentiis | Catherine Robbe-Grillet |
| 18 | Rukn al-Dawla | 'Adud al-Dawla | Rukn al-Dawla |

A third override changed wrong→wrong without affecting EM.

## Quality / behavior gate

| field | value |
|---|---|
| gate version | `realrag-rs2` |
| signal | EM / contains / token-F1 + win/loss vs RS1 |
| 100-case criterion | beat RS1 entity-hop path prompt without EM losses |
| 100-case passed | **true**: EM 0.270 vs 0.250; F1 0.345 vs 0.330; losses 0 |
| 300-case v0 follow-up | **mixed / not robust**: EM 0.223 vs 0.220; F1 0.333 vs 0.333; wins 3, losses 2 |
| 300-case v1 follow-up | **small clean gain**: EM 0.230 vs 0.220; F1 0.340 vs 0.333; wins 3, losses 0 |
| 500-case machine-only follow-up | **no delta**: EM 0.216 vs 0.216; F1 0.323 vs 0.324; wins 2, losses 2; p=1.0 |

## Evidence

Research sibling artifacts:

```txt
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-ANSWER-RERANK-100.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-100/summary.json
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-gated-100/summary.json

bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-ANSWER-RERANK-300.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-300/summary.json
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-gated-300/summary.json

bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-ANSWER-RERANK-GATED-V1.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-gated-v1-300/summary.json

bench/epkv-live-probe-v0-2026-05-21/sprint-12h/MACHINE-ONLY-REALITY-500.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/machine-reality-500/RESULTS.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/machine-reality-500/summary.json
```

## What this receipt does not prove

- It does not prove a general RAG result; it proves this command shape on the stated local 2Wiki slice and local vLLM endpoint.
- It does not prove serving latency, throughput or production readiness. This is a research-sibling behavior receipt, not a runtime-axis benchmark.
- It does not prove that the metric is sufficient for all answer quality; the reported numbers are automatic EM/contains/F1 and support diagnostics unless otherwise stated.
- It does not absorb RealRAG/EPKV into Boring Receipts. This is the public reproducibility card; the full research/probe body lives in `turboquant-cuda-bench`.

## Caveats

- This is still a 100-case local 2Wiki slice, not a general RAG claim.
- The verifier is another LLM call; this is quality/control-plane evidence, not a latency receipt.
- The v0 gate is postprocessed from verifier confidence and string-overlap heuristics; the 300-case v0 follow-up shows that `confidence=high` is not calibrated enough.
- The v1 gate is still hand-written and deterministic; the 500-case follow-up removes the scaled positive interpretation.
- No human adjudication: these are automatic exact-answer metrics only.
- Oracle compact-evidence ECD remains much stronger (EM ≈0.91), but that is a control upper bound, not natural retrieval.

## Interpretation

RS1 found the first bridge:

```txt
entity-hop retrieval -> graph/path prompt
```

RS2 tested a control layer above the decoder:

```txt
path answer first -> verifier only on disagreement -> conservative exact-span gate
```

The scaled lesson is mostly negative:

- unconditional sampler bias and strict single-candidate ECD lose cases;
- confidence-gated answer control can add wins on small slices;
- 300-case v0 correction: the original gate did not preserve the zero-loss property;
- 300-case v1 correction: stricter abstention restored the zero-loss property with a small gain;
- 500-case correction: that gain does not scale; answer-control ties direct path prompting.

So the current non-oracle baseline remains direct entity-hop path prompting, not the verifier gate.

## Next step

```txt
freeze hand-written verifier gates
improve retrieval/path construction, or learn an override selector on held-out slices
only revisit conditional sampler policy after a real machine-only quality delta
```

# Boring Receipt — `2026-05-23-4090-vllm-realrag-gated-answer-rerank` (RS2)

> Send branch + command shape. We return boring receipts.

Research sibling receipt. This cites the RealRAG/EPKV probe program in
`turboquant-cuda-bench`; it is not a canonical runtime-axis benchmark receipt.

| field | value |
|---|---|
| **status** | **PASS** for confidence-gated answer rerank over entity-hop path prompt |
| **rung** | research sibling / RealRAG behavior receipt |
| **node** | AYA-4090 |
| **date** | 2026-05-23 |
| **supersedes** | RS1 as best non-oracle RealRAG result, while preserving RS1 |

## Claim

A conservative verifier should not replace the direct entity-hop graph/path prompt
by default. It should only intervene when the direct strong/path prompts disagree
and the verifier has high confidence in a non-overlapping answer.

That confidence gate adds two exact-match wins and zero losses over the direct
entity-hop path prompt on the 100-case 2Wiki slice.

## Target

| field | value |
|---|---|
| engine | vLLM, OpenAI-compatible chat endpoint |
| regime | offline 100-case QA sweep |
| project | RealRAG / EPKV research sibling |
| repo | `git@github.com:sztlink/turboquant-cuda-bench.git` |
| branch | `main` |
| commit | `dce28e4` — `Add confidence-gated entity-hop answer rerank` |
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
| criterion | beat RS1 entity-hop path prompt without EM losses |
| passed | **true**: EM 0.270 vs 0.250; F1 0.345 vs 0.330; losses 0 |

## Evidence

Research sibling artifacts:

```txt
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/ENTITY-HOP-ANSWER-RERANK-100.md
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-100/summary.json
bench/epkv-live-probe-v0-2026-05-21/sprint-12h/entity-hop-answer-rerank-gated-100/summary.json
```

## Caveats

- This is still a 100-case local 2Wiki slice, not a general RAG claim.
- The verifier is another LLM call; this is quality/control-plane evidence, not a latency receipt.
- The gate is postprocessed from verifier confidence and string-overlap heuristics; it needs a 300-case run before becoming canonical.
- Oracle compact-evidence ECD remains much stronger (EM ≈0.91), but that is a control upper bound, not natural retrieval.

## Interpretation

RS1 found the first bridge:

```txt
entity-hop retrieval -> graph/path prompt
```

RS2 improves it by moving control above the decoder:

```txt
path answer first -> verifier only on disagreement -> conservative exact-span gate
```

The lesson is negative and positive:

- negative: unconditional sampler bias and strict single-candidate ECD lose cases;
- positive: confidence-gated answer control can add wins without losses.

## Next step

```txt
scale RS2 to 300 cases
add exact-span preference + abstention features
only then revisit conditional sampler policy
```

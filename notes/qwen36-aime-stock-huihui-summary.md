# Qwen3.6-27B AIME 2026 — stock vs Huihui vs Heretic local GGUF summary

Date: 2026-05-25  
Scope: local RTX 3090 / `llama.cpp` / Q4_K_M GGUF / AIME 2026 full set

## Bottom line

In this local 24GB-GPU Q4_K_M setup, **neither Huihui/abliterated nor Heretic beat stock** on AIME 2026, and neither free nor bounded thinking gave a clear uplift in the tested GGUF regime.

| receipt | model | serving | score |
|---|---|---|---:|
| R22 | stock Qwen3.6-27B Q4_K_M | `--reasoning off`, `max_tokens=4096` | **17/30** |
| R22 | Huihui Qwen3.6-27B abliterated Q4_K_M | `--reasoning off`, `max_tokens=4096` | **15/30** |
| R23 | stock Qwen3.6-27B Q4_K_M | `--reasoning on`, `max_tokens=30000` | **18/30** |
| R23 | Huihui Qwen3.6-27B abliterated Q4_K_M | `--reasoning on`, `max_tokens=30000` | **15/30** |
| R28 | Heretic Qwen3.6-27B Q4_K_M | `--reasoning off`, `max_tokens=4096` | **16/30** |
| R28 | Heretic Qwen3.6-27B Q4_K_M | `--reasoning on`, `max_tokens=30000` | **16/30** |
| R26 | stock Qwen3.6-27B Q4_K_M | bounded GAE GBNF, `--reasoning on`, `max_tokens=4096` | **12/30** |

Observed local deltas:

- stock reasoning-on 30k vs stock reasoning-off 4096: **+1 problem**.
- Huihui reasoning-on 30k vs Huihui reasoning-off 4096: **no score change**.
- stock bounded-thinking GAE 4096 vs stock reasoning-off 4096: **-5 problems**.
- Heretic reasoning-on 30k vs Heretic reasoning-off 4096: **no score change**.
- Stock remained ahead of Huihui and Heretic in the local Q4_K_M comparisons.

## What this means

This is a **local-context datapoint**, not a universal claim about ablation.

Narrow interpretation:

1. The local Q4_K_M GGUF setup does **not** reproduce an ablated/Heretic > stock direction.
2. AIME 2026 did not show a clear free-reasoning uplift for stock: `17/30` → `18/30` at much higher output cost.
3. Heretic did not benefit from the 30k reasoning arm in this harness: `16/30` → `16/30`.
4. The 30k reasoning runs remained budget-limited: stock and Huihui hit `finish_reason=length` on **15/30** cases; Heretic hit length on **19/30** cases.
5. The bounded-thinking GAE arm structurally fired on **30/30** cases, but scored **12/30** and still length-finished in the answer body on **17/30** cases.
6. The result should be framed as: **no clear AIME reasoning uplift in this 24GB Q4_K_M setup; no local ablated/Heretic > stock signal; strict bounded GAE was worse than no-think**.

## What this does not mean

This does **not** falsify Bunn/Buun's broader BF16/ablation claim because:

- These are Q4_K_M GGUF models, not BF16.
- Runtime is `llama.cpp` / `llama-server` on a single RTX 3090.
- Prompt, scoring, model provenance, and exact serving defaults may differ.
- Single-pass AIME-30 is noisy; a firm ranking would need multiple passes / prompt variants.
- Buun's Heretic note was about quantization robustness; this receipt tests one canonical-looking Q4_K_M GGUF, not all Heretic quants or BF16.

## Receipts

- R22 — reasoning off, 4096 tokens:  
  [`receipts/2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km.md`](../receipts/2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km.md)

- R23 — reasoning on, 30k tokens:  
  [`receipts/2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on.md`](../receipts/2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on.md)

- R26 — bounded-thinking GAE, 4096 tokens:  
  [`receipts/2026-05-25-3090-aime26-stock-qwen36-27b-q4km-bounded-gae-4096.md`](../receipts/2026-05-25-3090-aime26-stock-qwen36-27b-q4km-bounded-gae-4096.md)

- R28 — Heretic Q4_K_M, reasoning off 4096 and reasoning on 30k:  
  [`receipts/2026-05-26-3090-aime26-heretic-qwen36-27b-q4km.md`](../receipts/2026-05-26-3090-aime26-heretic-qwen36-27b-q4km.md)

## External thread state

### club-3090

Thread: [`noonghunna/club-3090#221`](https://github.com/noonghunna/club-3090/discussions/221)

- Initial R22 datapoint posted.
- `noonghunna` replied that the datapoint is useful and in the right local-Q4 regime.
- He specifically asked for stock Qwen3.6-27B thinking-on vs off on AIME 2026.
- R23 answers that request: stock `17/30` off vs `18/30` on-30k, with high token cost and 15/30 length finishes.
- He then asked for a bounded-thinking arm.
- R26 answers that request with a stricter local GAE grammar: `12/30`, grammar fired 30/30, lower than no-think.
- R23 and R26 follow-ups posted back to the discussion.

### X / @spiritbuun

Tweet posted as a new post because direct reply was blocked by X conversation settings:

- [`https://x.com/sztlink/status/2058899267348009321`](https://x.com/sztlink/status/2058899267348009321)

Content: short local GGUF datapoint with R22/R23 scores, explicitly labeled not BF16 reproduction. `@spiritbuun` asked about max-token cutoff and scorer differences; replied with the two cutoffs and answer-extraction rule. He then suggested the Heretic model, noting it was more resilient to quantization in his testing. R28/R29 answer that prompt locally: Heretic Q4_K_M scored `16/30` both off-4096 and on-30k, below local stock in both comparable settings.

## Suggested next moves

Do **not** keep expanding token budget blindly. The 30k run already spent ~16.3 combined GPU-hours and still length-finished on half the cases.

Useful next variants, if there is a direct request or a clear reason:

1. **Multiple-pass stability**: repeat stock reasoning off/on with 2–3 seeds or prompt variants to estimate noise.
2. **Higher-fidelity quant**: test a better quant or BF16-like path if storage/VRAM/runtime allow.
3. **Bounded grammar design**: if `club-3090` wants an exact DeepSeek scratchpad arm, fix the smoke degeneracy first; do not treat R26 as a general bounded-thinking failure.
4. **Harness sensitivity**: compare answer extraction and prompt shapes on a small subset before another full 30-case run.

Default posture now: wait for responses; do not turn this into a thesis.

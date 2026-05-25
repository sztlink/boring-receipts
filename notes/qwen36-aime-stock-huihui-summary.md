# Qwen3.6-27B AIME 2026 — stock vs Huihui abliterated local GGUF summary

Date: 2026-05-25  
Scope: local RTX 3090 / `llama.cpp` / Q4_K_M GGUF / AIME 2026 full set

## Bottom line

In this local 24GB-GPU Q4_K_M setup, **Huihui/abliterated did not beat stock** on AIME 2026.

| receipt | model | serving | score |
|---|---|---|---:|
| R22 | stock Qwen3.6-27B Q4_K_M | `--reasoning off`, `max_tokens=4096` | **17/30** |
| R22 | Huihui Qwen3.6-27B abliterated Q4_K_M | `--reasoning off`, `max_tokens=4096` | **15/30** |
| R23 | stock Qwen3.6-27B Q4_K_M | `--reasoning on`, `max_tokens=30000` | **18/30** |
| R23 | Huihui Qwen3.6-27B abliterated Q4_K_M | `--reasoning on`, `max_tokens=30000` | **15/30** |

Observed local deltas:

- stock reasoning-on 30k vs stock reasoning-off 4096: **+1 problem**.
- Huihui reasoning-on 30k vs Huihui reasoning-off 4096: **no score change**.
- Stock remained ahead in both bounded and 30k reasoning runs.

## What this means

This is a **local-context datapoint**, not a universal claim about ablation.

Narrow interpretation:

1. The local Q4_K_M GGUF setup does **not** reproduce an ablated > stock direction.
2. AIME 2026 did not show a clear reasoning-on uplift for stock: `17/30` → `18/30` at much higher output cost.
3. The 30k reasoning run remained budget-limited: both stock and Huihui hit `finish_reason=length` on **15/30** cases.
4. The result should be framed as: **no clear AIME reasoning uplift in this 24GB Q4_K_M setup; no local ablated > stock signal**.

## What this does not mean

This does **not** falsify Bunn/Buun's broader BF16/ablation claim because:

- These are Q4_K_M GGUF models, not BF16.
- Runtime is `llama.cpp` / `llama-server` on a single RTX 3090.
- Prompt, scoring, model provenance, and exact serving defaults may differ.
- Single-pass AIME-30 is noisy; a firm ranking would need multiple passes / prompt variants.

## Receipts

- R22 — reasoning off, 4096 tokens:  
  [`receipts/2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km.md`](../receipts/2026-05-24-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km.md)

- R23 — reasoning on, 30k tokens:  
  [`receipts/2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on.md`](../receipts/2026-05-25-3090-aime26-full-stock-vs-huihui-qwen36-27b-q4km-30k-reasoning-on.md)

## External thread state

### club-3090

Thread: [`noonghunna/club-3090#221`](https://github.com/noonghunna/club-3090/discussions/221)

- Initial R22 datapoint posted.
- `noonghunna` replied that the datapoint is useful and in the right local-Q4 regime.
- He specifically asked for stock Qwen3.6-27B thinking-on vs off on AIME 2026.
- R23 answers that request: stock `17/30` off vs `18/30` on-30k, with high token cost and 15/30 length finishes.
- R23 follow-up posted back to the discussion.

### X / @spiritbuun

Tweet posted as a new post because direct reply was blocked by X conversation settings:

- [`https://x.com/sztlink/status/2058899267348009321`](https://x.com/sztlink/status/2058899267348009321)

Content: short local GGUF datapoint with R22/R23 scores, explicitly labeled not BF16 reproduction.

## Suggested next moves

Do **not** keep expanding token budget blindly. The 30k run already spent ~16.3 combined GPU-hours and still length-finished on half the cases.

Useful next variants, if there is a direct request or a clear reason:

1. **Multiple-pass stability**: repeat stock reasoning off/on with 2–3 seeds or prompt variants to estimate noise.
2. **Higher-fidelity quant**: test a better quant or BF16-like path if storage/VRAM/runtime allow.
3. **Harness sensitivity**: compare answer extraction and prompt shapes on a small subset before another full 30-case run.

Default posture now: wait for responses; do not turn this into a thesis.

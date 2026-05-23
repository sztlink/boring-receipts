# Receipt format — changelog

The receipt format evolves via documented critique, not silent revision (CANON §5).
Each change records *why*. Old receipts are never rewritten to a new format — they
are dated gestures of a machine state; later versions add fields, never erase.

## v1.1 — 2026-05-23 — `dedicated_mode`

Added to `environment`:

```yaml
dedicated_mode: true | false      # true = nothing else on the GPU
resident_processes: []            # processes sharing the GPU during the run
idle_baseline_vram_mib: <int>     # VRAM in use before loading the model
idle_baseline_power_w: <int>      # idle power draw
```

**Why.** An external question prompted this refinement: R1 and R2 (2026-05-22) were
generated on a shared workstation with ComfyUI resident (~1.2 GB idle VRAM), and
nothing in the receipt said so. A reader could not tell whether the numbers carried
a hidden tax. A receipt that hides its machine state is not boring — it is
incomplete. The field makes the state explicit and contestable.

**What it surfaced.** R1b/R2b (2026-05-23) re-ran in dedicated mode (idle 687 MiB).
Finding: an **idle resident GPU process costs VRAM headroom but not throughput** —
decode is memory-*bandwidth*-bound, an idle process consumes no bandwidth, only
static VRAM. ~0% speed change, −515 MiB. So `dedicated_mode` matters for *capacity*
(max context/batch that fits), not for tok/s. The specific figure wasn't documented
anywhere; now it is.

**Continuity.** R1/R2 keep a note pointing to R1b/R2b. The delta-sheet SVG is now
generated from the dedicated (R2b) numbers — the clean baseline future rungs
(flash-attn, KV-dtype, vLLM) compare against.

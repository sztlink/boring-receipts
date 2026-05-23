# Receipt format - changelog

The receipt format evolves via documented critique, not silent revision (CANON §5).
Each change records *why*. Old receipts are never silently rewritten to look cleaner:
any backfill must be declared as a preservation/interface pass, not a new run.

## v1.2 - 2026-05-23 - `non_claims`

Added to every Markdown receipt:

```md
## What this receipt does not prove
```

Added to `receipt-template.yaml`:

```yaml
non_claims:
  hardware_scope: null
  command_scope: null
  model_or_dataset_scope: null
  quality_scope: null
  boundary: null
```

**Why.** Casey and Giselle audit, 2026-05-23: the receipt is strongest when it
prevents its own over-reading. Reproducibility is not neutrality, and a receipt can
become a legitimacy sticker if the boundary of the claim is hidden. The new section
makes the non-claim as visible as the result.

**Backfill note.** Existing R1–R12 and RS1–RS2 were backfilled with the non-claim
section as an interface/preservation pass. The measured runs, results and
interpretations were not changed.

**Related public layers.** `HOW-TO-READ.md`, `PROCESS-INDEX.md`, `NEGATIVES.md`,
`GENEALOGY.md` and `PRESERVATION.md` were added in the same pass to stabilize the
reading grammar, process grouping, no-delta visibility, genealogy and archive policy.

## v1.1 - 2026-05-23 - `dedicated_mode`

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
a hidden tax. A receipt that hides its machine state is not boring - it is
incomplete. The field makes the state explicit and contestable.

**What it surfaced.** R1b/R2b (2026-05-23) re-ran in dedicated mode (idle 687 MiB).
Finding: an **idle resident GPU process costs VRAM headroom but not throughput**  -
decode is memory-*bandwidth*-bound, an idle process consumes no bandwidth, only
static VRAM. ~0% speed change, −515 MiB. So `dedicated_mode` matters for *capacity*
(max context/batch that fits), not for tok/s. The specific figure wasn't documented
anywhere; now it is.

**Continuity.** R1/R2 keep a note pointing to R1b/R2b. The delta-sheet SVG is now
generated from the dedicated (R2b) numbers - the clean baseline future rungs
(flash-attn, KV-dtype, vLLM) compare against.

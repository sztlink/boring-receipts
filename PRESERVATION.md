# Preservation policy

Boring Receipts is an archive before it is a site. The live GitHub Pages surface is
a derived exhibit; the durable object is the set of Markdown receipts, structured
indexes, static HTML, SVG assets, scripts and hashes.

## Preservation goals

1. Keep every receipt re-readable without the live site.
2. Keep every visual asset tied to its generator or source data.
3. Preserve negative, blocked and no-delta results with the same care as positive
   results.
4. Make the material stack explicit: NVIDIA/CUDA, GPU model, driver, runtime,
   branch, command, dataset and quality gate.
5. Make migration possible if GitHub Pages, Discord links, vendor downloads or
   model URLs disappear.

## Canonical formats

- **Markdown** - canonical human receipt.
- **YAML/JSON** - structured index and machine-readable receipt metadata when
  available.
- **SVG** - static visual derivative. SVG alone is not canonical unless its data or
  generator is present.
- **HTML/CSS/JS** - public exhibit derived from Markdown and repo state.
- **SHA-256 manifests** - integrity layer for versioned static packages.

## What gets frozen

Each preservation package should include:

```txt
README.md
SUMMARY.md
CANON.md
AXES.md
FORMAT.md
HOW-TO-READ.md
PRESERVATION.md
PROCESS-INDEX.md
NEGATIVES.md
GENEALOGY.md
GLOSSARY.md
CONTRIBUTING.md
receipt-template.md
receipt-template.yaml
data/*.json
receipts/*.md
assets/*.svg
scripts/*.mjs
docs/*.html
htdocs assets used by docs/
SHA256SUMS
manifest.json
```

Clay/outreach drafts are not required in public preservation packages unless they
become part of the public record.

## Export procedure

Run:

```bash
node scripts/export-static-package.mjs
```

The script creates a versioned package in `exports/<date>-boring-receipts-lab/`
with copied Markdown, HTML, JSON, SVG and scripts plus:

- `manifest.json` - file list, sizes and SHA-256 hashes;
- `SHA256SUMS` - portable checksum file;
- `README.md` - package boundary and reconstruction note.

## Reconstruction note

A reader should be able to reconstruct the public surface from a package by opening:

```txt
docs/index.html
```

and reconstruct the receipt library by reading:

```txt
receipts/*.md
SUMMARY.md
PROCESS-INDEX.md
NEGATIVES.md
```

A package does not guarantee that vendor binaries, models or external datasets will
remain downloadable. It preserves the proof trail and the command shape. External
artifacts should be mirrored or hashed in future receipts when license and storage
constraints allow.

## Platform risk

The current public stack depends on GitHub and GitHub Pages. That is acceptable for
circulation, not sufficient for long-term memory. Periodic export packages should be
mirrored outside GitHub when a receipt becomes important to public claims.

## Freezing rule

A receipt can be corrected by adding a new receipt, follow-up note or format
changelog. Do not silently rewrite an old receipt to make it cleaner. The artifact is
the run plus its historical state.

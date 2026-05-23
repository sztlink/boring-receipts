# How to read a boring receipt

> Send branch + command shape. We return boring receipts.

A boring receipt is not a leaderboard entry. It is a small public proof that a
specific command shape ran on a specific machine under a specific state, and that
its limits are visible enough to contest.

## The fixed reading order

Every receipt should be read in the same order. The repetition is the interface.

1. **Claim** - the smallest thing the receipt says happened.
2. **Target** - engine, regime, repo, branch, commit, build, model, dataset if any.
3. **Command** - the exact command shape or command chain that produced the run.
4. **Environment** - OS, driver, CUDA, GPU, VRAM, resident processes, endpoint.
5. **Results** - metrics with their coordinates, never a single speed score.
6. **Quality gate** - the invariant that should not move; a diff here is an alarm.
7. **Evidence** - paths, logs, stdout excerpts, hashes when available.
8. **What this receipt does not prove** - the boundary of the claim.
9. **Next step** - the smallest action that would sharpen the receipt.

## Six rules

1. **A receipt re-executes.** If the command and environment cannot be reconstructed,
   the receipt is incomplete.
2. **Coordinates beat scores.** A speed number without context length, model, quant,
   runtime regime and hardware is a claim, not a receipt.
3. **Negative, blocked and no-delta results have equal standing.** A failed run can
   be more useful than a green number if it removes a false path.
4. **The quality gate is not an axis.** Runtime axes may vary; the behavioral gate is
   the bar that says whether the variation stayed responsible.
5. **The card is not the body.** Boring Receipts is the public reproducibility card;
   research programs such as RealRAG/EPKV live in `turboquant-cuda-bench` and are
   cited, not swallowed.
6. **Reproducibility is not neutrality.** A receipt proves this command shape on this
   material stack. It does not prove universal performance, fairness, usefulness or
   access.

## Status vocabulary

- **PASS** - the command completed and the stated quality gate passed.
- **FAIL** - the command completed or failed in a way that falsifies the target claim.
- **BLOCKED** - the command shape cannot complete in this stack; the blocker is the
  finding.
- **MIXED** - part of the gate passed and part failed.
- **NO DELTA** - the tested intervention did not materially change the baseline.
- **NOT EXERCISED** - no behavioral gate was run; useful only when declared.

## The public boundary sentence

Use this sentence whenever a receipt needs to name the membrane:

```txt
This is the public reproducibility card. The full research/probe body lives in
https://github.com/sztlink/turboquant-cuda-bench and is cited here, not absorbed.
```

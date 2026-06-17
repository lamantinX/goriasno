# Meta-Harness

The harness is itself a system under improvement. Every meaningful run produces evidence; evidence drives scoring; scoring drives one small improvement at a time.

## The 7 scoring dimensions (1 = poor, 5 = excellent)

Score with **evidence, not impressions**. If the run log contains no evidence for a dimension, score it low and say "no evidence in log" — do not infer.

1. **correctness** — change achieves the goal, no regressions.
   - 5: every Contract criterion verified by a concrete command/Playwright step with recorded output; no regressions.
   - 3: criteria met by `npm run verify` only; no criterion-level evidence.
   - 1: build broken or criteria unmet.
2. **context efficiency** — context loaded is proportionate to the tier.
   - 5: files read ≤ tier budget; no full-repo reads; large outputs processed via `ctx_*` not pasted in.
   - 3: minor over-load (read files not modified).
   - 1: whole-repo read, or >5KB raw output pasted into conversation.
3. **diff minimality** — diff is the smallest safe change.
   - 5: every hunk traces to a Contract criterion; no unrelated refactors; no cosmetic churn.
   - 3: one small unrelated cleanup included.
   - 1: scope creep, mixed concerns, large unrelated refactor.
4. **safety** — sensitive surfaces protected, approval obtained where required.
   - 5: sensitive surfaces named pre-task; none touched without approval; no secrets in diff.
   - 3: touched a non-critical sensitive surface without approval, no harm.
   - 1: touched secrets/auth/payment/deploy without approval, or leaked a secret.
5. **verification quality** — criteria verified with real commands + captured outputs.
   - 5: every criterion has command + captured output in Evidence; skipped checks justified.
   - 3: `npm run verify` run and recorded; criterion-level evidence partial.
   - 1: no verification, or "looks done".
6. **speed** — task completed without unnecessary detours or rework.
   - 5: single direct path; no rework; no dead ends.
   - 3: one rework or dead end, recovered quickly.
   - 1: multiple reworks or left broken.
7. **user friction** — user did not have to intervene or correct.
   - 5: zero user corrections; only the initial instruction.
   - 3: one clarification or correction.
   - 1: multiple corrections, or user had to fix the agent's work.

## Cadence

- Score after **every 5 required run logs** (`docs/ai-runs/`, excluding templates).
- Score **immediately** after any run tagged `FAILED`, `ROLLED-BACK`, `SECURITY-SENSITIVE`, or `HIGH-FRICTION`. Do not wait for the 5th log.
- Scoring lives in `docs/ai-runs/harness-scores.md`.

## The improvement loop (concrete)

1. After each scoring, append **exactly one** proposal to `docs/ai-runs/harness-improvements.md`.
2. The proposal is selected from the **lowest-scoring dimension** in the just-scored batch — not from intuition.
3. Proposal fields: `ID`, `Date`, `Dimension`, `Evidence` (which runs/scores), `Proposal` (one small change), `Status: PROPOSED`.
4. The next **Meta-harness improvement** task picks the top `PROPOSED` item, applies it, and sets `Status: APPLIED` with the commit SHA and a before/after note.
5. One proposal per scoring. One application per Meta-harness task. Never batch — small, reversible, evidence-linked steps.

## Failure-mode capture

A harness that has only ever seen 5/5 runs is an untested harness. The first `FAILED`/`ROLLED-BACK` run is **not** an embarrassment — it is the most valuable evidence the loop will get. Capture it fully: root cause, which dimension caught it (or failed to), what rule/hook/script would have prevented it. That capture is itself a proposal.

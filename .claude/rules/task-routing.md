# Task Routing

Every task is classified **before** context loading. The tier decides the plan, context budget, verification minimum, and artifacts. When in doubt, escalate one tier.

## Tiers

### Trivial
- **Trigger:** typo, docs-only, single-line config, no logic change, no `src/` touch (or a 1-line `src/` fix with no behavioral risk).
- **Approval:** not required.
- **Context budget:** Tiny (≤2 files).
- **Verification:** `npm run verify` if `src/` is touched; else none.
- **Run log:** skip **only if** no durable change AND no workflow issue surfaced. Otherwise log.
- **Sprint artifact:** `docs/sprints/<slug>.trivial` containing one line: the reason this is trivial.

### Standard (default)
- **Trigger:** a focused feature or fix, ≤5 files, no sensitive surface (see `security.md`), no new dependency, no architectural change.
- **Approval:** not required (the user's request is the approval).
- **Context budget:** Tiny (≤5 files) or Medium (≤15) — escalate only with a named reason.
- **Verification:** every Contract criterion + `npm run verify`. UI changes: manual browser check via `npm run preview` + screenshot (Playwright pending Plan 007).
- **Run log:** required.
- **Sprint artifact:** `docs/sprints/<slug>.md` with Self-Critique + Self-Evaluation. End Evaluation with `Result: PASS (Self-Evaluated)`.

### Complex
- **Trigger:** multi-file feature, >5 files, new dependency, architectural change, or anything that changes a public interface.
- **Approval:** required — task must go through `improve plan` → user approval → `improve execute`. The approved `plans/<NNN>-*.md` is the Sprint+Contract source; reference it.
- **Context budget:** Medium (≤15), after plan.
- **Verification:** every Contract criterion + `npm run verify` + Playwright for UI (desktop 1280×720 + mobile 375×667, states: loading/empty/error).
- **Run log:** required.
- **Sprint artifact:** full `docs/sprints/<slug>.md`.

### Core-risk
- **Trigger:** touches any sensitive surface in `security.md` (secrets, auth, payment, billing, admin, deploy, PII, production data, `server.js`, `public/sw.js`, `package.json` scripts, CI).
- **Approval:** required, before execution.
- **Context budget:** strictest — every loaded file needs a stated reason.
- **Verification:** every Contract criterion + `npm run verify` + `hostile-evaluator` (critique AND evaluation) + `security-reviewer` on sensitive surfaces.
- **Run log:** required, tagged `SECURITY-SENSITIVE` → triggers **immediate** harness scoring.
- **Sprint artifact:** full `docs/sprints/<slug>.md` with external evaluator rounds.

### Research-only
- **Trigger:** investigation, audit, "find out why", no edits intended.
- **Approval:** not required.
- **Context budget:** as needed (use `ctx_*` tools; keep raw bytes out of conversation).
- **Verification:** N/A (no code change).
- **Run log:** required — documents findings.
- **Sprint artifact:** none.

### Meta-harness improvement
- **Trigger:** harness itself is the object of work (rules, scripts, hooks, scoring, templates).
- **Approval:** required — harness changes affect every future run.
- **Context budget:** `.claude/rules/`, `docs/ai-runs/`, `docs/harness/`, `scripts/`, `AGENTS.md`.
- **Verification:** the harness change applies cleanly + `npm run verify` if any code touched.
- **Run log:** required, tagged `META`.
- **Sprint artifact:** none — the improvement record in `docs/ai-runs/harness-improvements.md` IS the artifact.

## Routing rule
If a task could be two tiers, pick the higher. A task that *might* touch a sensitive surface is Core-risk until proven otherwise.

# Harness Score Log

Score each of the **7 dimensions** from 1 (poor) to 5 (excellent). Rubric definitions live in `.claude/rules/meta-harness.md` — score against them, not against intuition.

**Rule: evidence, not impressions.** If a run log contains no evidence for a dimension, score it low and write "no evidence in log". Do not infer a 5 from silence.

Create an entry after every 5 required run logs and **immediately** after any run tagged `FAILED`, `ROLLED-BACK`, `SECURITY-SENSITIVE`, or `HIGH-FRICTION`. After each entry, append one proposal to `docs/ai-runs/harness-improvements.md` (the meta-harness loop).

---

## Evaluation: 2026-06-17 (runs 001–005) — re-scored under 7-dim rubric

Supersedes the prior 3-dimension entry (context loading / safety checks / execution efficiency: 5/5/4). The prior entry used impressions; this one scores only what the run logs actually contain.

- **correctness (1-5):** 3. `npm run build` passed for each; changes matched the plan scope. No criterion-level evidence in any log → cannot confirm "no regressions" beyond build.
- **context efficiency (1-5):** 3. No run log records the files loaded or context budget used. No evidence either way → 3 ("no evidence in log").
- **diff minimality (1-5):** 3. No `git diff --stat` recorded. Plans 001–003 were single-purpose; the 2 meta setup tasks mixed concerns. Unmeasured → 3.
- **safety (1-5):** 4. No sensitive surfaces touched in this batch. No pre-task sensitive-surface list in any log → cannot award 5.
- **verification quality (1-5):** 2. Verification = "`npm run build` which succeeded" only. No Contract/Evidence sections. No criterion-to-command mapping. This is the weakest dimension.
- **speed (1-5):** 4. Run 001 had one detour (sed-style replace → Node script), recovered quickly. Others direct.
- **user friction (1-5):** 3. No run log records user interactions or corrections. "No evidence in log."

**Total logs evaluated:** 5
**Lowest dimension:** verification quality (2) → drives the next improvement proposal.

**Evidence / notes:**
- Run logs use two different formats (plan-001: Meta/Summary/Workflow; plan-006: Context/Actions/Next Steps) — no standard template enforced.
- No sprint artifacts exist in `docs/sprints/` for any run — the sprint-contract workflow was not actually exercised.

---

## Evaluation: 2026-06-17 (run 006) — re-scored under 7-dim rubric

- **correctness (1-5):** 3. `npm run build && npm run lint` passed. Seven distinct concerns changed in one run; no criterion-level evidence for any.
- **context efficiency (1-5):** 3. No context-load record.
- **diff minimality (1-5):** 2. Run 006 bundled: fix `clean` script, remove `main.tsx` from `sw.js`, add `escapeHTML` to `server.js`, delete `DesignReviewToolbar`, remove design-review state from `App.tsx`, remove calculator types + UI across 4 files, fix theme config. That is 7 concerns in one "clean-up" run — classic scope creep, mixed concerns.
- **safety (1-5):** 2. `server.js` is a sensitive surface (production server). It was touched (HTML-escaping hardening) **without** Core-risk classification or approval. The change was beneficial, but the tier was wrong — a sensitive surface was modified without the Core-risk workflow.
- **verification quality (1-5):** 3. `npm run build && npm run lint` recorded. No criterion-level evidence.
- **speed (1-5):** 3. Sandbox edit restriction in the subagent worktree required a workaround (inline Node scripts for search-and-replace). A detour, recovered.
- **user friction (1-5):** 3. No user-interaction record.

**Total logs evaluated:** 6
**Lowest dimensions:** diff minimality (2) and safety (2) → drive the next improvement proposals.

**Evidence / notes:**
- First run to touch a sensitive surface (`server.js`). The harness did not catch it — no rule at the time flagged `server.js` as sensitive. This is exactly the kind of gap the meta-harness loop exists to close.
- Worktree isolation was used successfully — a practice worth preserving.

---

## Cumulative trend

| Dimension | Eval 1 (001–005) | Eval 2 (006) |
|---|---|---|
| correctness | 3 | 3 |
| context efficiency | 3 | 3 |
| diff minimality | 3 | 2 |
| safety | 4 | 2 |
| verification quality | 2 | 3 |
| speed | 4 | 3 |
| user friction | 3 | 3 |

The trend is real evidence driving real proposals, not a row of 5s. A harness that only scores 5s is not being scored.

---

## Evaluation: 2026-07-10 (run `2026-07-10-seo-canonical-trailing-slash`) — SECURITY-SENSITIVE, immediate scoring

- **correctness (1-5):** 5. Root cause correctly diagnosed (sitemap ↔ 301 ↔ canonical trailing-slash loop). All 7 Contract criteria verified against `dist/` build output AND live production site (sitemap loc, canonical, og:url, internal links, no yandex-verification placeholder, verify pass, all 8 sitemap URLs return 200). Live re-check post-deploy confirms consistency.
- **context efficiency (1-5):** 5. Run log records Files in/out explicitly. Context budget stated (Core — 10 files, each with reason). No speculative reads; diagnosis used targeted curl/grep on the live site + minimal source reads.
- **diff minimality (1-5):** 5. Every hunk traces to a Contract criterion (sitemap→C1, pageUrl→C2/C3, links→C4, meta removal→C5). Plus one follow-up test-selector fix forced by the CI gate. No unrelated changes.
- **safety (1-5):** 4. Correctly classified Core-risk (touches `public/` + production deploy). Sensitive surfaces named pre-task. User approval ("делай и деплой") recorded. Not a 5 only because no `security-reviewer` pass was run on the `public/sitemap.xml` change (the change is low-risk metadata, but the Core-risk workflow names that step).
- **verification quality (1-5):** 4. Criterion-to-command mapping in both sprint and run log. `npm run verify` recorded (PASS). Live post-deploy curl checks recorded. The one gap: local Playwright skipped (webkit libs missing in WSL) — caught instead by CI, which is a real gate but means the first push failed publicly before the test-selector fix. See Failures.
- **speed (1-5):** 3. One public CI failure (Playwright selector `a[href="/anthracite"]` not updated alongside the link change) required a second push. The pre-push `npm run test` would have caught it locally, but webkit browsers can't launch in this WSL environment. Net: two CI runs, ~7 min of extra wall time.
- **user friction (1-5):** 5. One clarifying question asked up front (trailing-slash format) via AskUserQuestion; user answered with a counter-question, resolved with a concise explanation + proceeded. No corrections to the work itself.

**Total logs evaluated:** 7 (cumulative)
**Lowest dimension:** speed (3) — driven by the CI-failure-retry loop.

**Evidence / notes:**
- The CI gate did exactly its job: caught the stale test selector before any production code changed (deploy job is downstream of test). Production was never served broken code.
- This is the first run to use the full Core-risk → CI-gated-deploy path end-to-end with live post-deploy verification. The workflow held.
- Speed hit was real but bounded — a single selector string the local environment couldn't pre-validate.

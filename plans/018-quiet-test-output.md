# Plan 018: Quiet test/verify output so it stops loading agent context memory

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat ed02f69..HEAD -- scripts/run-quiet.sh AGENTS.md docs/harness/README.md .claude/rules/testing.md`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / Meta-harness
- **Planned at**: commit `ed02f69`, 2026-06-18 (re-authored for bash/WSL2 on 2026-06-19)
- **Issue**: (not published)

## Why this matters

When an agent runs `npm run verify` or `npm run test` through its shell tool,
every line of stdout/stderr is returned into the conversation and stays in
context for the rest of the session. A clean `vite build` prints the full
chunk list (~30–60 lines); `tsc --noEmit` on success prints nothing but on
failure dumps a long error block; `playwright test` prints dot progress plus
a per-file summary. None of this is useful on a green run — the agent only
needs the exit code — yet all of it burns reasoning capacity, exactly what
`.claude/rules/context-budget.md` forbids ("Keep raw bytes out of the
conversation"). There is currently no way to run the project's verification
commands without that output entering context.

This plan adds a tiny bash wrapper, `scripts/run-quiet.sh`, that runs the
**identical** `npm run <script>` command, captures all output, and prints it
**only on failure** (propagating the real exit code). On success it prints a
single `PASS` line. The AGENTS.md / harness README / testing rule are updated
to point agents at the quiet form for routine verification gates. Nothing is
disabled, skipped, or weakened — the verify gate still runs `npm run verify`
in full; only the destination of stdout on success changes.

## Current state

Recon facts the executor needs:

- `package.json` scripts (do NOT modify in this plan — see Scope):
  - `"verify": "npm run lint && npm run build"`
  - `"lint": "tsc --noEmit"`
  - `"build": "vite build"`
  - `"test": "playwright test"`
  - `"dev": "vite --port=3000 --host=0.0.0.0"`
- `scripts/` contains the bash enforcement scripts: `install-hooks.sh`,
  `run-log-check.sh`, `sprint-artifacts.sh`, `sprint-gate.sh` — all using
  `#!/usr/bin/env bash` + `set -euo pipefail`. **Match that style** for the
  new script (see `scripts/run-log-check.sh` as the exemplar for the
  shebang/header/flag-parsing pattern).
- Environment: WSL2/Linux, shell is `bash`. `npm` is on PATH. The agent's
  shell tool runs bash, so `bash scripts/run-quiet.sh ...` invocations work
  directly. (`pwsh` is NOT installed on this machine — the prior PowerShell
  form of this plan would not run here.)
- Plan 007 (Playwright e2e) is **DONE** — `playwright.config.ts` and
  `npm run test` exist and work. The "pending Plan 007" lines in AGENTS.md
  and `docs/harness/README.md` are stale and get fixed by this plan as a
  drive-by on the same sections being edited.

Exact current text at the locations this plan edits (verify these match
before editing — drift check above):

`AGENTS.md:33-39`:
```
## Test commands

- Verify (mandatory pre-commit): `npm run verify` (= `lint` + `build`)
- Build/Typecheck: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`
- Playwright e2e: pending Plan 007
```

`docs/harness/README.md:66-72`:
```
## Test commands

- `npm run verify` — mandatory minimum pre-commit (`lint` + `build`).
- `npm run dev` — dev server on port 3000.
- `npm run build` — production build.
- `npm run lint` — `tsc --noEmit`.
- Playwright e2e — pending Plan 007.
```

`docs/harness/README.md:17` (Structure table, `scripts/` row):
```
| `scripts/` | Enforcement + scaffolding: `sprint-gate.sh`, `sprint-artifacts.sh`, `run-log-check.sh`, `install-hooks.sh`. |
```

`.claude/rules/testing.md:12-14`:
```
## What `npm run verify` is

`npm run verify` = `npm run lint && npm run build` (i.e. `tsc --noEmit` + `vite build`). It is the **mandatory minimum** before any commit that touches `src/`, `public/`, `server.js`, or `package.json`.
```

`.claude/rules/context-budget.md` "Keep raw bytes out" section (the rule this
plan operationalizes for the shell-tool case — reference it, do not edit):
references Glob/Grep/Read/Bash/Explore agent and forbids pasting >5KB of raw
output into the conversation.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Typecheck | `npm run lint` | exit 0, no output |
| Build | `npm run build` | exit 0, chunk list on stdout |
| Verify gate | `npm run verify` | exit 0 (= lint && build) |
| Playwright e2e | `npm run test` | exit 0 (needs dev server; playwright.config.ts auto-starts it) |
| New wrapper (verify) | `bash scripts/run-quiet.sh verify` | exit 0, prints exactly one line: `verify : PASS (output suppressed)` |
| New wrapper (negative path) | `bash scripts/run-quiet.sh no-such-script` | exit 1, prints the captured npm error (proves failure path emits output) |

## Scope

**In scope** (the only files you should create or modify):
- `scripts/run-quiet.sh` (CREATE)
- `AGENTS.md` (edit the `## Test commands` block, lines ~33-39)
- `docs/harness/README.md` (edit the `## Test commands` block lines ~66-72 AND the `scripts/` row in the Structure table, line ~17)
- `.claude/rules/testing.md` (add one new section after line 14; do NOT touch the Forbidden section)

**Out of scope** (do NOT touch, even though they look related):
- `package.json` — intentionally NOT modified. `package.json scripts` is a
  Core-risk sensitive surface (`.claude/rules/task-routing.md` Core-risk
  trigger). The wrapper is invoked as `bash scripts/run-quiet.sh ...`, NOT as
  an npm script, so no `*:quiet` npm scripts are added. This keeps the task
  purely Meta-harness and avoids changing existing script behavior.
- `.claude/rules/context-budget.md` — referenced, not edited.
- `.claude/rules/task-routing.md`, `meta-harness.md`, `security.md` — not touched.
- Any file under `src/`, `public/`, `server.js`, `tests/`, `playwright.config.ts`.
- The git hook `.git/hooks/pre-push` and `scripts/install-hooks.sh`.

## Git workflow

- Branch: `advisor/018-quiet-test-output` (matches prior `advisor/NNN-*` convention in `git log`).
- Commit per logical unit (script; then docs); message style: conventional commits, matching repo (`chore(harness): ...`). Example from `git log`: `chore: add sprint artifact for plan 008`.
  - Suggested commit 1: `chore(harness): add run-quiet.sh wrapper for silent-on-pass test output`
  - Suggested commit 2: `docs(harness): document quiet test commands and drop stale Plan 007 pending`
- Do NOT push or open a PR unless the operator instructed it (see Maintenance notes for the sprint-gate interaction if they do).

## Steps

### Step 1: Create `scripts/run-quiet.sh`

Create the file with EXACTLY this content:

```bash
#!/usr/bin/env bash
# scripts/run-quiet.sh
#
# Runs `npm run <script>` with all stdout/stderr captured; prints the captured
# output ONLY on failure. On success prints a single PASS line.
#
# Purpose: keep test/verify output out of the agent's conversation context on
# green runs (see .claude/rules/context-budget.md). This does NOT disable,
# skip, or weaken any check — the underlying `npm run <script>` runs in full
# and the real exit code is propagated.
#
# Usage:
#   bash scripts/run-quiet.sh verify
#   bash scripts/run-quiet.sh test
#   bash scripts/run-quiet.sh lint
#   bash scripts/run-quiet.sh build
#   bash scripts/run-quiet.sh verify --loud   # print all output (debug)
#
# Satisfies the mandatory `npm run verify` before commit, because it runs
# `npm run verify` internally and propagates its exit code.
set -uo pipefail

if [ $# -lt 1 ]; then
    echo "run-quiet: <script> is required." >&2
    exit 2
fi

script="$1"; shift
loud=0
for arg in "$@"; do
    case "$arg" in
        --loud|-L) loud=1 ;;
        *) echo "run-quiet: unknown flag '$arg'" >&2; exit 2 ;;
    esac
done

if [ "$loud" -eq 1 ]; then
    npm run "$script"
    exit $?
fi

# Capture combined output; do NOT use `set -e` here so we can read $?.
tmp="$(mktemp)"
npm run "$script" > "$tmp" 2>&1
code=$?

if [ "$code" -ne 0 ]; then
    echo "--- $script FAILED (exit $code) ---" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    exit "$code"
fi

rm -f "$tmp"
echo "$script : PASS (output suppressed)"
exit 0
```

Make it executable: `chmod +x scripts/run-quiet.sh`.

**Verify**:
- `bash scripts/run-quiet.sh lint` → exit 0, exactly one line `lint : PASS (output suppressed)` and nothing else.
- `bash scripts/run-quiet.sh no-such-script` → exit 1, prints `--- no-such-script FAILED (exit 1) ---` followed by the npm `Missing script` error. (Confirms the failure path emits output.)

### Step 2: Update `AGENTS.md` `## Test commands` (lines 33-39)

Replace the block:
```
## Test commands

- Verify (mandatory pre-commit): `npm run verify` (= `lint` + `build`)
- Build/Typecheck: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`
- Playwright e2e: pending Plan 007
```
with:
```
## Test commands

- Verify (mandatory pre-commit): `npm run verify` (= `lint` + `build`)
- Build/Typecheck: `npm run build`
- Lint: `npm run lint`
- Dev server: `npm run dev`
- Playwright e2e: `npm run test`

### Quiet variants (agent context hygiene)

Running `npm run verify` / `npm run test` via a shell tool loads every line
of output into the agent's conversation memory for the whole session (see
`.claude/rules/context-budget.md`). For routine verification gates prefer
the quiet wrapper — it runs the IDENTICAL npm command but prints output only
on failure and propagates the real exit code:

- `bash scripts/run-quiet.sh verify` — verify gate, silent on pass.
- `bash scripts/run-quiet.sh test`    — Playwright e2e, silent on pass.
- `bash scripts/run-quiet.sh lint`    — `tsc --noEmit`, silent on pass.
- `bash scripts/run-quiet.sh build`   — `vite build`, silent on pass.
- Add `--loud` to any of the above to print all output (use when debugging a failure).

The quiet wrapper does NOT disable or skip any check; it satisfies the
mandatory-verify-before-commit rule because it runs `npm run verify`
internally. Use the raw `npm run ...` form when you need to read the output.
```

**Verify**: `grep -n "pending Plan 007" AGENTS.md` → no matches. `grep -n "run-quiet" AGENTS.md` → matches in the new subsection.

### Step 3: Update `docs/harness/README.md`

3a. Structure table, line 17 — replace:
```
| `scripts/` | Enforcement + scaffolding: `sprint-gate.sh`, `sprint-artifacts.sh`, `run-log-check.sh`, `install-hooks.sh`. |
```
with:
```
| `scripts/` | Enforcement + scaffolding: `sprint-gate.sh`, `sprint-artifacts.sh`, `run-log-check.sh`, `install-hooks.sh`, `run-quiet.sh` (silent-on-pass output wrapper). |
```

3b. `## Test commands` block, lines 66-72 — replace:
```
## Test commands

- `npm run verify` — mandatory minimum pre-commit (`lint` + `build`).
- `npm run dev` — dev server on port 3000.
- `npm run build` — production build.
- `npm run lint` — `tsc --noEmit`.
- Playwright e2e — pending Plan 007.
```
with:
```
## Test commands

- `npm run verify` — mandatory minimum pre-commit (`lint` + `build`).
- `npm run dev` — dev server on port 3000.
- `npm run build` — production build.
- `npm run lint` — `tsc --noEmit`.
- `npm run test` — Playwright e2e.
- Quiet variants (agent context hygiene, see `.claude/rules/context-budget.md`):
  `bash scripts/run-quiet.sh <verify|test|lint|build>` — runs the same npm
  command but prints output only on failure; add `--loud` to debug.
```

**Verify**: `grep -n "pending Plan 007" docs/harness/README.md` → no matches. `grep -n "run-quiet" docs/harness/README.md` → 2 matches (Structure row + Test commands).

### Step 4: Add a section to `.claude/rules/testing.md`

Insert a new section immediately AFTER line 14 (the `## What npm run verify is` paragraph) and BEFORE `## Criterion-level evidence` (line 16). Do not alter the Forbidden section. New text:

```
## Quiet wrapper for agent context hygiene

`bash scripts/run-quiet.sh verify` runs the IDENTICAL `npm run verify` and
propagates its exit code, but suppresses stdout/stderr on success — printing
the full captured output only on failure. This keeps verify output out of the
agent's conversation memory on green runs (see
`.claude/rules/context-budget.md`). It does NOT disable, skip, or weaken any
check (see Forbidden below); use the raw `npm run verify` when you need to
read the output. The quiet wrapper satisfies the mandatory-verify-before-commit
rule because it runs `npm run verify` internally.
```

**Verify**: `grep -n "Quiet wrapper" .claude/rules/testing.md` → 1 match (the new heading). `grep -n "Disabling lint/build" .claude/rules/testing.md` → still 1 match, unchanged (Forbidden section untouched).

### Step 5: Dogfood the wrapper and confirm the verify gate still holds

Run verification through the new wrapper to confirm end-to-end behavior:

- `bash scripts/run-quiet.sh verify` → exit 0, one line `verify : PASS (output suppressed)`.
- `npm run verify` → exit 0 (sanity: the repo still builds/lints with the raw command; nothing was broken).
- `bash scripts/run-quiet.sh verify --loud` → exit 0, prints the full `vite build` chunk list (confirms `--loud` bypass).

If `npm run test` (Playwright) is runnable in your environment (browsers
installed, port 3000 free), also run `bash scripts/run-quiet.sh test` and
expect exit 0 + one PASS line. If Playwright browsers are not installed, skip
with a recorded reason per `testing.md` "Skipped checks" (check name, reason,
remaining risk) — this does not block the plan since the wrapper's
correctness is already proven by the verify/lint/build and negative-path runs.

## Test plan

No product code changes → no new product tests. The wrapper itself is the
unit under test:

- Happy path (silent on pass): `bash scripts/run-quiet.sh lint` → exit 0, one green line, no other stdout. (lint/tsc on success emits no stdout, so this is the cleanest assertion.)
- Failure path (loud on fail): `bash scripts/run-quiet.sh no-such-script` → exit 1, captured npm error printed.
- Loud bypass: `bash scripts/run-quiet.sh verify --loud` → exit 0, full build output visible.
- Gate equivalence: `npm run verify` and `bash scripts/run-quiet.sh verify` return the same exit code on the same tree.

Run those four commands and record results in the sprint/run-log Evidence section.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `scripts/run-quiet.sh` exists and `bash scripts/run-quiet.sh lint` exits 0 printing exactly one line.
- [ ] `bash scripts/run-quiet.sh no-such-script` exits non-zero AND prints the captured npm error (failure path emits output).
- [ ] `bash scripts/run-quiet.sh verify --loud` exits 0 and prints full build output (bypass works).
- [ ] `npm run verify` exits 0 (repo unchanged; gate intact).
- [ ] `grep -rn "pending Plan 007" AGENTS.md docs/harness/README.md` → no matches.
- [ ] `grep -rn "run-quiet" AGENTS.md docs/harness/README.md .claude/rules/testing.md` → matches in all three files.
- [ ] `.claude/rules/testing.md` "Forbidden" section is byte-identical to before (`git diff .claude/rules/testing.md` shows additions only, no deletions in the Forbidden block).
- [ ] `package.json` is NOT modified (`git diff package.json` → empty).
- [ ] No files outside the in-scope list are modified (`git status --porcelain` lists only the 4 in-scope files).
- [ ] `plans/README.md` status row for 018 updated.

## STOP conditions

Stop and report back (do not improvise) if:

- The code at the locations in "Current state" doesn't match the excerpts (the codebase has drifted).
- `bash scripts/run-quiet.sh lint` prints more than the one PASS line on a clean tree (means output is leaking past the capture — do not patch silently; report the bash version and the exact output).
- `npm run verify` fails on the untouched tree (means the repo was already broken before you started — report, do not fix product code).
- A step's verification fails twice after a reasonable fix attempt.
- The fix appears to require touching an out-of-scope file (especially `package.json`).
- You discover `npm` is not on PATH on this machine (the wrapper depends on that).

## Maintenance notes

For the human/agent who owns this code after the change lands:

- **What future changes interact with this:** any new `npm run <x>` script is
  automatically usable via `bash scripts/run-quiet.sh <x>` — no wrapper edit
  needed. Prefer script names without spaces (repo convention).
- **Sprint-gate / push:** this is a Meta-harness task
  (`.claude/rules/task-routing.md` → Meta-harness improvement), which
  requires NO sprint artifact (the harness-improvements record IS the
  artifact). The default here is commit-only (no push), so
  `scripts/sprint-gate.sh` (pre-push hook) is not triggered. IF the operator
  later asks to push/PR this branch, the hook will block it for lacking a
  sprint artifact — either (a) merge manually without pushing the branch, or
  (b) add a minimal `docs/sprints/advisor-018-quiet-test-output.md` with
  `Result: PASS` to satisfy the hook. This is a known harness tension for
  Meta tasks, not a bug in this plan.
- **Harness bookkeeping (executor must do):** per the Meta-harness loop
  (`docs/harness/README.md`), append a run log in `docs/ai-runs/` using
  `_TEMPLATE.md`, tagged `META`, and record this improvement as `APPLIED`
  with the commit SHA in `docs/ai-runs/harness-improvements.md`. Since this
  is a user-directed Meta improvement (not the top `PROPOSED` item), note
  that in the run log.
- **Reviewer focus in the PR:** confirm the wrapper does not swallow the
  exit code (`$?` propagated), confirm `package.json` is untouched, confirm
  the testing.md Forbidden section is unchanged, and confirm the stale
  "pending Plan 007" lines were removed (Plan 007 is DONE).

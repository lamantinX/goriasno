# Security

## Sensitive surfaces

Touching any of the following requires **Core-risk tier + explicit user approval before execution**:

- `.env*`, `*.env`, any file matching `*secret*` / `*key*` / `*token*` / `*credential*`.
- Auth surfaces: anything matching `auth/*`, `*login*`, `*session*`, `*password*`.
- Payment / billing: anything matching `payment/*`, `billing/*`, `*checkout*`, `*stripe*`.
- Admin surfaces: anything matching `admin/*`, `*dashboard*` (privileged).
- Deploy / infra: `server.js`, `public/sw.js` (caches production assets), `package.json` `scripts`, `.github/workflows/*`, `Dockerfile*`, `vercel.json`, `netlify.toml`, fly/render configs.
- Production data: any database file, `*.db`, `*.sqlite`, production logs, user data, PII.
- The harness itself: `.claude/rules/*`, `docs/harness/*`, `scripts/*`, `.git/hooks/*` — harness changes affect every future run.

## Never (without exception)

- Commit, log, or hardcode secrets, tokens, keys, passwords, connection strings.
- Disable safety checks, lint, or verification to make a commit pass.
- Force-push (`git push --force` / `--force-with-lease`) without explicit approval.
- Run destructive shell against anything outside `dist/` (`rm -rf`, `Remove-Item -Recurse -Force` on non-build dirs).
- Drop, truncate, or migrate production data.
- Change deploy logic, CI, or branch protection without approval.

## Core-risk workflow

1. Plan → user approval **before** execution.
2. Name every sensitive surface the task will touch, pre-task, in the sprint file.
3. `hostile-evaluator` in **critique** mode — expand Contract criteria until it finds no gaps.
4. Implement with minimal diff; no unrelated changes on a Core-risk branch.
5. `security-reviewer` on every sensitive surface touched.
6. `hostile-evaluator` in **evaluation** mode — failures go in the sprint file; fix and re-evaluate.
7. Run log tagged `SECURITY-SENSITIVE` → triggers immediate harness scoring.

## If you discover a sensitive surface mid-task

Stop. Re-classify as Core-risk. Get approval before continuing. Do not "finish quickly" — a sensitive surface touched without approval is a security incident, not a shortcut.

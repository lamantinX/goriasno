#!/usr/bin/env bash
# scripts/sprint-gate.sh
# Sprint gate: blocks push if docs/sprints/<slug>.md is missing or lacks "Result: PASS".
# Auto-detects slug from current branch. Override with --slug <slug>.
# Wired into .git/hooks/pre-push by scripts/install-hooks.sh.
#
# Usage:
#   bash scripts/sprint-gate.sh                # auto-detect from branch
#   bash scripts/sprint-gate.sh --slug my-feat # explicit slug
#   bash scripts/sprint-gate.sh --dry-run      # report only, do not fail
set -euo pipefail

slug=""
dry_run=0

while [ $# -gt 0 ]; do
    case "$1" in
        --slug)   slug="${2:-}"; shift 2 ;;
        --dry-run) dry_run=1; shift ;;
        *) echo "sprint-gate: unknown arg '$1'" >&2; exit 2 ;;
    esac
done

fail() {
    echo "sprint-gate: FAIL — $1" >&2
    cat >&2 <<'EOF'
  Create the sprint artifact:  bash scripts/sprint-artifacts.sh sprint --slug <slug> --title "Title" --class Standard
  Or mark trivial:              bash scripts/sprint-artifacts.sh trivial --slug <slug> -- "reason"
EOF
    if [ "$dry_run" -eq 1 ]; then echo "(dry-run: not blocking)" >&2; exit 0; fi
    exit 1
}

if [ -z "$slug" ]; then
    branch="$(git branch --show-current 2>/dev/null || true)"
    if [ -z "$branch" ]; then
        echo "sprint-gate: FAIL — cannot determine current branch." >&2
        exit 1
    fi
    # Integration branches are not gated (merges, releases). Only feature branches are.
    if [ "$branch" = "main" ] || [ "$branch" = "staging" ]; then
        echo "sprint-gate: SKIP — integration branch '$branch' is not gated."
        exit 0
    fi
    # branch -> slug: strip common prefixes, replace / with -
    slug="$(printf '%s' "$branch" | sed -E 's/^(feature|fix|chore|refactor|plan|meta)\///; s:/:-:g')"
fi

if [ -z "$slug" ]; then
    echo "sprint-gate: FAIL — empty slug." >&2
    exit 1
fi

sprint_file="docs/sprints/$slug.md"
trivial_file="docs/sprints/$slug.trivial"

if [ -f "$trivial_file" ]; then
    reason="$(tr -d '\r\n' < "$trivial_file" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//')"
    echo "sprint-gate: PASS (trivial) — $reason"
    exit 0
fi

if [ ! -f "$sprint_file" ]; then
    fail "sprint artifact not found: $sprint_file"
fi

if ! grep -Eq '^[[:space:]]*Result:[[:space:]]*PASS' "$sprint_file"; then
    fail "sprint file exists but has no 'Result: PASS' line: $sprint_file"
fi

line="$(grep -E '^[[:space:]]*Result:' "$sprint_file" | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' | head -n1)"
echo "sprint-gate: PASS — $sprint_file ($line)"

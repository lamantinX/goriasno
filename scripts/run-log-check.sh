#!/usr/bin/env bash
# scripts/run-log-check.sh
# Post-task enforcement: verifies a new run-log entry appeared in docs/ai-runs/
# for a Standard+ task. Run by the agent at task end.
#
# Checks (any one passes):
#   1. A working-tree change (new/modified .md) in docs/ai-runs/ (git status),
#      excluding _TEMPLATE.md, harness-scores.md, harness-improvements.md.
#   2. A .md file in docs/ai-runs/ named *-<today>-*.md (today's run).
#   3. HEAD added a .md to docs/ai-runs/ vs merge-base with main.
#
# Usage:
#   bash scripts/run-log-check.sh
#   bash scripts/run-log-check.sh --dry-run
set -euo pipefail

dry_run=0
[ "${1:-}" = "--dry-run" ] && dry_run=1

exclude_re='_TEMPLATE\.md|harness-scores\.md|harness-improvements\.md'
today="$(date +%Y-%m-%d)"

is_run_log() {  # arg: basename; returns 0 if it is a real run log .md
    local name="$1"
    echo "$name" | grep -Eq "$exclude_re" && return 1
    echo "$name" | grep -Eq '\.md$' || return 1
    return 0
}

# Check 1: working-tree changes in docs/ai-runs/
wt_new=0
while IFS= read -r line; do
    [ -z "$line" ] && continue
    # porcelain XY <space> path
    p="${line:3}"
    name="$(basename "$p")"
    if is_run_log "$name"; then wt_new=1; break; fi
done < <(git status --porcelain -- docs/ai-runs/ 2>/dev/null || true)

# Check 2: today's run file
today_file=""
if compgen -G "docs/ai-runs/*-$today-*.md" > /dev/null 2>&1; then
    for f in docs/ai-runs/*-"$today"-*.md; do
        is_run_log "$(basename "$f")" && { today_file="$f"; break; }
    done
fi

# Check 3: HEAD vs merge-base with main
head_new=0
if git rev-parse --verify -q main > /dev/null 2>&1; then
    base="$(git merge-base main HEAD 2>/dev/null || true)"
    if [ -n "$base" ]; then
        while IFS= read -r p; do
            [ -z "$p" ] && continue
            is_run_log "$(basename "$p")" && { head_new=1; break; }
        done < <(git diff --name-only "$base" HEAD -- docs/ai-runs/ 2>/dev/null || true)
    fi
fi

if [ "$wt_new" -eq 1 ] || [ -n "$today_file" ] || [ "$head_new" -eq 1 ]; then
    if [ "$wt_new" -eq 1 ]; then how="working-tree change"
    elif [ -n "$today_file" ]; then how="today's file: $today_file"
    else how="new vs main"; fi
    echo "run-log-check: PASS — run log present ($how)."
    exit 0
fi

echo "run-log-check: FAIL — no new run-log entry found in docs/ai-runs/." >&2
cat >&2 <<'EOF'
  Scaffold one:  bash scripts/sprint-artifacts.sh runlog --slug <slug> --title "Title"
  Template:      docs/ai-runs/_TEMPLATE.md
EOF
if [ "$dry_run" -eq 1 ]; then echo "(dry-run: not blocking)" >&2; exit 0; fi
exit 1

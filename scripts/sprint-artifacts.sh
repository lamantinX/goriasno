#!/usr/bin/env bash
# scripts/sprint-artifacts.sh
# Scaffolds sprint and run-log files from the project templates.
#
# Usage:
#   bash scripts/sprint-artifacts.sh sprint  --slug <slug> --title "Title" --class <Class>
#   bash scripts/sprint-artifacts.sh trivial --slug <slug> -- "reason"
#   bash scripts/sprint-artifacts.sh runlog  --slug <slug> --title "Title"
set -euo pipefail

if [ $# -lt 1 ]; then
    echo "usage: sprint-artifacts.sh <sprint|trivial|runlog> ..." >&2
    exit 2
fi

command="$1"; shift
slug=""
title=""
class="Standard"
rest=()

case "$command" in
    sprint|trivial|runlog) ;;
    *) echo "sprint-artifacts: unknown command '$command' (expected sprint|trivial|runlog)" >&2; exit 2 ;;
esac

# Parse flags, then collect positional args after `--`.
while [ $# -gt 0 ]; do
    case "$1" in
        --slug)  slug="${2:-}"; shift 2 ;;
        --title) title="${2:-}"; shift 2 ;;
        --class) class="${2:-}"; shift 2 ;;
        --) shift; while [ $# -gt 0 ]; do rest+=("$1"); shift; done ;;
        *) rest+=("$1"); shift ;;
    esac
done

if [ -z "$slug" ]; then echo "sprint-artifacts: --slug <slug> is required." >&2; exit 2; fi
today="$(date +%Y-%m-%d)"

case "$command" in
    sprint)
        dest="docs/sprints/$slug.md"
        if [ -f "$dest" ]; then echo "exists: $dest"; exit 0; fi
        branch="$(git branch --show-current 2>/dev/null || echo "$slug")"
        out="$(sed \
            -e "s#<title>#$title#g" \
            -e "s#<branch>#$branch#g" \
            -e "s#<YYYY-MM-DD>#$today#g" \
            -e "s#Trivial | Standard | Complex | Core-risk#$class#g" \
            -e "s#PENDING | PASS | PASS (Self-Evaluated) | FAIL#PENDING#g" \
            docs/sprints/_TEMPLATE.md)"
        printf '%s\n' "$out" > "$dest"
        echo "created: $dest"
        ;;
    trivial)
        dest="docs/sprints/$slug.trivial"
        if [ "${#rest[@]}" -gt 0 ]; then reason="${rest[*]}"
        elif [ -n "$title" ]; then reason="$title"
        else reason="trivial change"; fi
        printf 'trivial: %s\n' "$reason" > "$dest"
        echo "created: $dest ($reason)"
        ;;
    runlog)
        dest="docs/ai-runs/$today-$slug.md"
        if [ -f "$dest" ]; then echo "exists: $dest"; exit 0; fi
        sed "s|<title>|$title|g" docs/ai-runs/_TEMPLATE.md > "$dest"
        echo "created: $dest"
        ;;
esac

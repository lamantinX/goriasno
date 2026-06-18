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

#!/usr/bin/env bash
# scripts/install-hooks.sh
# Installs the sprint-gate pre-push hook into .git/hooks/pre-push.
# Run once per clone. Re-runnable.
#
# Usage: bash scripts/install-hooks.sh
set -euo pipefail

git_dir=".git"
hook_path="$git_dir/hooks/pre-push"
if [ ! -d "$git_dir" ]; then
    echo "install-hooks: FAIL — not a git repository (.git missing)." >&2
    exit 1
fi
mkdir -p "$git_dir/hooks"

cat > "$hook_path" <<'EOF'
#!/bin/sh
# Installed by scripts/install-hooks.sh — sprint gate.
# Blocks push if the current branch has no passing sprint artifact.
while read -r local_ref local_sha remote_ref remote_sha; do :; done
bash scripts/sprint-gate.sh
exit $?
EOF
chmod +x "$hook_path"

echo "install-hooks: installed $hook_path"
echo "  The hook calls: bash scripts/sprint-gate.sh"
echo "  Bypass only with explicit user approval (Core-risk rule)."

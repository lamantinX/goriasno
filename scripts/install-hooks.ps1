# scripts/install-hooks.ps1
# Installs the sprint-gate pre-push hook into .git/hooks/pre-push.
# Run once per clone. Re-runnable.
#
# Usage: pwsh scripts/install-hooks.ps1

$ErrorActionPreference = 'Stop'

$hookPath = '.git/hooks/pre-push'
$gitDir = '.git'
if (-not (Test-Path -LiteralPath $gitDir)) {
    Write-Host "install-hooks: FAIL — not a git repository (.git missing)." -ForegroundColor Red
    exit 1
}

$snippet = @'
#!/bin/sh
# Installed by scripts/install-hooks.ps1 - sprint gate.
# Blocks push if the current branch has no passing sprint artifact.
args="$*"
while read -r local_ref local_sha remote_ref remote_sha; do :; done
pwsh scripts/sprint-gate.ps1
exit $?
'@

Set-Content -LiteralPath $hookPath -Value $snippet -Encoding ascii
# chmod only on Unix-likes; Windows git ignores the exec bit.
if (Get-Command chmod -ErrorAction SilentlyContinue) {
    & chmod +x $hookPath 2>$null
}
Write-Host "install-hooks: installed $hookPath" -ForegroundColor Green
Write-Host "  The hook calls: pwsh scripts/sprint-gate.ps1" -ForegroundColor DarkGray
Write-Host "  Bypass only with explicit user approval (Core-risk rule)." -ForegroundColor DarkGray

# scripts/sprint-gate.ps1
# Sprint gate: blocks push if docs/sprints/<slug>.md is missing or lacks "Result: PASS".
# Auto-detects slug from current branch. Override with -Slug <slug>.
# Wired into .git/hooks/pre-push by scripts/install-hooks.ps1.
#
# Usage:
#   pwsh scripts/sprint-gate.ps1                # auto-detect from branch
#   pwsh scripts/sprint-gate.ps1 -Slug my-feat  # explicit slug
#   pwsh scripts/sprint-gate.ps1 -DryRun        # report only, do not fail
[CmdletBinding()]
param(
    [string]$Slug,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

if (-not $Slug) {
    $branch = (& git branch --show-current).Trim()
    if (-not $branch) {
        Write-Host "sprint-gate: FAIL — cannot determine current branch." -ForegroundColor Red
        exit 1
    }
    # Integration branches are not gated (merges, releases). Only feature branches are.
    if ($branch -eq 'main' -or $branch -eq 'staging') {
        Write-Host "sprint-gate: SKIP — integration branch '$branch' is not gated." -ForegroundColor DarkGray
        exit 0
    }
    # branch -> slug: strip common prefixes, replace / with -
    $Slug = ($branch -replace '^(feature|fix|chore|refactor|plan|meta)/', '') -replace '/', '-'
}

if (-not $Slug) {
    Write-Host "sprint-gate: FAIL — empty slug." -ForegroundColor Red
    exit 1
}

$sprintFile = "docs/sprints/$Slug.md"
$trivialFile = "docs/sprints/$Slug.trivial"

function Fail($msg) {
    Write-Host "sprint-gate: FAIL — $msg" -ForegroundColor Red
    Write-Host "  Create the sprint artifact:  pwsh scripts/sprint-artifacts.ps1 sprint -s $Slug -t `"Title`" -c Standard" -ForegroundColor Yellow
    Write-Host "  Or mark trivial:              pwsh scripts/sprint-artifacts.ps1 trivial -s $Slug `"reason`"" -ForegroundColor Yellow
    if ($DryRun) { Write-Host "(dry-run: not blocking)" -ForegroundColor DarkGray; exit 0 }
    exit 1
}

if (Test-Path -LiteralPath $trivialFile) {
    $reason = (Get-Content -LiteralPath $trivialFile -Raw).Trim()
    Write-Host "sprint-gate: PASS (trivial) — $reason" -ForegroundColor Green
    exit 0
}

if (-not (Test-Path -LiteralPath $sprintFile)) {
    Fail "sprint artifact not found: $sprintFile"
}

$content = Get-Content -LiteralPath $sprintFile -Raw
if ($content -notmatch '(?m)^\s*Result:\s*PASS') {
    Fail "sprint file exists but has no 'Result: PASS' line: $sprintFile"
}

$line = ($content -split "`n" | Where-Object { $_ -match '^\s*Result:' }).Trim()
Write-Host "sprint-gate: PASS — $sprintFile ($line)" -ForegroundColor Green
exit 0

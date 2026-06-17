# scripts/run-log-check.ps1
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
#   pwsh scripts/run-log-check.ps1
#   pwsh scripts/run-log-check.ps1 -DryRun
[CmdletBinding()]
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$exclude = @('_TEMPLATE.md', 'harness-scores.md', 'harness-improvements.md')
$today = (Get-Date).ToString('yyyy-MM-dd')

function IsRunLog($name) {
    foreach ($e in $exclude) { if ($name -eq $e) { return $false } }
    return $name -like '*.md'
}

# Check 1: working-tree changes
$status = (& git status --porcelain -- docs/ai-runs/) 2>$null
$wtNew = $false
foreach ($line in $status) {
    if (-not $line) { continue }
    $p = $line.Substring(3).Trim('"')
    $name = Split-Path -Leaf $p
    if (IsRunLog $name) { $wtNew = $true; break }
}

# Check 2: today's run file
$todayFile = (Get-ChildItem -Path docs/ai-runs -Filter "*-$today-*.md" -ErrorAction SilentlyContinue |
    Where-Object { IsRunLog $_.Name } | Select-Object -First 1)

# Check 3: HEAD vs merge-base with main
$headNew = $false
$mainRef = (& git rev-parse --verify -q main) 2>$null
if ($LASTEXITCODE -eq 0) {
    $base = (& git merge-base main HEAD) 2>$null
    if ($LASTEXITCODE -eq 0) {
        $diff = (& git diff --name-only $base HEAD -- docs/ai-runs/) 2>$null
        foreach ($p in $diff) {
            $name = Split-Path -Leaf $p
            if (IsRunLog $name) { $headNew = $true; break }
        }
    }
}

if ($wtNew -or $todayFile -or $headNew) {
    $how = if ($wtNew) { 'working-tree change' } elseif ($todayFile) { "today's file: $($todayFile.Name)" } else { 'new vs main' }
    Write-Host "run-log-check: PASS — run log present ($how)." -ForegroundColor Green
    exit 0
}

Write-Host "run-log-check: FAIL — no new run-log entry found in docs/ai-runs/." -ForegroundColor Red
Write-Host "  Scaffold one:  pwsh scripts/sprint-artifacts.ps1 runlog -s <slug> `"Title`"" -ForegroundColor Yellow
Write-Host "  Template:      docs/ai-runs/_TEMPLATE.md" -ForegroundColor Yellow
if ($DryRun) { Write-Host "(dry-run: not blocking)" -ForegroundColor DarkGray; exit 0 }
exit 1

# scripts/sprint-artifacts.ps1
# Scaffolds sprint and run-log files from the project templates.
#
# Usage:
#   pwsh scripts/sprint-artifacts.ps1 sprint  -s <slug> -t "Title" -c <Class>
#   pwsh scripts/sprint-artifacts.ps1 trivial -s <slug> "reason"
#   pwsh scripts/sprint-artifacts.ps1 runlog  -s <slug> "Title"
[CmdletBinding()]
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet('sprint', 'trivial', 'runlog')]
    [string]$Command,

    [string]$Slug,
    [string]$Title,
    [ValidateSet('Trivial', 'Standard', 'Complex', 'Core-risk')]
    [string]$Class = 'Standard',

    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Rest
)

$ErrorActionPreference = 'Stop'

if (-not $Slug) { throw "-Slug <slug> is required." }
$today = (Get-Date).ToString('yyyy-MM-dd')

switch ($Command) {
    'sprint' {
        $dest = "docs/sprints/$Slug.md"
        if (Test-Path -LiteralPath $dest) { Write-Host "exists: $dest"; exit 0 }
        $tpl = Get-Content -LiteralPath 'docs/sprints/_TEMPLATE.md' -Raw
        $out = $tpl -replace '<title>', ($Title) `
                    -replace '<branch>', (& git branch --show-current) `
                    -replace '<YYYY-MM-DD>', $today `
                    -replace 'Trivial \| Standard \| Complex \| Core-risk', $Class `
                    -replace 'PENDING \| PASS \| PASS \(Self-Evaluated\) \| FAIL', 'PENDING'
        Set-Content -LiteralPath $dest -Value $out -Encoding utf8
        Write-Host "created: $dest"
    }
    'trivial' {
        $dest = "docs/sprints/$Slug.trivial"
        $reason = if ($Rest) { $Rest -join ' ' } elseif ($Title) { $Title } else { 'trivial change' }
        Set-Content -LiteralPath $dest -Value "trivial: $reason`n" -Encoding utf8
        Write-Host "created: $dest ($reason)"
    }
    'runlog' {
        $dest = "docs/ai-runs/$today-$Slug.md"
        if (Test-Path -LiteralPath $dest) { Write-Host "exists: $dest"; exit 0 }
        $tpl = Get-Content -LiteralPath 'docs/ai-runs/_TEMPLATE.md' -Raw
        $out = $tpl -replace '<title>', ($Title)
        Set-Content -LiteralPath $dest -Value $out -Encoding utf8
        Write-Host "created: $dest"
    }
}

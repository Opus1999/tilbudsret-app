#Requires -Version 5.1

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$envFile   = Join-Path $scriptDir '.env'

Write-Host ''
Write-Host '  Tilbudsret API Server' -ForegroundColor Cyan
Write-Host '  -----------------------------------------' -ForegroundColor DarkGray
Write-Host ''

# Indlaes .env
if (-not (Test-Path $envFile)) {
    Write-Host "  FEJL: .env ikke fundet ($envFile)" -ForegroundColor Red
    exit 1
}

$loaded = 0
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $val = $Matches[2].Trim()
        $val = $val.Trim('"').Trim("'")
        [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
        Set-Item -Path "Env:$key" -Value $val
        $preview = if ($val.Length -gt 12) { $val.Substring(0, 8) + '...' } else { '***' }
        Write-Host "  $key = $preview" -ForegroundColor Green
        $loaded++
    }
}

Write-Host ''
Write-Host "  $loaded variabler indlaest fra .env" -ForegroundColor DarkGray
Write-Host ''

# Verificer nogler
$missing = @()
if (-not $env:SALLING_API_KEY)   { $missing += 'SALLING_API_KEY' }
if (-not $env:ANTHROPIC_API_KEY) { $missing += 'ANTHROPIC_API_KEY' }

if ($missing.Count -gt 0) {
    Write-Host '  ADVARSEL: Manglende nogler:' -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Yellow }
    Write-Host ''
}

# Start ts-node direkte
$tsNode = Join-Path $scriptDir 'node_modules\.bin\ts-node.cmd'

if (-not (Test-Path $tsNode)) {
    Write-Host "  FEJL: ts-node ikke fundet - koer 'npm install' i scraper/" -ForegroundColor Red
    exit 1
}

Write-Host '  Server starter paa http://localhost:3000' -ForegroundColor Cyan
Write-Host '  Tryk Ctrl+C for at stoppe' -ForegroundColor DarkGray
Write-Host ''

Set-Location $scriptDir
# -r dotenv/config loader .env direkte i Node-processen som backup
& $tsNode '-r' 'dotenv/config' 'src/server.ts'

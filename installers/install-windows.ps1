param(
    [switch]$User = $false
)

Write-Host "Installing Arc Programming Language..." -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$root = Resolve-Path "$scriptDir/.."
$cliPath = Join-Path $root "src/cli.js"

if (-not (Test-Path $cliPath)) {
    Write-Error "Cannot find $cliPath"
    exit 1
}

try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Error "Node.js not found. Please install Node.js first."
    exit 1
}

if ($User) {
    $installDir = "$env:LOCALAPPDATA\Arc"
    $pathScope = "User"
} else {
    $installDir = "$env:ProgramFiles\Arc"
    $pathScope = "Machine"
}

Write-Host "Installing to: $installDir" -ForegroundColor Yellow

New-Item -ItemType Directory -Path $installDir -Force | Out-Null

$batchContent = @"
@echo off
node "$cliPath" %*
"@

$batchPath = Join-Path $installDir "arc.cmd"
$batchContent | Out-File -FilePath $batchPath -Encoding ASCII

Write-Host "Created launcher: $batchPath" -ForegroundColor Green

$currentPath = [Environment]::GetEnvironmentVariable("Path", $pathScope)
if ($currentPath -notlike "*$installDir*") {
    Write-Host "Adding to PATH..." -ForegroundColor Yellow
    $newPath = "$currentPath;$installDir"
    [Environment]::SetEnvironmentVariable("Path", $newPath, $pathScope)
    Write-Host "Added to PATH" -ForegroundColor Green
    Write-Host "Please restart your terminal for PATH changes to take effect" -ForegroundColor Yellow
} else {
    Write-Host "Already in PATH" -ForegroundColor Green
}

Write-Host ""
Write-Host "Arc is now installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Try these commands (after restarting terminal):" -ForegroundColor Cyan
Write-Host "  arc version"
Write-Host "  arc init my-project"
Write-Host "  arc run file.arc"
Write-Host ""
Write-Host "For help: arc help" -ForegroundColor Cyan
Write-Host ""

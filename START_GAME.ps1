$ErrorActionPreference = "SilentlyContinue"
Set-Location $PSScriptRoot
Write-Host "NEON CLASH v3 - Pixel Arcade Edition" -ForegroundColor Cyan
Write-Host "Abrindo em http://localhost:8080" -ForegroundColor Gray

if (Get-Command py) {
    Start-Process py -ArgumentList "-m http.server 8080" -WindowStyle Minimized
} elseif (Get-Command python) {
    Start-Process python -ArgumentList "-m http.server 8080" -WindowStyle Minimized
} elseif (Get-Command npx) {
    Start-Process npx -ArgumentList "--yes serve . -l 8080" -WindowStyle Minimized
} else {
    Start-Process "$PSScriptRoot\index.html"
    Write-Host "Python/Node não encontrados. O jogo foi aberto diretamente." -ForegroundColor Yellow
    exit
}

Start-Sleep -Seconds 2
Start-Process "http://localhost:8080"

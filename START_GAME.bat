@echo off
chcp 65001 >nul
setlocal
title NEON CLASH v3 - Pixel Arcade Edition

cd /d "%~dp0"

echo.
echo ==================================================
echo          NEON CLASH v3 - PIXEL ARCADE
echo ==================================================
echo.
echo Iniciando servidor local para melhor suporte a:
echo - Controle Xbox / PlayStation
echo - Audio do navegador
echo - Tela cheia
echo.

where py >nul 2>nul
if %errorlevel%==0 (
    start "NEON CLASH Server" /min cmd /c "py -m http.server 8080"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8080"
    exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
    start "NEON CLASH Server" /min cmd /c "python -m http.server 8080"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8080"
    exit /b
)

where npx >nul 2>nul
if %errorlevel%==0 (
    start "NEON CLASH Server" /min cmd /c "npx --yes serve . -l 8080"
    timeout /t 3 /nobreak >nul
    start "" "http://localhost:8080"
    exit /b
)

echo Python/Node nao encontrados.
echo Abrindo index.html diretamente.
echo Para melhor suporte a controle, instale Python ou Node.js.
timeout /t 2 /nobreak >nul
start "" "%~dp0index.html"

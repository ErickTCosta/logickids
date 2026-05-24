@echo off
setlocal enabledelayedexpansion

color 0A
title LogicKids - GitHub Upload Script

cls
echo ============================================================
echo   LogicKids - Upload para GitHub
echo ============================================================
echo.

cd /d C:\Users\Admin\Downloads\logickids\logickids

REM Inicializar git
echo [1] Inicializando repositorio Git...
git init
git config user.name "LogicKids Developer"
git config user.email "dev@logickids.local"

echo.
echo [2] Adicionando arquivos...
git add -A

echo.
echo [3] Criando commit inicial...
git commit -m "feat: Initial commit - LogicKids com geracao dinamica de questoes via Gemini"

echo.
echo [4] Adicionando remote (GitHub)...
git remote add origin https://github.com/ErickTCosta/logickids.git

echo.
echo [5] Fazendo push para GitHub...
git branch -M main
git push -u origin main

echo.
echo ============================================================
echo   ✅ Upload Completo!
echo ============================================================
echo.
echo Repositorio: https://github.com/ErickTCosta/logickids
echo.
pause

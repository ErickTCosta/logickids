@echo off
setlocal enabledelayedexpansion

color 0A
title LogicKids - Git Push Fix

cd /d C:\Users\Admin\Downloads\logickids\logickids

echo ============================================================
echo   LogicKids - Enviando Correcao
echo ============================================================
echo.

echo [1] Adicionando arquivos...
git add -A

echo.
echo [2] Criando commit...
git commit -m "fix: Add missing createdAt field to fallback questions

- Fixed TypeScript type error in getSessionQuestions()
- Fallback questions now include createdAt: Date property
- Matches Prisma Question model schema
- Resolves Vercel build failure"

echo.
echo [3] Fazendo push...
git push origin main

echo.
echo ============================================================
echo   ✅ Correcao Enviada!
echo ============================================================
echo.
echo O Vercel deve fazer rebuild automaticamente.
echo.
pause

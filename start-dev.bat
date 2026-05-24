@echo off
color 0A
title LogicKids - Dev Server com Logs Gemini
cls

echo ============================================================
echo   LogicKids - Teste de Conexao Gemini
echo ============================================================
echo.
echo [Iniciando servidor em...]
echo   http://localhost:3000
echo.
echo [Dicas:]
echo   1. Login: ana.lima / 123@aluno
echo   2. Crie uma senha (primeira vez)
echo   3. Escolha uma categoria e clique "Iniciar Quiz"
echo   4. OS LOGS APARECERAM NESTE TERMINAL!
echo.
echo [Logs esperados:]
echo   [QUIZ] 🎯 Buscando 5 questoes
echo   [GEMINI] 🚀 Iniciando geracao
echo   [GEMINI] ✅ Resposta recebida
echo   [GEMINI] ✨ Sucesso! X questoes extraidas
echo.
echo Pressione qualquer tecla para iniciar...
pause >nul

cd /d C:\Users\Admin\Downloads\logickids\logickids
npm run dev


#!/bin/bash
# Script para testar a geração de questões com Gemini

echo "=================================="
echo "LogicKids - Teste de Conexão Gemini"
echo "=================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Verificar variáveis de ambiente
echo -e "${BLUE}[1] Verificando variáveis de ambiente...${NC}"
if [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ GEMINI_API_KEY não está definida no .env${NC}"
else
    echo -e "${GREEN}✅ GEMINI_API_KEY definida${NC}"
fi

echo ""

# 2. Verificar banco de dados
echo -e "${BLUE}[2] Verificando banco de dados...${NC}"
if grep -q "DATABASE_URL" .env; then
    echo -e "${GREEN}✅ DATABASE_URL encontrada${NC}"
else
    echo -e "${RED}❌ DATABASE_URL não encontrada${NC}"
fi

echo ""

# 3. Dar instruções
echo -e "${YELLOW}[3] Para testar manualmente:${NC}"
echo ""
echo "1. Abra um terminal e execute:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "2. Quando o servidor ligar, o terminal mostrará logs como:"
echo -e "   ${GREEN}[QUIZ] 🎯 Buscando 5 questões: matematica/facil${NC}"
echo -e "   ${GREEN}[GEMINI] 🚀 Iniciando geração de 5 questões${NC}"
echo -e "   ${GREEN}[GEMINI] 📤 Enviando requisição para API...${NC}"
echo -e "   ${GREEN}[GEMINI] ✅ Resposta recebida em 2543ms${NC}"
echo ""
echo "3. Acesse no navegador:"
echo -e "   ${BLUE}http://localhost:3000/student${NC}"
echo ""
echo "4. Login:"
echo -e "   Username: ${BLUE}ana.lima${NC}"
echo -e "   Password: ${BLUE}123@aluno${NC}"
echo ""
echo "5. Crie uma nova senha quando solicitado"
echo ""
echo "6. Escolha uma categoria e clique em 'Iniciar Quiz'"
echo ""
echo "7. Volte ao terminal e veja os logs do Gemini!"
echo ""
echo -e "${YELLOW}Logs esperados no terminal:${NC}"
echo -e "  ${GREEN}✅ Questões geradas com sucesso${NC}"
echo -e "  ${GREEN}✅ Questões salvas no banco de dados${NC}"
echo -e "  ${GREEN}✅ Sessão pronta com 5 questões${NC}"
echo ""

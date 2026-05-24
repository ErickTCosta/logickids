# Sistema de Geração de Questões

## Visão Geral

O LogicKids agora possui um sistema **inteligente de geração de questões** que combina:

- ✅ **Geração dinâmica** com Google Gemini
- ✅ **Cache no banco de dados** para reutilização
- ✅ **Fallback automático** para questões estáticas

## Fluxo de Funcionamento

Quando um aluno inicia uma sessão de quiz, o sistema executa este fluxo:

```
┌─────────────────────────────────────────┐
│ 1. Aluno solicita sessão de quiz        │
│    (Categoria: Matemática, Dif: Fácil)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│ 2. Buscar questões em cache (BD)        │
│    WHERE category='matematica' AND      │
│         difficulty='facil'              │
└────────────────┬────────────────────────┘
                 │
         ┌───────┴────────┐
         │                │
    5 questões ✓          Insuficientes
         │                │
         │                ▼
         │      ┌──────────────────────────┐
         │      │ 3. Tentar Gemini        │
         │      │    Gerar 2-5 questões  │
         │      │    (JSON estruturado)  │
         │      └──────────┬─────────────┘
         │                 │
         │         ┌───────┴────────┐
         │         │                │
         │     Sucesso ✓       Falha ✗
         │         │                │
         │         ▼                ▼
         │    ┌──────────────┐ ┌──────────────┐
         │    │Salvar no BD  │ │ Usar Fallback│
         │    │(aiGenerated) │ │ (QUESTION_   │
         │    │Marcar como   │ │  BANK)       │
         │    │reutilizável  │ └──────────────┘
         │    └──────┬───────┘         │
         │           │                 │
         └───────────┴─────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │ 4. Embaralhar + Enviar│
         │    5 questões ao aluno│
         └───────────────────────┘
```

## Exemplos

### Cenário 1: Sucesso com Gemini

```
1. Busca: 3 questões em cache (insuficiente)
2. Gemini: Gera 2 questões novas
3. Total: 5 questões (3 cache + 2 geradas)
4. Salva: As 2 novas questões no BD com aiGenerated=true
```

### Cenário 2: Falha de Gemini com Fallback

```
1. Busca: 0 questões em cache
2. Gemini: Erro de API/timeout
3. Fallback: 5 questões do QUESTION_BANK
4. Resultado: Aluno consegue jogar normalmente
```

### Cenário 3: Mix (Cache + Gemini + Fallback)

```
1. Busca: 2 questões em cache
2. Gemini: Gera 2 questões
3. Fallback: Usa 1 do QUESTION_BANK
4. Total: 5 questões (2 cache + 2 IA + 1 estática)
```

## Implementação Técnica

### Função Principal: `getSessionQuestions()`

```typescript
async function getSessionQuestions(
  category: QuestionCategory, // matematica, sequencia, padroes, logica, robo, espacial
  difficulty: DifficultyLevel, // facil, medio, dificil
  limit: number, // quantas questões buscar (normalmente 5)
);
```

**Passos:**

1. **Busca em cache**: `prisma.question.findMany()` com `{ category, difficulty }`
2. **Gemini** (se necessário): Chama `generateQuestionsWithGemini()` para gerar faltantes
3. **Fallback** (se necessário): Filtra `QUESTION_BANK` da categoria/dificuldade
4. **Embaralha**: `sort(() => Math.random() - 0.5).slice(0, limit)`

### Função de Geração: `generateQuestionsWithGemini()`

```typescript
async function generateQuestionsWithGemini(
  category: QuestionCategory,
  difficulty: DifficultyLevel,
  count: number, // quantas gerar
);
```

**O que faz:**

1. Constrói um prompt detalhado com descrição de categoria e dificuldade
2. Requisita JSON estruturado do Gemini
3. Extrai o array JSON da resposta com regex
4. Salva cada questão no BD com `aiGenerated: true`
5. Retorna questões criadas ou `[]` em caso de erro

**Prompt enviado (exemplo):**

```
Gere 2 questões em JSON puro para crianças em português.

Categoria: matematica - Matemática básica (soma, subtração, multiplicação, divisão)
Dificuldade: facil

Retorne EXATAMENTE este formato JSON (um array):
[
  {
    "text": "Pergunta em português simples",
    "emoji": "um emoji relevante",
    "options": ["opção1", "opção2", "opção3", "opção4"],
    "correctIdx": 0,
    "explanation": "Explicação simples para a criança aprender"
  }
]
```

## Banco de Dados

### Modelo Question (Prisma)

```prisma
model Question {
  id          String    @id @default(cuid())
  text        String    // "João tinha 12 figurinhas..."
  emoji       String    @default("")  // "🃏"
  options     String[]  // ["18","20","22","16"]
  correctIdx  Int       // 1 (índice da resposta correta)
  explanation String    // "12 + 8 = 20..."
  category    String    // "matematica"
  difficulty  String    // "facil"
  aiGenerated Boolean   @default(false)  // ← MARCA QUESTÕES GERADAS
  timesUsed   Int       @default(0)      // Contador de usos
  createdAt   DateTime  @default(now())
  attempts    Attempt[]
}
```

### Query Otimizada

```sql
-- Buscar questões ordenadas por uso (para diversificar)
SELECT * FROM "Question"
WHERE category = 'matematica'
  AND difficulty = 'facil'
ORDER BY timesUsed ASC
LIMIT 15;
```

## Variáveis de Ambiente

### Obrigatório

```env
GEMINI_API_KEY=seu_api_key_aqui
```

### Sem Gemini (Fallback Total)

Se `GEMINI_API_KEY` não estiver definido:

- Skipa tentativa de geração (`generateQuestionsWithGemini()` retorna `[]`)
- Usa cache + fallback apenas

## Boas Práticas

### Para Desenvolvedores

1. **Testar sem Gemini**: Remova `GEMINI_API_KEY` do `.env.local` para validar fallback
2. **Monitorar logs**: `console.error()` em `generateQuestionsWithGemini()` registra falhas
3. **Duplicação**: O regex `/\[[\s\S]*\]/` extrai o primeiro JSON da resposta
4. **Rate Limiting**: Google Gemini tem limite de requisições gratuitas; considere cache agressivo

### Para Produção (Vercel)

```bash
# Adicionar ao Vercel
vercel env add GEMINI_API_KEY

# Verificar
vercel env pull   # Baixa as envs
```

## Troubleshooting

### Nenhuma questão aparece

1. ✅ Verificar se `.env.local` tem `GEMINI_API_KEY`
2. ✅ Verificar logs do servidor: `"Erro ao gerar questões com Gemini"`
3. ✅ Rodar `npm run db:seed` para popular QUESTION_BANK

### Questões duplicadas

- Sistema usa `aiGenerated: false` para QUESTION_BANK (não duplica)
- Questões geradas do Gemini podem ser ligeiramente variadas mesmo na mesma categoria

### Gemini retorna texto inválido

- Regex tenta extrair `[...]` da resposta
- Se falhar, `generateQuestionsWithGemini()` retorna `[]` e fallback ativa

### Performance lenta

- Gemini leva ~2-3s por requisição
- Cache (BD) é rápido
- Considere limitar gerações por hora/dia em futuro

## Futuras Melhorias

- [ ] Adicionar rate limiting (máx 10 gerações/dia)
- [ ] Cachear respostas do Gemini por categoria/dificuldade
- [ ] Permitir customização de prompt per categoria
- [ ] Dashboard para ver % de questões geradas vs estáticas
- [ ] Export de questões geradas como dataset

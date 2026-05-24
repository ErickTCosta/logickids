# 🧪 Teste de Conexão Gemini - Guia Rápido

## ✅ O que foi adicionado

Adicionei **logs detalhados** no código para você acompanhar a conexão com Gemini em tempo real no terminal.

## 🚀 Como Testar (3 Passos)

### Passo 1: Iniciar o Servidor

Abra o **Prompt de Comando** ou **PowerShell** na pasta do projeto:

```cmd
cd C:\Users\Admin\Downloads\logickids\logickids
npm run dev
```

Você verá algo como:

```
> next dev
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
  - Environments: .env
```

### Passo 2: Fazer Login e Iniciar Quiz

1. Abra no navegador: `http://localhost:3000/student`
2. Faça login:
   - **Username:** `ana.lima`
   - **Password:** `123@aluno`
3. Crie uma nova senha quando solicitado
4. Clique em qualquer **categoria** (ex: Matemática)
5. Clique em **"Iniciar Quiz"**

### Passo 3: Acompanhar os Logs

Volte ao **terminal/cmd** onde você rodou `npm run dev`.

Você deve ver logs assim:

```
[QUIZ] 🎯 Buscando 5 questões: matematica/facil
[QUIZ] 🔍 Procurando em cache...
[QUIZ] ✅ Encontradas 0 questões em cache
[QUIZ] ⚠️  Insuficientes! Faltam 5 questões
[GEMINI] 🚀 Iniciando geração de 5 questões (matematica/facil)
[GEMINI] 📤 Enviando requisição para API...
[GEMINI] ✅ Resposta recebida em 2543ms (status: 200)
[GEMINI] 📖 JSON parseado com sucesso
[GEMINI] 🔍 Procurando JSON na resposta (8240 caracteres)...
[GEMINI] 📋 Array JSON encontrado, parseando...
[GEMINI] ✨ Sucesso! 5 questões extraídas
[GEMINI] 💾 Salvando questões no banco de dados...
[GEMINI]   → Questão 1: "João tinha 12 maçãs..."
[GEMINI]   → Questão 2: "Uma caixa tem 24 bombons..."
[GEMINI]   → Questão 3: "Pedro tem 5 reais..."
[GEMINI]   → Questão 4: "Qual é o próximo número: 2, 4, 6..."
[GEMINI]   → Questão 5: "Uma pizza foi cortada em 8 pedaços..."
[GEMINI] ✅ 5 questões salvas no BD com aiGenerated=true
[QUIZ] 📌 Gemini gerou 5 questões
[QUIZ] 🎲 Embaralhando 5 questões e selecionando 5...
[QUIZ] ✨ Sessão pronta: 5 questões (5 IA, 0 estáticas)
```

## 📊 O que Cada Log Significa

| Log                             | Significado                          |
| ------------------------------- | ------------------------------------ |
| `[QUIZ] 🎯`                     | Quiz iniciando, buscando questões    |
| `[QUIZ] ✅ Encontradas 0`       | Sem questões em cache (primeira vez) |
| `[GEMINI] 🚀`                   | Gemini sendo chamado                 |
| `[GEMINI] 📤`                   | Enviando requisição para API Google  |
| `[GEMINI] ✅ Resposta recebida` | API respondeu com sucesso            |
| `[GEMINI] ✨ Sucesso!`          | Questões geradas com sucesso         |
| `[GEMINI] 💾`                   | Salvando no banco de dados           |
| `[QUIZ] ✨ Sessão pronta`       | Quiz pronto para o aluno             |

## 🔴 Se Aparecer Erro

### Erro: `GEMINI_API_KEY não definida`

```
[GEMINI] ⚠️  GEMINI_API_KEY não definida - usando fallback
```

**Solução:** Verificar se `.env` tem `GEMINI_API_KEY=AIzaSy...`

### Erro: `❌ Erro HTTP 401`

```
[GEMINI] ❌ Erro HTTP 401: Unauthorized
```

**Solução:** Sua chave Gemini expirou ou está inválida. Gere uma nova em:

- https://aistudio.google.com/app/apikey

### Erro: `❌ Regex não encontrou array JSON`

```
[GEMINI] ❌ Regex não encontrou array JSON
[GEMINI] Primeiros 300 caracteres: {...}
```

**Solução:** Gemini retornou algo que não é JSON válido. Tente novamente.

### Nenhum erro, mas sem logs do Gemini

**Significado:** As questões vieram do **cache** (banco de dados) ou **fallback** (QUESTION_BANK)

Isso é **esperado** na segunda requisição, pois as questões já foram salvas!

## 🧪 Teste Completo

### Primeira Requisição (Deve gerar com Gemini)

1. Login
2. Clique em categoria
3. **Terminal deve mostrar logs `[GEMINI]`** ← Sucesso! ✅

### Segunda Requisição (Deve usar cache)

1. Fazer logout
2. Login novamente
3. Clique na **mesma categoria**
4. **Terminal deve mostrar `[QUIZ] ✅ Encontradas X questões em cache`** ← Sucesso! ✅

## 💡 Dicas

- Se quer forçar geração novamente: delete a tabela `Question` no banco
- Se quer testar sem Gemini: remova `GEMINI_API_KEY` de `.env`
- Os logs estão em tempo real - veja enquanto o quiz carrega

## 📝 Resumo

✅ Código modificado com logs detalhados  
✅ Quando você fizer login e clicar em quiz, verá os logs  
✅ Primeira vez geralmente mostra `[GEMINI]` logs  
✅ Próximas vezes pode usar cache (sem logs de Gemini)  
✅ Se houver erro, vai aparecer no terminal

**Agora é só rodar `npm run dev` e testar! 🚀**

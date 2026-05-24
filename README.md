# LogicKids — Next.js Fullstack

Portal interativo de raciocínio lógico para crianças, com painel do professor e área do aluno.

## Stack

| Camada    | Tecnologia                 | Custo        |
| --------- | -------------------------- | ------------ |
| Fullstack | Next.js 14 (App Router)    | gratuito     |
| Banco     | Neon PostgreSQL serverless | **gratuito** |
| ORM       | Prisma 5                   | gratuito     |
| IA        | Google Gemini 2.0 Flash    | **gratuito** |
| Auth      | JWT + bcrypt               | gratuito     |
| Deploy    | Vercel                     | **gratuito** |

---

## Fluxo de usuários

### Professor

1. Acessa `/teacher` → login ou cadastro
2. Cadastra alunos pelo painel (nome + série opcional)
3. Username gerado automaticamente: `"João da Silva"` → `joao.silva`
4. Compartilha com o aluno: **usuário** + senha padrão `123@aluno`
5. Acompanha desempenho na aba Relatório

### Aluno

1. Acessa `/student` → login com username + `123@aluno`
2. **1º acesso:** é redirecionado para criar a própria senha
3. Após criar a senha, acessa o quiz normalmente
4. Escolhe categoria → responde 5 questões → ganha XP e sobe de nível

---

## Instalação e execução local

### Clone do GitHub

```bash
# 1. Clonar repositório
git clone https://github.com/ErickTCosta/logickids.git
cd logickids

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com as credenciais do Neon, JWT e Gemini

# 4. Criar tabelas no banco Neon
npm run db:push

# 5. Popular com professor + alunos + questões demo
npm run db:seed

# 6. Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

### Setup Manual (Primeira Vez)

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com as credenciais do Neon, JWT e Gemini

# 3. Criar tabelas no banco Neon
npm run db:push

# 4. Popular com professor + alunos + questões demo
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

### Credenciais criadas pelo seed

| Tipo      | Credencial                             |
| --------- | -------------------------------------- |
| Professor | `professor@logickids.com` / `prof@123` |
| Aluno 1   | `ana.lima` / `123@aluno`               |
| Aluno 2   | `carlos.melo` / `123@aluno`            |
| Aluno 3   | `beatriz.nunes` / `123@aluno`          |
| Aluno 4   | `rafael.santos` / `123@aluno`          |
| Aluno 5   | `julia.pires` / `123@aluno`            |

> Todos os alunos serão solicitados a criar nova senha no 1º login.

---

## Configurar banco Neon (5 min)

1. Crie conta em **https://neon.tech**
2. Novo projeto → nome: `logickids`
3. "Connection Details" → driver: **Prisma**
4. Copie as duas strings para `.env.local`:
   - `DATABASE_URL` → conexão pooled (produção)
   - `DIRECT_URL` → conexão direta (migrations/seed)

## Configurar Gemini (2 min)

1. Acesse **https://aistudio.google.com/app/apikey**
2. "Create API Key" → cole em `GEMINI_API_KEY`
3. **Recomendado** — o sistema gera questões dinamicamente com Gemini, com fallback para questões estáticas se a API falhar

### Como funciona a geração de questões

- **1º lugar:** Tenta gerar questões dinâmicas com Gemini (IA)
- **2º lugar:** Se Gemini falhar, usa questões em cache do banco de dados
- **3º lugar:** Se ainda insuficientes, usa o banco estático (QUESTION_BANK) como fallback
- Questões geradas são salvas no BD com `aiGenerated: true` para reutilização

## Gerar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Deploy no Vercel

```bash
npm i -g vercel
vercel login
vercel

# Adicionar variáveis de ambiente
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add JWT_SECRET
vercel env add GEMINI_API_KEY

vercel --prod
```

Ou via GitHub: importe o repositório em **vercel.com/new** e adicione as 4 variáveis no painel.

---

## Estrutura do projeto

```
logickids/
├── prisma/
│   ├── schema.prisma       ← Modelos: Teacher, Student, Question, Attempt, Session
│   └── seed.ts             ← Popula banco com professor + alunos + questões
├── src/
│   ├── app/
│   │   ├── page.tsx                       ← Rota raiz (escolha professor/aluno)
│   │   ├── teacher/page.tsx               ← Painel do professor
│   │   ├── student/page.tsx               ← App do aluno
│   │   ├── globals.css                    ← Design tokens globais
│   │   └── api/
│   │       ├── auth/teacher/[action]/     ← register, login
│   │       ├── auth/student/[action]/     ← login, set-password, reset-password
│   │       ├── students/                  ← GET, POST (lista + cria)
│   │       ├── students/[id]/             ← GET, PATCH, DELETE
│   │       ├── quiz/                      ← GET (categorias), POST (session/answer/finish)
│   │       └── reports/                   ← GET dashboard + extensão
│   ├── components/
│   │   ├── teacher/
│   │   │   ├── TeacherLogin.tsx           ← Login/registro do professor
│   │   │   ├── TeacherDashboard.tsx       ← Layout com abas
│   │   │   ├── StudentsList.tsx           ← Cadastro, listagem, reset, exclusão
│   │   │   └── StudentsReport.tsx         ← Gráficos e ranking
│   │   └── student/
│   │       ├── StudentLogin.tsx           ← Login do aluno
│   │       ├── StudentSetPassword.tsx     ← Criar senha no 1º acesso
│   │       └── StudentApp.tsx             ← Home + Quiz + Resultado
│   ├── lib/
│   │   ├── prisma.ts                      ← Singleton PrismaClient
│   │   ├── auth.ts                        ← JWT helpers
│   │   └── question-bank.ts              ← Questões estáticas (fallback)
│   └── types/
│       └── index.ts                       ← Tipos, constantes, helpers
├── .env.example
├── next.config.js
├── tsconfig.json
└── vercel.json
```

---

## API Routes

### Auth

| Método | Rota                               | Body                        | Auth             |
| ------ | ---------------------------------- | --------------------------- | ---------------- |
| POST   | `/api/auth/teacher/register`       | `{ name, email, password }` | —                |
| POST   | `/api/auth/teacher/login`          | `{ email, password }`       | —                |
| POST   | `/api/auth/student/login`          | `{ username, password }`    | —                |
| POST   | `/api/auth/student/set-password`   | `{ newPassword }`           | Bearer aluno     |
| POST   | `/api/auth/student/reset-password` | `{ studentId }`             | Bearer professor |

### Alunos

| Método | Rota                | Body                            | Auth             |
| ------ | ------------------- | ------------------------------- | ---------------- |
| GET    | `/api/students`     | —                               | Bearer professor |
| POST   | `/api/students`     | `{ name, grade? }`              | Bearer professor |
| POST   | `/api/students`     | `{ students: [{name,grade?}] }` | Bearer professor |
| GET    | `/api/students/:id` | —                               | Bearer professor |
| PATCH  | `/api/students/:id` | `{ name?, grade? }`             | Bearer professor |
| DELETE | `/api/students/:id` | —                               | Bearer professor |

### Quiz

| Método | Rota                       | Params/Body                                            | Auth         |
| ------ | -------------------------- | ------------------------------------------------------ | ------------ |
| GET    | `/api/quiz`                | —                                                      | Bearer aluno |
| POST   | `/api/quiz?action=session` | `{ category, difficulty? }`                            | Bearer aluno |
| POST   | `/api/quiz?action=answer`  | `{ questionId, selectedIdx, timeSpentMs }`             | Bearer aluno |
| POST   | `/api/quiz?action=finish`  | `{ sessionId, correctCount, totalCount, timeTakenMs }` | Bearer aluno |

### Relatórios

| Método | Rota           | Params            | Auth             |
| ------ | -------------- | ----------------- | ---------------- |
| GET    | `/api/reports` | `?type=dashboard` | Bearer professor |
| GET    | `/api/reports` | `?type=extension` | Bearer professor |

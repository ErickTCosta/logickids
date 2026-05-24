import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getPayloadFromRequest,
  apiError,
  apiForbidden,
  apiUnauthorized,
} from "@/lib/auth";
import {
  CATEGORY_META,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  QuestionCategory,
  DifficultyLevel,
  XP_PER_CORRECT,
  XP_BONUS_FAST,
  XP_BONUS_PERFECT,
  XP_THRESHOLDS,
  calcLevel,
} from "@/types";
import { QUESTION_BANK } from "@/lib/question-bank";

function requireStudent(req: NextRequest) {
  const p = getPayloadFromRequest(req);
  if (!p || p.role !== "student") return null;
  if (p.mustChangePass) return null;
  return p;
}

// POST /api/quiz/session   → inicia sessão
// POST /api/quiz/answer    → submete resposta
// POST /api/quiz/finish    → finaliza sessão
// GET  /api/quiz/categories→ categorias com progresso
export async function GET(req: NextRequest) {
  const p = requireStudent(req);
  if (!p) return apiUnauthorized();
  const cats: QuestionCategory[] = [
    "matematica",
    "sequencia",
    "padroes",
    "logica",
    "robo",
    "espacial",
  ];
  const attempts = await prisma.attempt.findMany({
    where: { studentId: p.sub },
    include: { question: { select: { category: true } } },
  });
  return Response.json(
    cats.map((cat) => {
      const ca = attempts.filter((a) => a.question.category === cat);
      const correct = ca.filter((a) => a.isCorrect).length;
      const total = ca.length;
      return {
        id: cat,
        ...CATEGORY_META[cat],
        totalAnswered: total,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        progressPct: Math.min(100, Math.round((total / 20) * 100)),
      };
    }),
  );
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  const p = getPayloadFromRequest(req);
  if (!p || p.role !== "student") return apiUnauthorized();

  // ── Iniciar sessão ────────────────────────────────────────────────────
  if (action === "session") {
    if (p.mustChangePass) return apiForbidden("Crie sua senha antes de jogar.");
    const { category, difficulty } = (await req.json()) as {
      category: QuestionCategory;
      difficulty?: DifficultyLevel;
    };
    const student = await prisma.student.findUnique({ where: { id: p.sub } });
    if (!student) return apiUnauthorized();
    const diff: DifficultyLevel =
      difficulty ??
      (student.level <= 3 ? "facil" : student.level <= 7 ? "medio" : "dificil");

    let questions = await getSessionQuestions(category, diff, 5);

    const session = await prisma.session.create({
      data: { studentId: p.sub, questionIds: questions.map((q) => q.id) },
    });

    return Response.json({
      sessionId: session.id,
      difficulty: diff,
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text,
        emoji: q.emoji,
        options: q.options,
        category: q.category,
        difficulty: q.difficulty,
      })),
    });
  }

  // ── Submeter resposta ─────────────────────────────────────────────────
  if (action === "answer") {
    const { questionId, selectedIdx, timeSpentMs } = await req.json();
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) return apiError("Questão não encontrada.", 404);
    const isCorrect = question.correctIdx === selectedIdx;
    await prisma.attempt.create({
      data: {
        studentId: p.sub,
        questionId,
        selectedIdx,
        isCorrect,
        timeSpentMs: timeSpentMs ?? 0,
      },
    });
    await prisma.question.update({
      where: { id: questionId },
      data: { timesUsed: { increment: 1 } },
    });

    let explanation = question.explanation;
    if (!isCorrect) {
      // Tenta Gemini para explicação personalizada
      try {
        explanation = await explainWithGemini(
          question.text,
          question.options[selectedIdx],
          question.options[question.correctIdx],
        );
      } catch {
        /* usa explicação estática */
      }
    }
    return Response.json({
      isCorrect,
      correctIdx: question.correctIdx,
      explanation,
      xpGained: isCorrect
        ? XP_PER_CORRECT + (timeSpentMs < 5000 ? XP_BONUS_FAST : 0)
        : 0,
    });
  }

  // ── Finalizar sessão ──────────────────────────────────────────────────
  if (action === "finish") {
    const { sessionId, correctCount, totalCount, timeTakenMs } =
      await req.json();
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });
    if (!session) return apiError("Sessão não encontrada.", 404);
    const student = await prisma.student.findUniqueOrThrow({
      where: { id: p.sub },
    });
    const isPerfect = correctCount === totalCount;
    const xpGained =
      correctCount * XP_PER_CORRECT + (isPerfect ? XP_BONUS_PERFECT : 0);
    const newXp = student.xp + xpGained;
    const newLevel = calcLevel(newXp);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let newStreak = student.streak;
    if (student.lastPlayed) {
      const last = new Date(student.lastPlayed);
      last.setHours(0, 0, 0, 0);
      const diff = Math.floor((today.getTime() - last.getTime()) / 86400000);
      if (diff === 1) newStreak++;
      else if (diff > 1) newStreak = 1;
    } else {
      newStreak = 1;
    }
    await prisma.student.update({
      where: { id: p.sub },
      data: {
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastPlayed: new Date(),
      },
    });
    await prisma.session.delete({ where: { id: sessionId } });
    const achievements: string[] = [];
    if (isPerfect) achievements.push("🏆 Perfeito! Acertou tudo!");
    if (timeTakenMs < 30000 && correctCount >= 4)
      achievements.push("⚡ Relâmpago! Super rápido!");
    if (newLevel > student.level)
      achievements.push(`🚀 Subiu para o Nível ${newLevel}!`);
    if (newStreak >= 3) achievements.push(`🔥 ${newStreak} dias seguidos!`);
    return Response.json({
      correct: correctCount,
      totalQuestions: totalCount,
      accuracy: Math.round((correctCount / totalCount) * 100),
      xpGained,
      oldLevel: student.level,
      newLevel,
      leveledUp: newLevel > student.level,
      currentXp: newXp,
      xpForNextLevel: XP_THRESHOLDS[newLevel] ?? null,
      achievements,
    });
  }

  return apiError("action inválido. Use: session, answer ou finish");
}

async function getSessionQuestions(
  category: QuestionCategory,
  difficulty: DifficultyLevel,
  limit: number,
) {
  console.log(`[QUIZ] 🎯 Buscando ${limit} questões: ${category}/${difficulty}`);

  // 1. Buscar questões do BD (banco de dados ou geradas)
  console.log(`[QUIZ] 🔍 Procurando em cache...`);
  let questions = await prisma.question.findMany({
    where: { category, difficulty },
    orderBy: { timesUsed: "asc" },
    take: limit * 3,
  });
  console.log(`[QUIZ] ✅ Encontradas ${questions.length} questões em cache`);

  // 2. Se insuficientes, tentar gerar com Gemini
  if (questions.length < limit) {
    const needed = limit - questions.length;
    console.log(`[QUIZ] ⚠️  Insuficientes! Faltam ${needed} questões`);
    const generated = await generateQuestionsWithGemini(
      category,
      difficulty,
      needed,
    );
    console.log(`[QUIZ] 📌 Gemini gerou ${generated.length} questões`);
    questions = [...questions, ...generated];
  }

  // 3. Se ainda insuficientes, usar fallback estático
  if (questions.length < limit) {
    const remaining = limit - questions.length;
    console.log(`[QUIZ] 🔄 Ativando fallback estático (${remaining} questões)`);
    const fallback = QUESTION_BANK.filter(
      (q) => q.category === category && q.difficulty === difficulty,
    )
      .sort(() => Math.random() - 0.5)
      .slice(0, remaining)
      .map((q) => ({
        id: `fallback-${q.text.substring(0, 10)}-${Math.random()}`,
        text: q.text,
        emoji: q.emoji,
        options: q.options,
        correctIdx: q.correctIdx,
        explanation: q.explanation,
        category: q.category,
        difficulty: q.difficulty,
        aiGenerated: false,
        timesUsed: 0,
      }));
    console.log(`[QUIZ] ✅ Fallback adicionou ${fallback.length} questões`);
    questions = [...questions, ...fallback];
  }

  // 4. Embaralhar e retornar limite
  console.log(
    `[QUIZ] 🎲 Embaralhando ${questions.length} questões e selecionando ${limit}...`,
  );
  const result = questions.sort(() => Math.random() - 0.5).slice(0, limit);
  console.log(
    `[QUIZ] ✨ Sessão pronta: ${result.length} questões (${result.filter((q) => q.aiGenerated).length} IA, ${result.filter((q) => !q.aiGenerated).length} estáticas)`,
  );
  return result;
}

async function generateQuestionsWithGemini(
  category: QuestionCategory,
  difficulty: DifficultyLevel,
  count: number,
): Promise<any[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.log("[GEMINI] ⚠️  GEMINI_API_KEY não definida - usando fallback");
    return [];
  }

  console.log(`[GEMINI] 🚀 Iniciando geração de ${count} questões (${category}/${difficulty})`);

  try {
    const categoryDesc = CATEGORY_LABELS[category];
    const difficultyDesc = DIFFICULTY_LABELS[difficulty];
    const prompt = `Gere ${count} questões em JSON puro para crianças em português. 
    
Categoria: ${category} - ${categoryDesc}
Dificuldade: ${difficultyDesc}

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

Requisitos:
- Sem emojis nas opções, apenas no campo emoji
- Números pequenos para ${difficulty === "facil" ? "fácil" : difficulty === "medio" ? "médio" : "difícil"}
- Contexto divertido e infantil
- correctIdx entre 0-3 (índice da resposta correta)`;

    console.log("[GEMINI] 📤 Enviando requisição para API...");
    const startTime = Date.now();

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 },
        }),
      },
    );

    const elapsed = Date.now() - startTime;
    console.log(`[GEMINI] ✅ Resposta recebida em ${elapsed}ms (status: ${res.status})`);

    if (!res.ok) {
      console.error(`[GEMINI] ❌ Erro HTTP ${res.status}: ${res.statusText}`);
      const errorBody = await res.text();
      console.error(`[GEMINI] Detalhes do erro: ${errorBody.substring(0, 200)}`);
      return [];
    }

    const data = await res.json();
    console.log("[GEMINI] 📖 JSON parseado com sucesso");

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      console.error("[GEMINI] ❌ Resposta vazia ou sem text");
      return [];
    }

    console.log(`[GEMINI] 🔍 Procurando JSON na resposta (${text.length} caracteres)...`);
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("[GEMINI] ❌ Regex não encontrou array JSON");
      console.error(`[GEMINI] Primeiros 300 caracteres: ${text.substring(0, 300)}`);
      return [];
    }

    console.log("[GEMINI] 📋 Array JSON encontrado, parseando...");
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) {
      console.error("[GEMINI] ❌ JSON parseado não é um array");
      return [];
    }

    console.log(`[GEMINI] ✨ Sucesso! ${parsed.length} questões extraídas`);

    // Salvar no BD com flag aiGenerated
    console.log("[GEMINI] 💾 Salvando questões no banco de dados...");
    const saved = await Promise.all(
      parsed.map((q, idx) => {
        console.log(`[GEMINI]   → Questão ${idx + 1}: "${q.text.substring(0, 50)}..."`);
        return prisma.question.create({
          data: {
            text: q.text,
            emoji: q.emoji || "",
            options: q.options,
            correctIdx: q.correctIdx,
            explanation: q.explanation,
            category,
            difficulty,
            aiGenerated: true,
          },
        });
      }),
    );

    console.log(`[GEMINI] ✅ ${saved.length} questões salvas no BD com aiGenerated=true`);
    return saved;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[GEMINI] ❌ Erro ao gerar questões: ${errorMsg}`);
    if (err instanceof Error) {
      console.error(`[GEMINI] Stack: ${err.stack?.substring(0, 500)}`);
    }
    return [];
  }
}

async function explainWithGemini(
  question: string,
  userAnswer: string,
  correct: string,
): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return `A resposta certa era "${correct}". Continue tentando!`;
  const prompt = `Explique para uma criança por que errou esta questão em no máximo 2 frases amigáveis. Comece com "Vamos pensar juntos!"\nQuestão: ${question}\nResposta da criança: ${userAnswer}\nResposta correta: ${correct}`;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 150 },
      }),
    },
  );
  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    `A resposta certa era "${correct}".`
  );
}

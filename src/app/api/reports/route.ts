import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayloadFromRequest, apiUnauthorized } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const p = getPayloadFromRequest(req)
  if (!p || p.role !== 'teacher') return apiUnauthorized()
  const url = new URL(req.url)
  const type = url.searchParams.get('type') ?? 'dashboard'

  const students = await prisma.student.findMany({
    where: { teacherId: p.sub },
    include: {
      attempts: { include: { question: { select: { category: true } } } },
      _count: { select: { attempts: true } },
    },
    orderBy: { xp: 'desc' },
  })

  if (type === 'extension') {
    const all = students.flatMap((s) => s.attempts)
    const totalMs = all.reduce((a, x) => a + (x.timeSpentMs ?? 30000), 0)
    const correct = all.filter((a) => a.isCorrect).length
    return Response.json({
      generatedAt: new Date().toISOString(),
      participants: students.length,
      totalHoursApplied: +(totalMs / 3600000).toFixed(1),
      totalQuestionsAnswered: all.length,
      averageAccuracy: all.length > 0 ? Math.round(correct / all.length * 100) : 0,
      baselineAccuracy: 45,
      summary: 'Relatório gerado automaticamente pelo sistema LogicKids.',
    })
  }

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const all = await prisma.attempt.findMany({
    where: { student: { teacherId: p.sub } },
    include: { question: { select: { category: true } } },
  })

  const catMap = new Map<string, { t: number; c: number }>()
  all.forEach((a) => {
    const e = catMap.get(a.question.category) ?? { t: 0, c: 0 }
    e.t++; if (a.isCorrect) e.c++; catMap.set(a.question.category, e)
  })

  const studentStats = students.map((s) => {
    const total = s._count.attempts
    const correct = s.attempts.filter((a) => a.isCorrect).length
    const accuracy = total > 0 ? Math.round(correct / total * 100) : 0
    const cm = new Map<string, { t: number; c: number }>()
    s.attempts.forEach((a) => {
      const e = cm.get(a.question.category) ?? { t: 0, c: 0 }
      e.t++; if (a.isCorrect) e.c++; cm.set(a.question.category, e)
    })
    const weakCategories = [...cm.entries()].filter(([, v]) => v.t >= 3 && v.c / v.t < 0.5).map(([c]) => c)
    return {
      id: s.id, name: s.name, username: s.username, grade: s.grade,
      mustChangePass: s.mustChangePass, level: s.level, xp: s.xp, streak: s.streak,
      accuracy, totalAnswered: total, weakCategories,
      activeToday: s.lastPlayed !== null && new Date(s.lastPlayed) >= today,
      status: accuracy >= 70 ? 'otimo' : accuracy >= 50 ? 'regular' : 'atencao',
    }
  })

  return Response.json({
    summary: {
      totalStudents: students.length,
      activeToday: studentStats.filter((s) => s.activeToday).length,
      avgAccuracy: Math.round(studentStats.reduce((a, s) => a + s.accuracy, 0) / (students.length || 1)),
      questionsAnsweredToday: all.filter((a) => new Date(a.createdAt) >= today).length,
      studentsNeedingAttention: studentStats.filter((s) => s.status === 'atencao').length,
      studentsWithDefaultPassword: studentStats.filter((s) => s.mustChangePass).length,
    },
    students: studentStats,
    categoryStats: [...catMap.entries()].map(([category, v]) => ({
      category, total: v.t, correct: v.c, accuracy: Math.round(v.c / (v.t || 1) * 100),
    })),
  })
}

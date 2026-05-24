import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPayloadFromRequest, apiError, apiForbidden, apiUnauthorized } from '@/lib/auth'
import { XP_THRESHOLDS } from '@/types'

function requireTeacher(req: NextRequest) {
  const p = getPayloadFromRequest(req)
  if (!p || p.role !== 'teacher') return null
  return p
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireTeacher(req)
  if (!p) return apiUnauthorized()
  const student = await prisma.student.findFirst({
    where: { id: params.id, teacherId: p.sub },
    include: {
      attempts: { include: { question: true }, orderBy: { createdAt: 'desc' }, take: 30 },
      _count: { select: { attempts: true } },
    },
  })
  if (!student) return apiError('Aluno não encontrado.', 404)
  const total = student._count.attempts
  const correct = student.attempts.filter((a) => a.isCorrect).length
  const catMap = new Map<string, { total: number; correct: number }>()
  student.attempts.forEach((a) => {
    const e = catMap.get(a.question.category) ?? { total: 0, correct: 0 }
    e.total++; if (a.isCorrect) e.correct++
    catMap.set(a.question.category, e)
  })
  return Response.json({
    id: student.id, name: student.name, username: student.username,
    grade: student.grade, mustChangePass: student.mustChangePass,
    level: student.level, xp: student.xp, streak: student.streak,
    lastPlayedAt: student.lastPlayed,
    xpForNextLevel: XP_THRESHOLDS[student.level] ?? null,
    stats: { totalAttempts: total, correctAttempts: correct, accuracy: total > 0 ? Math.round(correct / total * 100) : 0 },
    categoryStats: Array.from(catMap.entries()).map(([category, v]) => ({
      category, total: v.total, correct: v.correct, accuracy: Math.round(v.correct / v.total * 100),
    })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireTeacher(req)
  if (!p) return apiUnauthorized()
  const student = await prisma.student.findFirst({ where: { id: params.id, teacherId: p.sub } })
  if (!student) return apiForbidden('Aluno não encontrado ou não pertence a você.')
  const { name, grade } = await req.json()
  const updated = await prisma.student.update({
    where: { id: params.id },
    data: { ...(name ? { name } : {}), ...(grade !== undefined ? { grade } : {}) },
    select: { id: true, name: true, username: true, grade: true, level: true, xp: true },
  })
  return Response.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const p = requireTeacher(req)
  if (!p) return apiUnauthorized()
  const student = await prisma.student.findFirst({ where: { id: params.id, teacherId: p.sub } })
  if (!student) return apiForbidden('Aluno não encontrado ou não pertence a você.')
  await prisma.student.delete({ where: { id: params.id } })
  return Response.json({ message: `Aluno "${student.name}" removido com sucesso.` })
}

import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { getPayloadFromRequest, apiError, apiForbidden, apiUnauthorized } from '@/lib/auth'
import { DEFAULT_PASSWORD, generateUsername, calcLevel, XP_THRESHOLDS } from '@/types'

function requireTeacher(req: NextRequest) {
  const p = getPayloadFromRequest(req)
  if (!p || p.role !== 'teacher') return null
  return p
}

// GET /api/students  → lista alunos do professor
// POST /api/students → cria aluno
export async function GET(req: NextRequest) {
  const p = requireTeacher(req)
  if (!p) return apiUnauthorized()
  const students = await prisma.student.findMany({
    where: { teacherId: p.sub },
    include: { _count: { select: { attempts: true } } },
    orderBy: { name: 'asc' },
  })
  return Response.json(students.map((s) => ({
    id: s.id, name: s.name, username: s.username, grade: s.grade,
    level: s.level, xp: s.xp, streak: s.streak,
    mustChangePass: s.mustChangePass, lastPlayedAt: s.lastPlayed,
    totalAttempts: s._count.attempts,
  })))
}

export async function POST(req: NextRequest) {
  const p = requireTeacher(req)
  if (!p) return apiUnauthorized()
  const body = await req.json()

  // Lote: { students: [{name, grade?}] }
  if (Array.isArray(body.students)) {
    const results = await Promise.all(body.students.map((s: any) => createOne(p.sub, s.name, s.grade)))
    return Response.json({ created: results.length, students: results }, { status: 201 })
  }

  // Único: { name, grade? }
  const { name, grade } = body
  if (!name) return apiError('Nome obrigatório.')
  const student = await createOne(p.sub, name, grade)
  return Response.json(student, { status: 201 })
}

async function createOne(teacherId: string, name: string, grade?: string) {
  const base = generateUsername(name)
  let username = base, i = 2
  while (await prisma.student.findUnique({ where: { username } })) username = base + i++
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  const s = await prisma.student.create({
    data: { name, username, passwordHash, mustChangePass: true, grade: grade ?? null, teacherId },
    select: { id: true, name: true, username: true, grade: true, mustChangePass: true, level: true, xp: true },
  })
  return { ...s, defaultPassword: DEFAULT_PASSWORD }
}

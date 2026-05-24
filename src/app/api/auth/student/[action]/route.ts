import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { signToken, getPayloadFromRequest, apiError, apiUnauthorized, apiForbidden } from '@/lib/auth'
import { DEFAULT_PASSWORD } from '@/types'

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const { action } = params
  const body = await req.json()

  // ── Login do aluno ──────────────────────────────────────────────────────
  if (action === 'login') {
    const { username, password } = body
    if (!username || !password) return apiError('Preencha usuário e senha.')
    const student = await prisma.student.findUnique({ where: { username } })
    if (!student) return apiError('Usuário ou senha inválidos.', 401)
    const valid = await bcrypt.compare(password, student.passwordHash)
    if (!valid) return apiError('Usuário ou senha inválidos.', 401)
    const token = signToken(
      { sub: student.id, role: 'student', mustChangePass: student.mustChangePass },
      '1d',
    )
    return Response.json({
      token,
      role: 'student',
      mustChangePass: student.mustChangePass,
      student: { id: student.id, name: student.name, username: student.username, level: student.level, xp: student.xp, streak: student.streak, grade: student.grade },
    })
  }

  // ── Aluno define nova senha (1º acesso) ─────────────────────────────────
  if (action === 'set-password') {
    const payload = getPayloadFromRequest(req)
    if (!payload || payload.role !== 'student') return apiUnauthorized()
    const { newPassword } = body
    if (!newPassword || newPassword.length < 6) return apiError('A senha deve ter pelo menos 6 caracteres.')
    if (newPassword === DEFAULT_PASSWORD) return apiError('Escolha uma senha diferente da senha padrão.')
    const student = await prisma.student.findUnique({ where: { id: payload.sub } })
    if (!student) return apiUnauthorized()
    if (!student.mustChangePass) return apiError('Senha já configurada.')
    const passwordHash = await bcrypt.hash(newPassword, 12)
    const updated = await prisma.student.update({
      where: { id: payload.sub },
      data: { passwordHash, mustChangePass: false },
      select: { id: true, name: true, username: true, level: true, xp: true, streak: true, grade: true },
    })
    const token = signToken({ sub: updated.id, role: 'student', mustChangePass: false })
    return Response.json({ token, role: 'student', mustChangePass: false, student: updated, message: 'Senha criada com sucesso! Bem-vindo ao LogicKids!' })
  }

  // ── Professor reseta senha do aluno ─────────────────────────────────────
  if (action === 'reset-password') {
    const payload = getPayloadFromRequest(req)
    if (!payload || payload.role !== 'teacher') return apiForbidden('Acesso restrito a professores.')
    const { studentId } = body
    if (!studentId) return apiError('studentId obrigatório.')
    const student = await prisma.student.findFirst({ where: { id: studentId, teacherId: payload.sub } })
    if (!student) return apiForbidden('Aluno não encontrado ou não pertence a você.')
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
    await prisma.student.update({ where: { id: studentId }, data: { passwordHash, mustChangePass: true } })
    return Response.json({ message: `Senha de "${student.name}" redefinida. No próximo login ele criará uma nova senha.`, username: student.username })
  }

  return apiError('Rota não encontrada.', 404)
}

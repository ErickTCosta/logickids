import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/lib/prisma'
import { signToken, apiError } from '@/lib/auth'

// POST /api/auth/teacher/register
export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const { action } = params
  const body = await req.json()

  if (action === 'register') {
    const { name, email, password } = body
    if (!name || !email || !password) return apiError('Preencha todos os campos.')
    const exists = await prisma.teacher.findUnique({ where: { email } })
    if (exists) return apiError('E-mail já cadastrado.', 409)
    const passwordHash = await bcrypt.hash(password, 12)
    const teacher = await prisma.teacher.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    })
    const token = signToken({ sub: teacher.id, role: 'teacher' })
    return Response.json({ token, role: 'teacher', teacher }, { status: 201 })
  }

  if (action === 'login') {
    const { email, password } = body
    if (!email || !password) return apiError('Preencha todos os campos.')
    const teacher = await prisma.teacher.findUnique({ where: { email } })
    if (!teacher) return apiError('E-mail ou senha inválidos.', 401)
    const valid = await bcrypt.compare(password, teacher.passwordHash)
    if (!valid) return apiError('E-mail ou senha inválidos.', 401)
    const token = signToken({ sub: teacher.id, role: 'teacher' })
    const res = Response.json({
      token,
      role: 'teacher',
      teacher: { id: teacher.id, name: teacher.name, email: teacher.email },
    })
    return res
  }

  return apiError('Rota não encontrada.', 404)
}

import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { JwtPayload } from '@/types'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, SECRET, { expiresIn })
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload
  } catch {
    return null
  }
}

// Lê token do header Authorization: Bearer <token>
export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? ''
  if (auth.startsWith('Bearer ')) return auth.slice(7)
  return null
}

// Lê payload do token da request (header ou cookie)
export function getPayloadFromRequest(req: NextRequest): JwtPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) return null
  return verifyToken(token)
}

// Para Server Components: lê do cookie httpOnly
export function getPayloadFromCookie(): JwtPayload | null {
  try {
    const token = cookies().get('lk_token')?.value
    if (!token) return null
    return verifyToken(token)
  } catch {
    return null
  }
}

export function apiUnauthorized(msg = 'Não autorizado') {
  return Response.json({ error: msg }, { status: 401 })
}

export function apiForbidden(msg = 'Acesso negado') {
  return Response.json({ error: msg }, { status: 403 })
}

export function apiError(msg: string, status = 400) {
  return Response.json({ error: msg }, { status })
}

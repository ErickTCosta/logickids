export type QuestionCategory = 'matematica' | 'sequencia' | 'padroes' | 'logica' | 'robo' | 'espacial'
export type DifficultyLevel  = 'facil' | 'medio' | 'dificil'
export type UserRole         = 'teacher' | 'student'

export interface JwtPayload {
  sub: string
  role: UserRole
  mustChangePass?: boolean
}

export const DEFAULT_PASSWORD = '123@aluno'

export const CATEGORY_META: Record<QuestionCategory, { name: string; icon: string; color: string }> = {
  matematica: { name: 'Matemática',       icon: '🔢', color: '#7F77DD' },
  sequencia:  { name: 'Sequências',        icon: '🔗', color: '#1D9E75' },
  padroes:    { name: 'Padrões',           icon: '🎨', color: '#EF9F27' },
  logica:     { name: 'Lógica',            icon: '🧩', color: '#D85A30' },
  robo:       { name: 'Algoritmo do Robô', icon: '🤖', color: '#378ADD' },
  espacial:   { name: 'Espacial',          icon: '📐', color: '#639922' },
}

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  matematica: 'Matemática básica (soma, subtração, multiplicação, divisão)',
  sequencia:  'Sequências numéricas (descobrir o próximo número)',
  padroes:    'Reconhecimento de padrões visuais com emojis e figuras',
  logica:     'Raciocínio lógico e problemas de decisão',
  robo:       'Algoritmo infantil / pensamento computacional sem código',
  espacial:   'Raciocínio espacial com formas geométricas',
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facil:   'fácil (linguagem simples, números pequenos, contexto familiar)',
  medio:   'médio (2 etapas de raciocínio)',
  dificil: 'difícil (múltiplas etapas, abstração maior)',
}

export const XP_PER_CORRECT   = 10
export const XP_BONUS_FAST    = 5
export const XP_BONUS_PERFECT = 20
export const XP_THRESHOLDS    = [0, 50, 120, 220, 350, 510, 700, 920, 1180, 1480, 1820]

export const GRADES = ['1º ano EF','2º ano EF','3º ano EF','4º ano EF','5º ano EF','6º ano EF','7º ano EF','8º ano EF','9º ano EF']

export function calcLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function generateUsername(fullName: string): string {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const ignored = new Set(['da','de','do','das','dos','e'])
  const parts = norm(fullName).split(/\s+/).filter((p) => p && !ignored.has(p))
  if (!parts.length) return norm(fullName).replace(/\s/g, '.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[parts.length - 1]
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { QUESTION_BANK } from '../src/lib/question-bank'

function generateUsername(fullName: string): string {
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const ignored = new Set(['da','de','do','das','dos','e'])
  const parts = norm(fullName).split(/\s+/).filter(p => p && !ignored.has(p))
  if (!parts.length) return norm(fullName).replace(/\s/g, '.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[parts.length - 1]
}

const prisma = new PrismaClient()
const DEFAULT_PASSWORD = '123@aluno'

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base, i = 2
  while (await prisma.student.findUnique({ where: { username: candidate } })) {
    candidate = base + i++
  }
  return candidate
}

async function main() {
  console.log('🌱 Iniciando seed...\n')

  // Questões fixas
  await prisma.question.deleteMany({ where: { aiGenerated: false } })
  const q = await prisma.question.createMany({ data: QUESTION_BANK.map(q => ({ ...q, aiGenerated: false })), skipDuplicates: true })
  console.log(`✅ ${q.count} questões inseridas.\n`)

  // Professor demo
  const email = 'professor@logickids.com'
  let teacher = await prisma.teacher.findUnique({ where: { email } })
  if (!teacher) {
    teacher = await prisma.teacher.create({
      data: { name: 'Professor Demo', email, passwordHash: await bcrypt.hash('prof@123', 12) },
    })
    console.log('✅ Professor criado:')
    console.log(`   E-mail: ${email}`)
    console.log(`   Senha:  prof@123\n`)
  } else {
    console.log(`ℹ️  Professor já existe: ${email}\n`)
  }

  // Alunos demo
  const demos = [
    { name: 'Ana Lima',      grade: '3º ano EF' },
    { name: 'Carlos Melo',   grade: '4º ano EF' },
    { name: 'Beatriz Nunes', grade: '3º ano EF' },
    { name: 'Rafael Santos', grade: '2º ano EF' },
    { name: 'Júlia Pires',   grade: '5º ano EF' },
  ]
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12)
  let criados = 0
  console.log('👤 Alunos criados:')
  for (const s of demos) {
    const base = generateUsername(s.name)
    const username = await uniqueUsername(base)
    if (!await prisma.student.findUnique({ where: { username } })) {
      await prisma.student.create({
        data: { name: s.name, username, passwordHash: hash, mustChangePass: true, grade: s.grade, teacherId: teacher.id },
      })
      console.log(`   ${s.name.padEnd(16)} → usuário: ${username.padEnd(16)} | série: ${s.grade}`)
      criados++
    }
  }

  console.log(`\n✅ ${criados} alunos criados (senha padrão: ${DEFAULT_PASSWORD})`)
  console.log('\n🎉 Seed concluído!')
  console.log('─────────────────────────────────────────────────────')
  console.log('  Professor → professor@logickids.com / prof@123')
  console.log(`  Alunos    → ana.lima, carlos.melo… / ${DEFAULT_PASSWORD}`)
  console.log('  ⚠️  No 1º login o aluno cria a própria senha.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())

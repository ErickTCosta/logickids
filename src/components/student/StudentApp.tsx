'use client'
import { useState, useEffect } from 'react'
import { CATEGORY_META, QuestionCategory } from '@/types'

type Screen = 'home' | 'quiz' | 'result'

interface Question { id: string; text: string; emoji: string; options: string[]; category: string; difficulty: string }
interface SessionResult { correct: number; totalQuestions: number; accuracy: number; xpGained: number; oldLevel: number; newLevel: number; leveledUp: boolean; currentXp: number; xpForNextLevel: number | null; achievements: string[] }

export default function StudentApp({ token, student: initialStudent, onLogout }: { token: string; student: any; onLogout: () => void }) {
  const [student, setStudent] = useState(initialStudent)
  const [screen, setScreen] = useState<Screen>('home')
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCat, setSelectedCat] = useState<QuestionCategory | null>(null)
  const [sessionId, setSessionId] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, { selected: number; correct: boolean; explanation: string; correctIdx: number }>>({})
  const [sessionLoading, setSessionLoading] = useState(false)
  const [answerLoading, setAnswerLoading] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<SessionResult | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [questionStart, setQuestionStart] = useState(0)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch('/api/quiz', { headers }).then(r => r.json()).then(setCategories)
  }, [student])

  async function startSession(cat: QuestionCategory) {
    setSelectedCat(cat)
    setSessionLoading(true)
    setScreen('quiz')
    setCurrentIdx(0)
    setAnswers({})
    setAnswered(false)
    const res = await fetch('/api/quiz?action=session', { method: 'POST', headers, body: JSON.stringify({ category: cat }) })
    const data = await res.json()
    setQuestions(data.questions ?? [])
    setSessionId(data.sessionId)
    setStartTime(Date.now())
    setQuestionStart(Date.now())
    setSessionLoading(false)
  }

  async function submitAnswer(selectedIdx: number) {
    if (answered || answerLoading) return
    setAnswerLoading(true)
    const q = questions[currentIdx]
    const timeSpentMs = Date.now() - questionStart
    const res = await fetch('/api/quiz?action=answer', {
      method: 'POST', headers,
      body: JSON.stringify({ questionId: q.id, selectedIdx, timeSpentMs }),
    })
    const data = await res.json()
    setAnswers(prev => ({ ...prev, [q.id]: { selected: selectedIdx, correct: data.isCorrect, explanation: data.explanation, correctIdx: data.correctIdx } }))
    setAnswered(true)
    setAnswerLoading(false)
  }

  async function nextQuestion() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1)
      setAnswered(false)
      setQuestionStart(Date.now())
    } else {
      // Finalizar sessão
      const correctCount = Object.values(answers).filter(a => a.correct).length + (answers[questions[currentIdx]?.id]?.correct ? 0 : 0)
      const finalCorrect = Object.values({ ...answers }).filter(a => a.correct).length
      const timeTakenMs = Date.now() - startTime
      const res = await fetch('/api/quiz?action=finish', {
        method: 'POST', headers,
        body: JSON.stringify({ sessionId, correctCount: finalCorrect, totalCount: questions.length, timeTakenMs }),
      })
      const data = await res.json()
      setResult(data)
      setStudent((s: any) => ({ ...s, xp: data.currentXp, level: data.newLevel }))
      setScreen('result')
    }
  }

  const q = questions[currentIdx]
  const ans = q ? answers[q.id] : null

  // ── HOME ─────────────────────────────────────────────────────────────────
  if (screen === 'home') return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">L</div>
          <div className="topbar-logo-text">Logic<span>Kids</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'var(--amber-50)', color: 'var(--amber-800)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            ⭐ {student.xp} XP
          </div>
          <div style={{ background: 'var(--purple-50)', color: 'var(--purple-800)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
            Nível {student.level}
          </div>
          <span style={{ fontSize: 13, color: 'var(--gray-600)', fontWeight: 500 }}>Olá, {student.name.split(' ')[0]}!</span>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>Sair</button>
        </div>
      </header>

      <div className="page-content" style={{ maxWidth: 900 }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, var(--purple-50) 0%, var(--teal-50) 100%)', borderRadius: 'var(--radius)', padding: '24px 28px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--purple-800)', marginBottom: 6 }}>
              Pronto para pensar, {student.name.split(' ')[0]}? 🧠
            </h2>
            <p style={{ fontSize: 14, color: 'var(--purple)', maxWidth: 380 }}>Escolha uma categoria abaixo e resolva desafios de raciocínio lógico!</p>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { n: student.level, l: 'Nível' },
              { n: student.xp,    l: 'XP total' },
              { n: student.streak ?? 0, l: 'Sequência 🔥' },
            ].map(({ n, l }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--purple)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--purple-800)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Categories grid */}
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Categorias</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {(Object.keys(CATEGORY_META) as QuestionCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat]
            const catData = categories.find(c => c.id === cat)
            const acc = catData?.accuracy ?? 0
            const prog = catData?.progressPct ?? 0
            return (
              <button key={cat} onClick={() => startSession(cat)}
                style={{ background: 'var(--white)', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: 18, cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = meta.color; (e.currentTarget as HTMLElement).style.background = '#F9F9FF' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--gray-200)'; (e.currentTarget as HTMLElement).style.background = 'var(--white)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{meta.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{meta.name}</div>
                {catData && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>{catData.totalAnswered} questões · {acc}% acertos</div>}
                <div style={{ height: 4, borderRadius: 2, background: 'var(--gray-100)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: meta.color, width: `${prog}%`, transition: 'width .4s' }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── QUIZ LOADING ──────────────────────────────────────────────────────────
  if (screen === 'quiz' && (sessionLoading || questions.length === 0)) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Preparando seus desafios…</p>
    </div>
  )

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && q) {
    const progress = ((currentIdx + (answered ? 1 : 0)) / questions.length) * 100
    const catMeta = selectedCat ? CATEGORY_META[selectedCat] : null
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)', display: 'flex', flexDirection: 'column' }}>
        {/* Quiz header */}
        <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-200)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setScreen('home')}>← Sair</button>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: catMeta?.color ?? 'var(--purple)', borderRadius: 3, width: `${progress}%`, transition: 'width .4s' }} />
            </div>
          </div>
          <span style={{ fontSize: 13, color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>{currentIdx + 1} / {questions.length}</span>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px', width: '100%' }}>
          {/* Question card */}
          <div className="card card-pad" style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: catMeta?.color ?? 'var(--purple)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>
              {catMeta?.icon} {catMeta?.name}
            </div>
            <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, color: 'var(--gray-900)' }}>{q.text}</p>
            {q.emoji && <div style={{ fontSize: 36, textAlign: 'center', margin: '14px 0 4px' }}>{q.emoji}</div>}
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {q.options.map((opt, i) => {
              let bg = 'var(--white)', border = 'var(--gray-200)', color = 'var(--gray-900)'
              if (ans) {
                if (i === ans.correctIdx) { bg = 'var(--teal-50)'; border = 'var(--teal)'; color = 'var(--teal-800)' }
                else if (i === ans.selected && !ans.correct) { bg = 'var(--coral-50)'; border = 'var(--coral)'; color = 'var(--coral-800)' }
              }
              return (
                <button key={i} disabled={!!ans || answerLoading} onClick={() => submitAnswer(i)}
                  style={{ background: bg, border: `1.5px solid ${border}`, color, borderRadius: 'var(--radius-sm)', padding: '13px 16px', fontSize: 14, fontWeight: 500, cursor: ans ? 'default' : 'pointer', textAlign: 'left', transition: 'all .15s' }}>
                  {opt}
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {ans && (
            <div style={{ background: ans.correct ? 'var(--teal-50)' : 'var(--coral-50)', border: `1px solid ${ans.correct ? 'var(--teal)' : 'var(--coral)'}`, borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: ans.correct ? 'var(--teal-800)' : 'var(--coral-800)' }}>
                {ans.correct ? '✅ Correto!' : '❌ Quase lá!'}
              </div>
              <div style={{ color: ans.correct ? 'var(--teal-800)' : 'var(--coral-800)' }}>{ans.explanation}</div>
            </div>
          )}

          {ans && (
            <button className="btn btn-primary btn-full" onClick={nextQuestion}>
              {currentIdx < questions.length - 1 ? 'Próxima questão →' : 'Ver resultado →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (screen === 'result' && result) {
    const pct = result.accuracy
    const emoji = pct === 100 ? '🏆' : pct >= 60 ? '🎉' : '💪'
    const title = pct === 100 ? 'Perfeito!' : pct >= 60 ? 'Muito bem!' : 'Continue tentando!'
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--purple-50) 0%, var(--teal-50) 100%)', padding: 20 }}>
        <div className="card card-pad" style={{ maxWidth: 440, width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>{emoji}</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{title}</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>Você completou o desafio!</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { n: `${result.correct}/${result.totalQuestions}`, l: 'Acertos', c: 'var(--teal)' },
              { n: `${result.accuracy}%`, l: 'Taxa', c: 'var(--purple)' },
              { n: `+${result.xpGained}`, l: 'XP ganho', c: 'var(--amber-800)' },
            ].map(({ n, l, c }) => (
              <div key={l} style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '14px 8px' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{n}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          {result.leveledUp && (
            <div style={{ background: 'var(--amber-50)', border: '1px solid var(--amber)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16, fontWeight: 600, color: 'var(--amber-800)' }}>
              🚀 Subiu para o Nível {result.newLevel}!
            </div>
          )}

          {result.achievements.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {result.achievements.map((a, i) => (
                <div key={i} style={{ background: 'var(--purple-50)', color: 'var(--purple-800)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{a}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-full" onClick={() => setScreen('home')}>← Início</button>
            {selectedCat && <button className="btn btn-primary btn-full" onClick={() => startSession(selectedCat)}>Jogar de novo</button>}
          </div>
        </div>
      </div>
    )
  }

  return null
}

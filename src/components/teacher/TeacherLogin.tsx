'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function TeacherLogin({ onLogin }: { onLogin: (token: string, teacher: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(`/api/auth/teacher/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mode === 'login' ? { email, password } : { name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro desconhecido'); return }
      onLogin(data.token, data.teacher)
    } catch { setError('Erro de conexão.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #EEEDFE 0%, #E1F5EE 100%)', padding:20 }}>
      <div className="card card-pad" style={{ width:'100%', maxWidth:400 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:24 }}>
          <div style={{ width:38, height:38, background:'var(--purple)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:18 }}>L</div>
          <div>
            <div style={{ fontWeight:700, fontSize:17 }}>Logic<span style={{ color:'var(--purple)' }}>Kids</span></div>
            <div style={{ fontSize:12, color:'var(--gray-500)' }}>Painel do Professor</div>
          </div>
        </div>

        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:4 }}>
          {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta de professor'}
        </h2>
        <p style={{ color:'var(--gray-500)', fontSize:13, marginBottom:20 }}>
          {mode === 'login' ? 'Acesse para gerenciar sua turma' : 'Registre-se para começar'}
        </p>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'register' && (
            <div>
              <label className="input-label">Nome completo</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Prof. Ana Lima" required />
            </div>
          )}
          <div>
            <label className="input-label">E-mail</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="professor@escola.com" required />
          </div>
          <div>
            <label className="input-label">Senha</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
          </div>
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? '→ Entrar' : '→ Criar conta'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--gray-500)' }}>
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            style={{ background:'none', border:'none', color:'var(--purple)', cursor:'pointer', fontWeight:600 }}>
            {mode === 'login' ? 'Cadastrar-se' : 'Entrar'}
          </button>
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:13 }}>
          <Link href="/" style={{ color:'var(--gray-400)' }}>← Voltar ao início</Link>
        </p>
      </div>
    </div>
  )
}

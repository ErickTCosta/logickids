'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function StudentLogin({ onLogin }: { onLogin: (token: string, student: any, mustChangePass: boolean) => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao entrar.'); return }
      onLogin(data.token, data.student, data.mustChangePass)
    } catch { setError('Erro de conexão.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #E1F5EE 0%, #EEEDFE 100%)', padding:20 }}>
      <div className="card card-pad" style={{ width:'100%', maxWidth:380 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:56, height:56, background:'var(--teal)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 12px' }}>🎮</div>
          <h1 style={{ fontSize:20, fontWeight:700 }}>Logic<span style={{ color:'var(--purple)' }}>Kids</span></h1>
          <p style={{ color:'var(--gray-500)', fontSize:13, marginTop:4 }}>Entre para jogar e aprender!</p>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label className="input-label">Nome de usuário</label>
            <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="ex: joao.silva" required autoCapitalize="off" autoCorrect="off" />
          </div>
          <div>
            <label className="input-label">Senha</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-full" style={{ background:'var(--teal)', borderColor:'var(--teal)' }} type="submit" disabled={loading}>
            {loading ? 'Entrando...' : '🎮 Entrar e jogar!'}
          </button>
        </form>

        <p style={{ textAlign:'center', marginTop:16, fontSize:12, color:'var(--gray-400)' }}>
          Seu usuário e senha foram dados pelo professor.
        </p>
        <p style={{ textAlign:'center', marginTop:8, fontSize:13 }}>
          <Link href="/" style={{ color:'var(--gray-400)' }}>← Voltar</Link>
        </p>
      </div>
    </div>
  )
}

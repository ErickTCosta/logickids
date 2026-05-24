'use client'
import { useState } from 'react'

export default function StudentSetPassword({ token, student, onPasswordSet }: { token: string; student: any; onPasswordSet: (token: string, student: any) => void }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    if (newPassword.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    if (newPassword !== confirm) { setError('As senhas não coincidem.'); return }
    if (newPassword === '123@aluno') { setError('Escolha uma senha diferente da padrão.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/student/set-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newPassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Erro ao definir senha.'); return }
      onPasswordSet(data.token, data.student)
    } catch { setError('Erro de conexão.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #FAEEDA 0%, #E1F5EE 100%)', padding:20 }}>
      <div className="card card-pad" style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🔐</div>
          <h2 style={{ fontSize:20, fontWeight:700 }}>Crie sua senha</h2>
          <p style={{ color:'var(--gray-500)', fontSize:14, marginTop:6, lineHeight:1.5 }}>
            Olá, <strong>{student?.name}</strong>! É seu primeiro acesso.<br/>
            Crie uma senha que só você saiba.
          </p>
        </div>

        {error && <div className="alert alert-err">{error}</div>}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label className="input-label">Nova senha</label>
            <input className="input" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} autoFocus />
          </div>
          <div>
            <label className="input-label">Confirmar senha</label>
            <input className="input" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Repita a senha" required />
          </div>

          {newPassword.length >= 6 && (
            <div style={{ display:'flex', gap:6, fontSize:12 }}>
              <span style={{ color: newPassword.length >= 6 ? 'var(--teal)' : 'var(--gray-400)' }}>✓ Mínimo 6 caracteres</span>
              <span style={{ color: newPassword === confirm && confirm ? 'var(--teal)' : 'var(--gray-300)' }}>✓ Senhas iguais</span>
            </div>
          )}

          <button className="btn btn-primary btn-full" style={{ background:'var(--teal)', borderColor:'var(--teal)', marginTop:4 }} type="submit" disabled={loading}>
            {loading ? 'Salvando...' : '✓ Criar minha senha e entrar!'}
          </button>
        </form>
      </div>
    </div>
  )
}

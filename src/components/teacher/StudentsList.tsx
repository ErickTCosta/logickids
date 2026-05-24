'use client'
import { useState, useEffect, useCallback } from 'react'
import { GRADES } from '@/types'

interface Student { id:string; name:string; username:string; grade:string|null; level:number; xp:number; streak:number; mustChangePass:boolean; totalAttempts:number }

function toUsername(name: string) {
  const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s]/g,'').trim()
  const ignored = new Set(['da','de','do','das','dos','e'])
  const parts = norm(name).split(/\s+/).filter(p => p && !ignored.has(p))
  if (!parts.length) return norm(name).replace(/\s/g,'.')
  if (parts.length === 1) return parts[0]
  return parts[0] + '.' + parts[parts.length - 1]
}

export default function StudentsList({ token }: { token: string }) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newGrade, setNewGrade] = useState('')
  const [creating, setCreating] = useState(false)
  const [cred, setCred] = useState<{username:string}|null>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState<{type:'reset'|'delete'; student: Student}|null>(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')

  const headers = { 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` }

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/students', { headers })
    const data = await res.json()
    setStudents(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function createStudent(e: React.FormEvent) {
    e.preventDefault(); if (!newName.trim()) return
    setCreating(true); setError('')
    const res = await fetch('/api/students', {
      method:'POST', headers, body: JSON.stringify({ name: newName.trim(), grade: newGrade || null })
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setCreating(false); return }
    setStudents(prev => [data, ...prev])
    setCred({ username: data.username })
    setNewName(''); setNewGrade(''); setShowForm(false)
    setCreating(false)
    showToast(`Aluno "${data.name}" cadastrado!`)
  }

  async function resetPassword(s: Student) {
    await fetch('/api/auth/student/reset-password', {
      method:'POST', headers, body: JSON.stringify({ studentId: s.id })
    })
    setStudents(prev => prev.map(x => x.id === s.id ? { ...x, mustChangePass: true } : x))
    setModal(null)
    showToast(`Senha de "${s.name}" redefinida para 123@aluno`)
  }

  async function deleteStudent(s: Student) {
    await fetch(`/api/students/${s.id}`, { method:'DELETE', headers })
    setStudents(prev => prev.filter(x => x.id !== s.id))
    setModal(null)
    showToast(`"${s.name}" removido`)
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.username.toLowerCase().includes(search.toLowerCase()) ||
    (s.grade ?? '').toLowerCase().includes(search.toLowerCase())
  )
  const stats = {
    total: students.length,
    active: students.filter(s => s.streak > 0).length,
    avgXp: students.length ? Math.round(students.reduce((a,s) => a+s.xp, 0)/students.length) : 0,
    pending: students.filter(s => s.mustChangePass).length,
  }
  const previewUser = newName ? toUsername(newName) : ''

  return (
    <div>
      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { n: stats.total,  l:'Total de alunos',   c:'var(--purple)' },
          { n: stats.active, l:'Jogaram recentemente', c:'var(--teal)' },
          { n: stats.avgXp,  l:'XP médio',          c:'var(--amber-800)' },
          { n: stats.pending,l:'Aguardando 1º login',c:'var(--red)' },
        ].map(({ n, l, c }) => (
          <div key={l} className="card card-pad">
            <div style={{ fontSize:26, fontWeight:700, color: c }}>{n}</div>
            <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Credential card */}
      {cred && (
        <div className="alert alert-info" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <div>
            <strong>🎉 Aluno cadastrado!</strong> Compartilhe as credenciais:<br/>
            <span style={{ fontFamily:'monospace', fontSize:13 }}>Usuário: <strong>{cred.username}</strong> | Senha: <strong>123@aluno</strong></span>
            <br/><span style={{ fontSize:12, color:'var(--purple-800)' }}>⚠️ O aluno criará a própria senha no 1º login.</span>
          </div>
          <button onClick={() => setCred(null)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'var(--purple-800)' }}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:10 }}>
        <h2 style={{ fontSize:16, fontWeight:600 }}>Minha turma</h2>
        <div style={{ display:'flex', gap:8 }}>
          <input className="input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Buscar aluno..." style={{ width:220 }} />
          <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(!showForm); setError(''); setCred(null) }}>
            {showForm ? '✕ Cancelar' : '+ Adicionar aluno'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card card-pad" style={{ marginBottom:16, background:'var(--gray-50)' }}>
          <h3 style={{ fontSize:14, fontWeight:600, marginBottom:12 }}>Novo aluno</h3>
          {error && <div className="alert alert-err">{error}</div>}
          <form onSubmit={createStudent}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div>
                <label className="input-label">Nome completo *</label>
                <input className="input" value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Ex: João da Silva" required />
                {previewUser && <div style={{ fontSize:12, color:'var(--purple)', marginTop:4 }}>Usuário: <strong>{previewUser}</strong></div>}
              </div>
              <div>
                <label className="input-label">Série / Turma</label>
                <select className="input" value={newGrade} onChange={e=>setNewGrade(e.target.value)}>
                  <option value="">Selecionar</option>
                  {GRADES.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:12 }}>
              <label className="input-label">Senha padrão</label>
              <input className="input" value="123@aluno" disabled />
              <div style={{ fontSize:12, color:'var(--gray-400)', marginTop:4 }}>O aluno definirá a própria senha no primeiro login.</div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={creating}>{creating ? 'Cadastrando...' : '✓ Cadastrar'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="card card-pad" style={{ textAlign:'center', padding:'48px 20px', color:'var(--gray-400)' }}>
          <div style={{ fontSize:40, marginBottom:8 }}>👥</div>
          {search ? 'Nenhum aluno encontrado para essa busca.' : 'Nenhum aluno cadastrado ainda. Clique em "Adicionar aluno" para começar.'}
        </div>
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--gray-50)', borderBottom:'1px solid var(--gray-200)' }}>
                {['Aluno','Usuário','Série','Nível','XP','Status','Ações'].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:11, fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const initials = s.name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()
                const status = s.mustChangePass ? ['new','Novo'] : s.xp >= 100 ? ['ok','Ótimo'] : ['warn','Atenção']
                return (
                  <tr key={s.id} style={{ borderBottom: i < filtered.length-1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--purple-50)', color:'var(--purple-800)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, flexShrink:0 }}>{initials}</div>
                        <span style={{ fontWeight:500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <code style={{ fontSize:12, background:'var(--gray-100)', padding:'2px 7px', borderRadius:4 }}>{s.username}</code>
                    </td>
                    <td style={{ padding:'12px 14px', color:'var(--gray-500)' }}>{s.grade ?? '—'}</td>
                    <td style={{ padding:'12px 14px', fontWeight:600 }}>{s.level}</td>
                    <td style={{ padding:'12px 14px' }}>{s.xp} <span style={{ color:'var(--gray-400)', fontSize:11 }}>XP</span></td>
                    <td style={{ padding:'12px 14px' }}>
                      <span className={`badge badge-${status[0]}`}>{status[1]}</span>
                    </td>
                    <td style={{ padding:'12px 14px' }}>
                      <div style={{ display:'flex', gap:6 }}>
                        <button title="Redefinir senha" onClick={() => setModal({type:'reset',student:s})}
                          className="btn btn-secondary btn-sm" style={{ padding:'5px 8px' }}>🔑</button>
                        <button title="Remover aluno" onClick={() => setModal({type:'delete',student:s})}
                          className="btn btn-danger btn-sm" style={{ padding:'5px 8px' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.35)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
          onClick={e => { if(e.target === e.currentTarget) setModal(null) }}>
          <div className="card card-pad" style={{ width:'100%', maxWidth:360 }}>
            <h3 style={{ marginBottom:8, fontWeight:600 }}>
              {modal.type === 'reset' ? '🔑 Redefinir senha' : '🗑️ Remover aluno'}
            </h3>
            <p style={{ color:'var(--gray-600)', marginBottom:20, fontSize:13, lineHeight:1.6 }}>
              {modal.type === 'reset'
                ? <>A senha de <strong>{modal.student.name}</strong> será redefinida para <code>123@aluno</code>. O aluno precisará criar uma nova senha no próximo login.</>
                : <>Tem certeza que deseja remover <strong>{modal.student.name}</strong>? Todo o histórico será perdido.</>}
            </p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setModal(null)}>Cancelar</button>
              {modal.type === 'reset'
                ? <button className="btn btn-success btn-sm" onClick={() => resetPassword(modal.student)}>Redefinir</button>
                : <button className="btn btn-danger btn-sm" onClick={() => deleteStudent(modal.student)}>Remover</button>}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', bottom:24, right:24, background:'var(--gray-900)', color:'#fff', padding:'10px 18px', borderRadius:12, fontSize:13, zIndex:2000, boxShadow:'0 4px 6px rgba(0,0,0,.07)' }}>
          ✓ {toast}
        </div>
      )}
    </div>
  )
}

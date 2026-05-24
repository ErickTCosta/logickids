'use client'
import { useState, useEffect } from 'react'

export default function StudentsReport({ token }: { token: string }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [token])

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" /></div>
  if (!data) return null

  const { summary, students, categoryStats } = data
  const catNames: Record<string,string> = { matematica:'Matemática', sequencia:'Sequências', padroes:'Padrões', logica:'Lógica', robo:'Robô', espacial:'Espacial' }

  return (
    <div>
      {/* Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {[
          { n: summary.totalStudents,            l:'Total de alunos',       c:'var(--purple)' },
          { n: `${summary.avgAccuracy}%`,        l:'Acerto médio',          c:'var(--teal)' },
          { n: summary.questionsAnsweredToday,   l:'Questões hoje',         c:'var(--amber-800)' },
          { n: summary.studentsNeedingAttention, l:'Precisam de atenção',   c:'var(--red)' },
        ].map(({ n, l, c }) => (
          <div key={l} className="card card-pad">
            <div style={{ fontSize:26, fontWeight:700, color: c }}>{n}</div>
            <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:2 }}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {/* Category stats */}
        <div className="card card-pad">
          <h3 style={{ fontSize:13, fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:14 }}>📊 Acertos por categoria</h3>
          {categoryStats.length === 0
            ? <p style={{ color:'var(--gray-400)', fontSize:13 }}>Sem dados ainda.</p>
            : categoryStats.map((c: any) => (
              <div key={c.category} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, fontSize:13 }}>
                <span style={{ width:80, color:'var(--gray-500)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{catNames[c.category] ?? c.category}</span>
                <div style={{ flex:1, height:6, background:'var(--gray-100)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'var(--purple)', borderRadius:3, width:`${c.accuracy}%` }} />
                </div>
                <span style={{ width:34, textAlign:'right', fontWeight:600 }}>{c.accuracy}%</span>
              </div>
            ))}
        </div>

        {/* Ranking */}
        <div className="card card-pad">
          <h3 style={{ fontSize:13, fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:14 }}>🏆 Ranking da turma</h3>
          {[...students].sort((a,b) => b.xp-a.xp).slice(0,5).map((s: any, i: number) => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none', fontSize:13 }}>
              <span style={{ width:22, fontSize:16, textAlign:'center' }}>{['🥇','🥈','🥉'][i] ?? i+1}</span>
              <span style={{ flex:1, fontWeight:500 }}>{s.name}</span>
              <span style={{ fontWeight:600, color:'var(--purple)' }}>{s.xp} XP</span>
            </div>
          ))}
          {students.length === 0 && <p style={{ color:'var(--gray-400)', fontSize:13 }}>Nenhum aluno ainda.</p>}
        </div>
      </div>

      {/* Attention list */}
      <div className="card card-pad">
        <h3 style={{ fontSize:13, fontWeight:600, color:'var(--gray-500)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:14 }}>⚠️ Alunos que precisam de atenção</h3>
        {students.filter((s:any) => s.status === 'atencao' || s.weakCategories?.length > 0).length === 0
          ? <p style={{ color:'var(--teal)', fontSize:13 }}>✅ Todos os alunos estão indo bem!</p>
          : students.filter((s:any) => s.status === 'atencao' || s.weakCategories?.length > 0).map((s:any, i:number, arr:any[]) => (
            <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i < arr.length-1 ? '1px solid var(--gray-100)' : 'none', fontSize:13 }}>
              <div>
                <div style={{ fontWeight:500 }}>{s.name} <span style={{ color:'var(--gray-400)', fontWeight:400 }}>({s.username})</span></div>
                <div style={{ fontSize:12, color:'var(--gray-400)' }}>
                  {s.weakCategories?.length ? `Dificuldade em: ${s.weakCategories.map((c:string) => catNames[c]??c).join(', ')}` : 'Baixo aproveitamento geral'}
                </div>
              </div>
              <span style={{ fontWeight:600, color:'var(--red)' }}>{s.accuracy}%</span>
            </div>
          ))}
      </div>
    </div>
  )
}

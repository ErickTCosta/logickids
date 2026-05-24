'use client'
import { useState } from 'react'
import StudentsList from './StudentsList'
import StudentsReport from './StudentsReport'

type Tab = 'students' | 'report'

export default function TeacherDashboard({ teacher, token, onLogout }: { teacher: any; token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('students')

  return (
    <div className="page">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">L</div>
          <div className="topbar-logo-text">Logic<span>Kids</span></div>
          <span style={{ marginLeft:8, fontSize:12, color:'var(--gray-400)', fontWeight:400 }}>Professor</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ background:'var(--purple-50)', color:'var(--purple-800)', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600 }}>
            👨‍🏫 {teacher?.name}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onLogout}>Sair</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--gray-200)', padding:'0 24px' }}>
        <div style={{ display:'flex', gap:0 }}>
          {([['students','👥 Alunos'],['report','📊 Relatório']] as [Tab,string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding:'14px 20px', fontSize:14, fontWeight:500, background:'none', border:'none', cursor:'pointer', borderBottom: tab === id ? '2px solid var(--purple)' : '2px solid transparent', color: tab === id ? 'var(--purple)' : 'var(--gray-500)', marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {tab === 'students' && <StudentsList token={token} />}
        {tab === 'report'   && <StudentsReport token={token} />}
      </div>
    </div>
  )
}

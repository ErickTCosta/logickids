'use client'
import { useEffect, useState } from 'react'
import StudentLogin from '@/components/student/StudentLogin'
import StudentSetPassword from '@/components/student/StudentSetPassword'
import StudentApp from '@/components/student/StudentApp'

export default function StudentPage() {
  const [token, setToken] = useState<string | null>(null)
  const [student, setStudent] = useState<any>(null)
  const [mustChangePass, setMustChangePass] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('lk_student_token')
    const sd = localStorage.getItem('lk_student_data')
    const mcp = localStorage.getItem('lk_must_change') === 'true'
    if (t && sd) { setToken(t); setStudent(JSON.parse(sd)); setMustChangePass(mcp) }
    setLoading(false)
  }, [])

  function handleLogin(token: string, student: any, mustChangePass: boolean) {
    localStorage.setItem('lk_student_token', token)
    localStorage.setItem('lk_student_data', JSON.stringify(student))
    localStorage.setItem('lk_must_change', String(mustChangePass))
    setToken(token); setStudent(student); setMustChangePass(mustChangePass)
  }

  function handlePasswordSet(token: string, student: any) {
    localStorage.setItem('lk_student_token', token)
    localStorage.setItem('lk_student_data', JSON.stringify(student))
    localStorage.setItem('lk_must_change', 'false')
    setToken(token); setStudent(student); setMustChangePass(false)
  }

  function handleLogout() {
    localStorage.removeItem('lk_student_token')
    localStorage.removeItem('lk_student_data')
    localStorage.removeItem('lk_must_change')
    setToken(null); setStudent(null); setMustChangePass(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!token) return <StudentLogin onLogin={handleLogin} />
  if (mustChangePass) return <StudentSetPassword token={token} student={student} onPasswordSet={handlePasswordSet} />
  return <StudentApp token={token} student={student} onLogout={handleLogout} />
}

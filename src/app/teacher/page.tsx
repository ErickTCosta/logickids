'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TeacherLogin from '@/components/teacher/TeacherLogin'
import TeacherDashboard from '@/components/teacher/TeacherDashboard'

export default function TeacherPage() {
  const [token, setToken] = useState<string | null>(null)
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('lk_teacher_token')
    const tc = localStorage.getItem('lk_teacher_data')
    if (t && tc) { setToken(t); setTeacher(JSON.parse(tc)) }
    setLoading(false)
  }, [])

  function handleLogin(token: string, teacher: any) {
    localStorage.setItem('lk_teacher_token', token)
    localStorage.setItem('lk_teacher_data', JSON.stringify(teacher))
    setToken(token)
    setTeacher(teacher)
  }

  function handleLogout() {
    localStorage.removeItem('lk_teacher_token')
    localStorage.removeItem('lk_teacher_data')
    setToken(null)
    setTeacher(null)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!token) return <TeacherLogin onLogin={handleLogin} />
  return <TeacherDashboard teacher={teacher} token={token} onLogout={handleLogout} />
}

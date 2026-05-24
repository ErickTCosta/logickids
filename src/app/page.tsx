import Link from 'next/link'

export default function Home() {
  return (
    <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background:'linear-gradient(135deg, #EEEDFE 0%, #E1F5EE 100%)' }}>
      <div style={{ textAlign:'center', padding:'40px 20px' }}>
        <div style={{ width:64, height:64, background:'var(--purple)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, fontWeight:700, color:'#fff', margin:'0 auto 16px' }}>L</div>
        <h1 style={{ fontSize:32, fontWeight:700, color:'var(--gray-900)', marginBottom:8 }}>
          Logic<span style={{ color:'var(--purple)' }}>Kids</span>
        </h1>
        <p style={{ color:'var(--gray-500)', marginBottom:32, fontSize:16 }}>Portal interativo de raciocínio lógico para crianças</p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/teacher" className="btn btn-primary btn-lg">
            👨‍🏫 Sou Professor
          </Link>
          <Link href="/student" className="btn btn-secondary btn-lg">
            🎮 Sou Aluno
          </Link>
        </div>
      </div>
    </div>
  )
}

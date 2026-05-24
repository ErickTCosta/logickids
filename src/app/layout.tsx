import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LogicKids — Raciocínio Lógico',
  description: 'Portal interativo de raciocínio lógico para crianças do Ensino Fundamental',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

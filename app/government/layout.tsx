import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Swasthya Drishti | Command Center',
  description: 'Analytics Dashboard for Health Intelligence',
  generator: 'v0.app',
}

export default function GovernmentLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </div>
  )
}

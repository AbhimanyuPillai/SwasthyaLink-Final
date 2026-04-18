import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { GovernmentToaster } from '@/app/government/components/government-toaster'
import { GovernmentAuthWrapper } from '@/app/government/components/auth-wrapper'
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
      <GovernmentAuthWrapper>
        {children}
        <GovernmentToaster />
      </GovernmentAuthWrapper>
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </div>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Boffo — Demand Validation Engine',
  description: 'Validate demand before you build. Boffo fine-tunes models & uses precise context engineering to validate demand against must-have VC metrics & real user data.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

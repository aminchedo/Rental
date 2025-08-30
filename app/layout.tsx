import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'سیستم مدیریت اجاره',
  description: 'سیستم جامع مدیریت قراردادهای اجاره',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
import './globals.css'
import { Inter } from 'next/font/google'
import AuthProvider from '@/components/auth/AuthProvider-mock'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ExpenseAI - Smart Expense Tracking for Indian UPI Users',
  description: 'AI-powered expense tracking with intelligent insights for Indian spending patterns',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-900 text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
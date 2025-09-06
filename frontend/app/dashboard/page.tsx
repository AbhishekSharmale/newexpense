'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider-mock'
import PDFUploadWorkflow from '@/components/upload/PDFUploadWorkflow'
import SimpleChart from '@/components/ui/SimpleChart'

const mockData = {
  categories: [
    { name: 'Food & Dining', value: 15420, color: '#ef4444' },
    { name: 'Transportation', value: 8340, color: '#f97316' },
    { name: 'Shopping', value: 12680, color: '#eab308' },
    { name: 'Entertainment', value: 4250, color: '#22c55e' },
    { name: 'Utilities', value: 6890, color: '#3b82f6' }
  ],
  monthlySpend: [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 47580 }
  ]
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [hasData, setHasData] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)

  const handleFileUpload = async (file: File) => {
    setProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setProcessing(false)
      setHasData(true)
    }, 3000)
  }

  const handleAnalysisComplete = (data: any) => {
    setAnalysisData(data)
    setHasData(true)
    setProcessing(false)
  }

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Header */}
      <header className="bg-dark-800 border-b border-gray-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-400">ExpenseAI Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.displayName}</span>
            <button onClick={logout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {!hasData ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Upload Your First Statement</h2>
              <p className="text-gray-400">Get instant AI-powered insights from your bank statement</p>
            </div>
            <PDFUploadWorkflow onComplete={handleAnalysisComplete} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Spent</p>
                    <p className="text-2xl font-bold text-red-400">₹{analysisData?.summary?.totalSpent?.toLocaleString() || '47,580'}</p>
                  </div>
                  <div className="w-8 h-8 text-red-400 text-2xl">📈</div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Income</p>
                    <p className="text-2xl font-bold text-green-400">₹{analysisData?.summary?.totalIncome?.toLocaleString() || '75,000'}</p>
                  </div>
                  <div className="w-8 h-8 text-green-400 text-2xl">💰</div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Savings</p>
                    <p className="text-2xl font-bold text-blue-400">₹{analysisData?.summary?.savings?.toLocaleString() || '27,420'}</p>
                  </div>
                  <div className="w-8 h-8 text-blue-400 text-2xl">🎯</div>
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">vs Last Month</p>
                    <p className="text-2xl font-bold text-yellow-400">-8.2%</p>
                  </div>
                  <div className="w-8 h-8 text-yellow-400 text-2xl">📉</div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Spending by Category</h3>
                <SimpleChart data={analysisData?.summary?.categories ? 
                  Object.entries(analysisData.summary.categories).map(([name, value]: [string, any]) => ({
                    name,
                    value,
                    color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'][Math.floor(Math.random() * 5)]
                  })) : mockData.categories} type="pie" />
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
                <SimpleChart 
                  data={mockData.monthlySpend.map(item => ({
                    name: item.month,
                    value: item.amount,
                    color: '#3b82f6'
                  }))}
                  type="bar" 
                />
              </div>
            </div>

            {/* AI Insights */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">AI Insights</h3>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600">
                  <p className="text-yellow-300">💡 <strong>Spending Alert:</strong> You spent 23% more on food delivery this month. Consider cooking at home to save ₹3,500/month.</p>
                </div>
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-600">
                  <p className="text-green-300">✅ <strong>Good News:</strong> Your transportation costs decreased by 15% due to work from home days.</p>
                </div>
                <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
                  <p className="text-blue-300">📊 <strong>Prediction:</strong> At current spending rate, you'll save ₹32,000 by month end. On track for your bike goal!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
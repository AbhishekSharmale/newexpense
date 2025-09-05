'use client'

import { useState } from 'react'
// import { ArrowRight, Brain, Shield, TrendingUp, Zap } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-primary-400">ExpenseAI</div>
        <a href="/auth" className="btn-secondary">Sign In</a>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-primary-400 bg-clip-text text-transparent">
          Transform Your UPI Statements Into Smart Financial Insights
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          AI-powered expense tracking built specifically for Indian spending patterns. 
          Upload your bank statement and get instant categorization, predictions, and actionable insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch mb-12 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-lg bg-dark-800 border border-gray-600 text-white flex-1"
          />
          <a href="/auth" className="btn-primary flex items-center justify-center gap-2 whitespace-nowrap">
            Get Started Free →
          </a>
        </div>

        <div className="text-sm text-gray-400">
          ✅ Free forever • ✅ No credit card required • ✅ 100% private
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Built for Indian UPI Users</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card text-center h-full flex flex-col">
            <div className="w-12 h-12 text-primary-400 mx-auto mb-4 text-4xl">🧠</div>
            <h3 className="text-xl font-semibold mb-2">AI Categorization</h3>
            <p className="text-gray-400 flex-1">Understands PhonePe, GPay, Paytm transactions with 95% accuracy</p>
          </div>
          
          <div className="card text-center h-full flex flex-col">
            <div className="w-12 h-12 text-primary-400 mx-auto mb-4 text-4xl">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
            <p className="text-gray-400 flex-1">Process PDFs locally, zero data storage, bank-grade security</p>
          </div>
          
          <div className="card text-center h-full flex flex-col">
            <div className="w-12 h-12 text-primary-400 mx-auto mb-4 text-4xl">📈</div>
            <h3 className="text-xl font-semibold mb-2">Smart Predictions</h3>
            <p className="text-gray-400 flex-1">Forecast spending, track goals, optimize EMIs and cashbacks</p>
          </div>
          
          <div className="card text-center h-full flex flex-col">
            <div className="w-12 h-12 text-primary-400 mx-auto mb-4 text-4xl">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Instant Insights</h3>
            <p className="text-gray-400 flex-1">Festival budgets, subscription tracking, spending triggers</p>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="px-6 py-16 bg-dark-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">See Your Money in Action</h2>
          <div className="bg-dark-800 rounded-xl p-8 border border-gray-700">
            <div className="text-left space-y-4">
              <div className="flex justify-between items-center p-3 bg-dark-900 rounded">
                <span>🍕 Zomato Delivery</span>
                <span className="text-red-400">-₹340</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-900 rounded">
                <span>🚗 Uber Ride</span>
                <span className="text-red-400">-₹180</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-dark-900 rounded">
                <span>💰 Salary Credit</span>
                <span className="text-green-400">+₹75,000</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary-900/20 rounded border border-primary-600">
              <p className="text-primary-300">💡 <strong>AI Insight:</strong> You spent 23% more on food delivery this week. Consider cooking at home to save ₹1,200/month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Master Your Money?</h2>
        <p className="text-gray-300 mb-8">Join thousands of Indians taking control of their finances</p>
        <a href="/auth" className="btn-primary text-lg px-8 py-4">
          Start Free Analysis
        </a>
      </section>
    </div>
  )
}
const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3003

// Mock data
const mockData = {
  goals: [
    {
      id: '1',
      type: 'savings',
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 35000,
      targetDate: '2024-12-31',
      priority: 'high',
      monthlyContribution: 8000
    },
    {
      id: '2', 
      type: 'purchase',
      name: 'New Bike',
      targetAmount: 80000,
      currentAmount: 25000,
      targetDate: '2024-08-15',
      priority: 'medium',
      monthlyContribution: 12000
    }
  ],
  transactions: [
    {
      id: '1',
      date: '2024-01-15',
      description: 'UPI-ZOMATO-DELIVERY-BLR',
      amount: -340,
      category: 'Food & Dining',
      confidence: 45,
      needsReview: true
    },
    {
      id: '2',
      date: '2024-01-16', 
      description: 'UPI-UBER-RIDE-PAYMENT',
      amount: -180,
      category: 'Transportation',
      confidence: 85,
      needsReview: false
    }
  ],
  categoryData: [
    { name: 'Food & Dining', value: 15420, color: '#ef4444' },
    { name: 'Transportation', value: 8340, color: '#f97316' },
    { name: 'Shopping', value: 12680, color: '#eab308' },
    { name: 'Entertainment', value: 4250, color: '#22c55e' }
  ],
  monthlyData: [
    { month: 'Jan', income: 75000, expenses: 45000, savings: 30000 },
    { month: 'Feb', income: 75000, expenses: 52000, savings: 23000 },
    { month: 'Mar', income: 75000, expenses: 48000, savings: 27000 },
    { month: 'Apr', income: 75000, expenses: 47580, savings: 27420 }
  ],
  dailyData: [
    { name: 'Mon', value: 1200 },
    { name: 'Tue', value: 800 },
    { name: 'Wed', value: 2100 },
    { name: 'Thu', value: 950 },
    { name: 'Fri', value: 1800 },
    { name: 'Sat', value: 2400 },
    { name: 'Sun', value: 1100 }
  ]
}

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Feature Demo</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .feature-nav { position: sticky; top: 0; z-index: 100; background: rgba(17, 24, 39, 0.9); backdrop-filter: blur(10px); }
        .demo-container { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState } = React;

        // Mock Components (simplified versions)
        function PDFUploadDemo() {
            const [step, setStep] = useState('upload');
            const [progress, setProgress] = useState(0);

            const simulateUpload = () => {
                setStep('processing');
                let prog = 0;
                const interval = setInterval(() => {
                    prog += 20;
                    setProgress(prog);
                    if (prog >= 100) {
                        clearInterval(interval);
                        setStep('complete');
                    }
                }, 800);
            };

            if (step === 'processing') {
                return (
                    <div className="max-w-lg mx-auto">
                        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 mx-auto mb-4 relative">
                                    <div className="w-full h-full bg-blue-500/20 rounded-full flex items-center justify-center">
                                        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{progress}%</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Processing Your Statement</h3>
                                <p className="text-gray-400">AI is analyzing your transactions...</p>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500" style={{width: \`\${progress}%\`}}></div>
                            </div>
                        </div>
                    </div>
                );
            }

            if (step === 'complete') {
                return (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold mb-2">Analysis Complete!</h3>
                        <p className="text-gray-400 mb-6">Found 45 transactions, categorized with 94% accuracy</p>
                        <button onClick={() => setStep('upload')} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            Upload Another Statement
                        </button>
                    </div>
                );
            }

            return (
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-4">Upload Your Bank Statement</h2>
                        <p className="text-gray-400">Get instant AI-powered insights from your PDF statement</p>
                    </div>
                    <div 
                        onClick={simulateUpload}
                        className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:bg-blue-500/5"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Drag & drop your bank statement</h3>
                        <p className="text-gray-400 mb-4">or click to browse files</p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>📄 PDF files only • Max 10MB</p>
                            <p>🏦 Supports SBI, HDFC, ICICI, Axis Bank</p>
                        </div>
                    </div>
                    <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-green-400 mb-2">🔒 Your Data Stays Private</h4>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>• We process your PDF locally and delete it immediately</li>
                                    <li>• Bank-grade encryption protects your information</li>
                                    <li>• No raw transaction data is stored on our servers</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function ChartsDemo() {
            const [activeChart, setActiveChart] = useState('categories');
            const categoryData = ${JSON.stringify(mockData.categoryData)};

            return (
                <div className="space-y-6">
                    <div className="flex bg-gray-800/50 rounded-lg p-1">
                        {[
                            { key: 'categories', label: 'Categories', icon: '🥧' },
                            { key: 'trends', label: 'Trends', icon: '📈' },
                            { key: 'daily', label: 'Daily', icon: '📊' }
                        ].map((chart) => (
                            <button
                                key={chart.key}
                                onClick={() => setActiveChart(chart.key)}
                                className={\`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors \${
                                    activeChart === chart.key ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                }\`}
                            >
                                <span>{chart.icon}</span>
                                {chart.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold mb-6">Spending by Category</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {categoryData.map((category, index) => (
                                <div key={category.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-all">
                                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: category.color}}></div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{category.name}</div>
                                        <div className="text-xs text-gray-400">₹{category.value.toLocaleString()}</div>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-xl font-semibold mb-4">Chart Insights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
                                <div className="text-blue-300 text-sm font-medium">Highest Category</div>
                                <div className="text-lg font-bold">Food & Dining</div>
                                <div className="text-sm text-gray-400">₹15,420</div>
                            </div>
                            <div className="p-4 bg-green-900/20 rounded-lg border border-green-600">
                                <div className="text-green-300 text-sm font-medium">Avg Daily Spend</div>
                                <div className="text-lg font-bold">₹1,586</div>
                                <div className="text-sm text-gray-400">Last 30 days</div>
                            </div>
                            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600">
                                <div className="text-yellow-300 text-sm font-medium">Spending Trend</div>
                                <div className="text-lg font-bold">↗️ +12%</div>
                                <div className="text-sm text-gray-400">vs last month</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function GoalsDemo() {
            const [showModal, setShowModal] = useState(false);
            const goals = ${JSON.stringify(mockData.goals)};

            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Financial Goals</h2>
                            <p className="text-gray-400">Set and track your financial objectives</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            + Create Goal
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map((goal) => {
                            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                            return (
                                <div key={goal.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{goal.name}</h3>
                                            <div className={\`inline-block px-2 py-1 rounded text-xs font-medium border \${
                                                goal.priority === 'high' ? 'text-red-400 bg-red-900/20 border-red-600' : 'text-yellow-400 bg-yellow-900/20 border-yellow-600'
                                            }\`}>
                                                {goal.priority} priority
                                            </div>
                                        </div>
                                        <div className="text-2xl">{goal.type === 'savings' ? '💰' : '🛍️'}</div>
                                    </div>

                                    <div className="relative w-24 h-24 mx-auto mb-4">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                                            <circle cx="50" cy="50" r="40" stroke="#3b82f6" strokeWidth="8" fill="none" 
                                                strokeDasharray={\`\${progress * 2.51} 251\`} className="transition-all duration-500" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold">{Math.round(progress)}%</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Current</span>
                                            <span className="font-medium">₹{goal.currentAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Target</span>
                                            <span className="font-medium">₹{goal.targetAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-400">Monthly</span>
                                            <span className="font-medium">₹{goal.monthlyContribution.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{width: \`\${progress}%\`}}></div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4">
                                        <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                                            Edit
                                        </button>
                                        <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                            Add Money
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-800 rounded-2xl max-w-md w-full p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold">Create New Goal</h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">✕</button>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { type: 'savings', icon: '💰', title: 'Savings Goal' },
                                            { type: 'purchase', icon: '🛍️', title: 'Purchase Goal' },
                                            { type: 'debt', icon: '💳', title: 'Debt Payoff' },
                                            { type: 'investment', icon: '📈', title: 'Investment Goal' }
                                        ].map((goalType) => (
                                            <div key={goalType.type} className="p-4 rounded-xl border border-gray-600 hover:border-blue-500 cursor-pointer transition-all">
                                                <div className="text-2xl mb-2">{goalType.icon}</div>
                                                <h5 className="font-semibold text-sm">{goalType.title}</h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button 
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        function TransactionsDemo() {
            const transactions = ${JSON.stringify(mockData.transactions)};
            const [filter, setFilter] = useState('needs-review');

            const filteredTransactions = transactions.filter(t => 
                filter === 'needs-review' ? t.needsReview : true
            );

            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Transaction Review</h2>
                            <p className="text-gray-400">Review and correct AI categorization</p>
                        </div>
                    </div>

                    <div className="flex bg-gray-800/50 rounded-lg p-1">
                        {[
                            { key: 'needs-review', label: 'Needs Review', count: 1 },
                            { key: 'all', label: 'All Transactions', count: 2 }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={\`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors \${
                                    filter === tab.key ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                }\`}
                            >
                                {tab.label}
                                <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">{tab.count}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {filteredTransactions.map((transaction) => (
                            <div key={transaction.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div>
                                            <div className="font-medium">{transaction.description}</div>
                                            <div className="text-sm text-gray-400">{transaction.date}</div>
                                        </div>
                                        <div className="text-right md:text-left">
                                            <div className="font-semibold text-red-400">₹{Math.abs(transaction.amount).toLocaleString()}</div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium">{transaction.category}</span>
                                                <span className={\`px-2 py-1 rounded text-xs \${
                                                    transaction.confidence >= 80 ? 'text-green-400 bg-green-900/20' : 'text-red-400 bg-red-900/20'
                                                }\`}>
                                                    {transaction.confidence >= 80 ? 'High' : 'Low'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <button className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                                                Review
                                            </button>
                                            <button className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                                                Correct
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-4">AI Learning Progress</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">94%</div>
                                <div className="text-sm text-gray-400">Current Accuracy</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">+12%</div>
                                <div className="text-sm text-gray-400">Improvement This Month</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400">156</div>
                                <div className="text-sm text-gray-400">Corrections Made</div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        function App() {
            const [activeFeature, setActiveFeature] = useState('upload');

            const features = [
                { key: 'upload', label: 'PDF Upload', icon: '📄', component: PDFUploadDemo },
                { key: 'charts', label: 'Analytics', icon: '📊', component: ChartsDemo },
                { key: 'goals', label: 'Goals', icon: '🎯', component: GoalsDemo },
                { key: 'transactions', label: 'Review', icon: '🔍', component: TransactionsDemo }
            ];

            const ActiveComponent = features.find(f => f.key === activeFeature)?.component || PDFUploadDemo;

            return (
                <div className="demo-container text-white">
                    {/* Header */}
                    <div className="feature-nav border-b border-gray-700 p-4">
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-4">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    ExpenseAI - Feature Demo
                                </h1>
                                <div className="text-sm text-gray-400">
                                    Production-Ready Components
                                </div>
                            </div>
                            
                            {/* Feature Navigation */}
                            <div className="flex bg-gray-800/50 rounded-lg p-1">
                                {features.map((feature) => (
                                    <button
                                        key={feature.key}
                                        onClick={() => setActiveFeature(feature.key)}
                                        className={\`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors \${
                                            activeFeature === feature.key
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                        }\`}
                                    >
                                        <span>{feature.icon}</span>
                                        {feature.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Feature Content */}
                    <div className="max-w-6xl mx-auto p-6">
                        <ActiveComponent />
                    </div>
                </div>
            );
        }

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(htmlContent)
})

server.listen(PORT, () => {
  console.log(\`🚀 ExpenseAI Feature Demo running on http://localhost:\${PORT}\`)
  console.log(\`📱 Features: PDF Upload, Charts, Goals, Transaction Review\`)
  console.log(\`✨ All components working with mock data\`)
})
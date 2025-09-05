const http = require('http')
const PORT = 3003

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Feature Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .demo-container { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%); }
        .feature-nav { position: sticky; top: 0; z-index: 100; background: rgba(17, 24, 39, 0.9); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="text-white">
    <div class="demo-container">
        <!-- Header -->
        <div class="feature-nav border-b border-gray-700 p-4">
            <div class="max-w-6xl mx-auto">
                <div class="flex items-center justify-between mb-4">
                    <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        ExpenseAI - Feature Demo
                    </h1>
                    <div class="text-sm text-gray-400">Production-Ready Components</div>
                </div>
                
                <!-- Feature Navigation -->
                <div class="flex bg-gray-800/50 rounded-lg p-1">
                    <button onclick="showFeature('upload')" id="btn-upload" class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors bg-blue-600 text-white">
                        <span>📄</span> PDF Upload
                    </button>
                    <button onclick="showFeature('charts')" id="btn-charts" class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors text-gray-300 hover:text-white hover:bg-gray-700">
                        <span>📊</span> Analytics
                    </button>
                    <button onclick="showFeature('goals')" id="btn-goals" class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors text-gray-300 hover:text-white hover:bg-gray-700">
                        <span>🎯</span> Goals
                    </button>
                    <button onclick="showFeature('transactions')" id="btn-transactions" class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors text-gray-300 hover:text-white hover:bg-gray-700">
                        <span>🔍</span> Review
                    </button>
                </div>
            </div>
        </div>

        <!-- Feature Content -->
        <div class="max-w-6xl mx-auto p-6">
            <!-- PDF Upload Feature -->
            <div id="feature-upload" class="feature-content">
                <div class="max-w-2xl mx-auto">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold mb-4">Upload Your Bank Statement</h2>
                        <p class="text-gray-400">Get instant AI-powered insights from your PDF statement</p>
                    </div>
                    
                    <div id="upload-area" onclick="simulateUpload()" class="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:bg-blue-500/5">
                        <div class="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Drag & drop your bank statement</h3>
                        <p class="text-gray-400 mb-4">or click to browse files</p>
                        <div class="space-y-2 text-sm text-gray-500">
                            <p>📄 PDF files only • Max 10MB</p>
                            <p>🏦 Supports SBI, HDFC, ICICI, Axis Bank</p>
                        </div>
                    </div>

                    <div class="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div class="flex items-start gap-4">
                            <div class="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold text-green-400 mb-2">🔒 Your Data Stays Private</h4>
                                <ul class="text-sm text-gray-400 space-y-1">
                                    <li>• We process your PDF locally and delete it immediately</li>
                                    <li>• Bank-grade encryption protects your information</li>
                                    <li>• No raw transaction data is stored on our servers</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Feature -->
            <div id="feature-charts" class="feature-content hidden">
                <div class="space-y-6">
                    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 class="text-xl font-semibold mb-6">Spending by Category</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-all">
                                <div class="w-4 h-4 rounded-full bg-red-500"></div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">Food & Dining</div>
                                    <div class="text-xs text-gray-400">₹15,420</div>
                                </div>
                                <div class="text-sm font-medium">37.5%</div>
                            </div>
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-all">
                                <div class="w-4 h-4 rounded-full bg-orange-500"></div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">Transportation</div>
                                    <div class="text-xs text-gray-400">₹8,340</div>
                                </div>
                                <div class="text-sm font-medium">20.3%</div>
                            </div>
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-all">
                                <div class="w-4 h-4 rounded-full bg-yellow-500"></div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">Shopping</div>
                                    <div class="text-xs text-gray-400">₹12,680</div>
                                </div>
                                <div class="text-sm font-medium">30.8%</div>
                            </div>
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-all">
                                <div class="w-4 h-4 rounded-full bg-green-500"></div>
                                <div class="flex-1">
                                    <div class="font-medium text-sm">Entertainment</div>
                                    <div class="text-xs text-gray-400">₹4,250</div>
                                </div>
                                <div class="text-sm font-medium">10.3%</div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 class="text-xl font-semibold mb-4">Chart Insights</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
                                <div class="text-blue-300 text-sm font-medium">Highest Category</div>
                                <div class="text-lg font-bold">Food & Dining</div>
                                <div class="text-sm text-gray-400">₹15,420</div>
                            </div>
                            <div class="p-4 bg-green-900/20 rounded-lg border border-green-600">
                                <div class="text-green-300 text-sm font-medium">Avg Daily Spend</div>
                                <div class="text-lg font-bold">₹1,586</div>
                                <div class="text-sm text-gray-400">Last 30 days</div>
                            </div>
                            <div class="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600">
                                <div class="text-yellow-300 text-sm font-medium">Spending Trend</div>
                                <div class="text-lg font-bold">↗️ +12%</div>
                                <div class="text-sm text-gray-400">vs last month</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Goals Feature -->
            <div id="feature-goals" class="feature-content hidden">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">Financial Goals</h2>
                            <p class="text-gray-400">Set and track your financial objectives</p>
                        </div>
                        <button onclick="showGoalModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                            + Create Goal
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="font-semibold text-lg">Emergency Fund</h3>
                                    <div class="inline-block px-2 py-1 rounded text-xs font-medium border text-red-400 bg-red-900/20 border-red-600">
                                        high priority
                                    </div>
                                </div>
                                <div class="text-2xl">💰</div>
                            </div>

                            <div class="relative w-24 h-24 mx-auto mb-4">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none" />
                                    <circle cx="50" cy="50" r="40" stroke="#3b82f6" stroke-width="8" fill="none" stroke-dasharray="87.85 251" class="transition-all duration-500" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-lg font-bold">35%</span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Current</span>
                                    <span class="font-medium">₹35,000</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Target</span>
                                    <span class="font-medium">₹1,00,000</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Monthly</span>
                                    <span class="font-medium">₹8,000</span>
                                </div>
                            </div>

                            <div class="mt-4">
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 35%"></div>
                                </div>
                            </div>

                            <div class="flex gap-2 mt-4">
                                <button class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                                    Edit
                                </button>
                                <button class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                    Add Money
                                </button>
                            </div>
                        </div>

                        <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h3 class="font-semibold text-lg">New Bike</h3>
                                    <div class="inline-block px-2 py-1 rounded text-xs font-medium border text-yellow-400 bg-yellow-900/20 border-yellow-600">
                                        medium priority
                                    </div>
                                </div>
                                <div class="text-2xl">🛍️</div>
                            </div>

                            <div class="relative w-24 h-24 mx-auto mb-4">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none" />
                                    <circle cx="50" cy="50" r="40" stroke="#3b82f6" stroke-width="8" fill="none" stroke-dasharray="78.5 251" class="transition-all duration-500" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-lg font-bold">31%</span>
                                </div>
                            </div>

                            <div class="space-y-3">
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Current</span>
                                    <span class="font-medium">₹25,000</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Target</span>
                                    <span class="font-medium">₹80,000</span>
                                </div>
                                <div class="flex justify-between text-sm">
                                    <span class="text-gray-400">Monthly</span>
                                    <span class="font-medium">₹12,000</span>
                                </div>
                            </div>

                            <div class="mt-4">
                                <div class="w-full bg-gray-700 rounded-full h-2">
                                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" style="width: 31%"></div>
                                </div>
                            </div>

                            <div class="flex gap-2 mt-4">
                                <button class="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                                    Edit
                                </button>
                                <button class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                                    Add Money
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transactions Feature -->
            <div id="feature-transactions" class="feature-content hidden">
                <div class="space-y-6">
                    <div class="flex justify-between items-center">
                        <div>
                            <h2 class="text-2xl font-bold">Transaction Review</h2>
                            <p class="text-gray-400">Review and correct AI categorization</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <div class="font-medium">UPI-ZOMATO-DELIVERY-BLR</div>
                                        <div class="text-sm text-gray-400">2024-01-15</div>
                                    </div>
                                    <div class="text-right md:text-left">
                                        <div class="font-semibold text-red-400">₹340</div>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-sm font-medium">Food & Dining</span>
                                            <span class="px-2 py-1 rounded text-xs text-red-400 bg-red-900/20">
                                                Low
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 justify-end">
                                        <button class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
                                            Review
                                        </button>
                                        <button class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                                            Correct
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-gray-800/50 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-all">
                            <div class="flex items-center gap-4">
                                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                    <div>
                                        <div class="font-medium">UPI-UBER-RIDE-PAYMENT</div>
                                        <div class="text-sm text-gray-400">2024-01-16</div>
                                    </div>
                                    <div class="text-right md:text-left">
                                        <div class="font-semibold text-red-400">₹180</div>
                                    </div>
                                    <div>
                                        <div class="flex items-center gap-2 mb-1">
                                            <span class="text-sm font-medium">Transportation</span>
                                            <span class="px-2 py-1 rounded text-xs text-green-400 bg-green-900/20">
                                                High
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex gap-2 justify-end">
                                        <button class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors">
                                            ✓ Correct
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                        <h3 class="text-lg font-semibold mb-4">AI Learning Progress</h3>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-green-400">94%</div>
                                <div class="text-sm text-gray-400">Current Accuracy</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-blue-400">+12%</div>
                                <div class="text-sm text-gray-400">Improvement This Month</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-yellow-400">156</div>
                                <div class="text-sm text-gray-400">Corrections Made</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Goal Modal -->
    <div id="goal-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 hidden">
        <div class="bg-gray-800 rounded-2xl max-w-md w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-semibold">Create New Goal</h3>
                <button onclick="hideGoalModal()" class="text-gray-400 hover:text-white">✕</button>
            </div>
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl border border-gray-600 hover:border-blue-500 cursor-pointer transition-all">
                        <div class="text-2xl mb-2">💰</div>
                        <h5 class="font-semibold text-sm">Savings Goal</h5>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-600 hover:border-blue-500 cursor-pointer transition-all">
                        <div class="text-2xl mb-2">🛍️</div>
                        <h5 class="font-semibold text-sm">Purchase Goal</h5>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-600 hover:border-blue-500 cursor-pointer transition-all">
                        <div class="text-2xl mb-2">💳</div>
                        <h5 class="font-semibold text-sm">Debt Payoff</h5>
                    </div>
                    <div class="p-4 rounded-xl border border-gray-600 hover:border-blue-500 cursor-pointer transition-all">
                        <div class="text-2xl mb-2">📈</div>
                        <h5 class="font-semibold text-sm">Investment Goal</h5>
                    </div>
                </div>
            </div>
            <div class="mt-6 flex justify-end">
                <button onclick="hideGoalModal()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    Continue
                </button>
            </div>
        </div>
    </div>

    <script>
        function showFeature(feature) {
            // Hide all features
            document.querySelectorAll('.feature-content').forEach(el => el.classList.add('hidden'));
            
            // Show selected feature
            document.getElementById('feature-' + feature).classList.remove('hidden');
            
            // Update button states
            document.querySelectorAll('[id^="btn-"]').forEach(btn => {
                btn.className = 'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors text-gray-300 hover:text-white hover:bg-gray-700';
            });
            
            document.getElementById('btn-' + feature).className = 'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors bg-blue-600 text-white';
        }

        function simulateUpload() {
            const uploadArea = document.getElementById('upload-area');
            uploadArea.innerHTML = \`
                <div class="w-20 h-20 mx-auto mb-4 relative">
                    <div class="w-full h-full bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div class="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div class="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span class="text-white text-xs font-bold">85%</span>
                    </div>
                </div>
                <h3 class="text-xl font-semibold mb-2">Processing Your Statement</h3>
                <p class="text-gray-400">AI is analyzing your transactions...</p>
            \`;
            
            setTimeout(() => {
                uploadArea.innerHTML = \`
                    <div class="text-6xl mb-4">✅</div>
                    <h3 class="text-2xl font-bold mb-2">Analysis Complete!</h3>
                    <p class="text-gray-400 mb-6">Found 45 transactions, categorized with 94% accuracy</p>
                    <button onclick="location.reload()" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        Upload Another Statement
                    </button>
                \`;
            }, 3000);
        }

        function showGoalModal() {
            document.getElementById('goal-modal').classList.remove('hidden');
        }

        function hideGoalModal() {
            document.getElementById('goal-modal').classList.add('hidden');
        }
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(htmlContent)
})

server.listen(PORT, () => {
  console.log(`🚀 ExpenseAI Feature Demo running on http://localhost:${PORT}`)
  console.log(`📱 Features: PDF Upload, Charts, Goals, Transaction Review`)
  console.log(`✨ All components working with interactive demos`)
})
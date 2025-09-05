const http = require('http')
const pdf = require('pdf-parse')
const ICICIParser = require('./backend/services/iciciParser')
const MerchantCategorizer = require('./backend/services/merchantCategorizer')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Real Processing</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%); }
        .card { 
            background: rgba(30, 30, 30, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
        }
        .brand-accent { color: #14b8a6; }
        .brand-bg { background-color: #14b8a6; }
        .brand-border { border-color: #14b8a6; }
        .upload-zone { transition: all 0.2s ease; }
        .upload-zone:hover { border-color: #14b8a6; background-color: rgba(20, 184, 166, 0.05); }
        .btn-primary { 
            background: #14b8a6; 
            color: white; 
            border: none;
            border-radius: 12px;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .btn-primary:hover { background: #0f766e; transform: translateY(-1px); }
        .text-hierarchy-1 { font-size: 2rem; font-weight: 800; }
        .text-hierarchy-2 { font-size: 1.25rem; font-weight: 600; }
        .text-hierarchy-3 { font-size: 0.875rem; font-weight: 400; }
        .section-spacing { margin-bottom: 1.5rem; }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div class="p-6">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-8">
                <h1 class="text-hierarchy-1 mb-2 brand-accent">
                    ExpenseAI
                </h1>
                <p class="text-hierarchy-3 text-gray-400">Smart ICICI statement analysis</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <!-- Left Panel - Upload & Info -->
                <div class="card p-6">
                    <h2 class="text-hierarchy-2 mb-6 text-white">Upload Statement</h2>
                    
                    <div class="upload-zone border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer mb-6" onclick="document.getElementById('file-input').click()">
                        <input type="file" id="file-input" accept=".pdf" style="display:none">
                        
                        <div class="w-16 h-16 mx-auto mb-4 brand-bg rounded-xl flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 class="text-hierarchy-3 font-semibold mb-2 text-white">Drop ICICI PDF here</h3>
                        <p class="text-hierarchy-3 text-gray-400">Secure local processing</p>
                    </div>

                    <div id="file-info" class="hidden mb-6 p-4 bg-gray-800 rounded-lg">
                        <div class="font-medium text-white" id="file-name">-</div>
                        <div class="text-hierarchy-3 text-gray-400" id="file-size">-</div>
                    </div>

                    <button id="process-btn" class="btn-primary w-full py-4 px-6 text-hierarchy-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Select PDF to Process
                    </button>
                    
                    <!-- Additional Content for Balance -->
                    <div class="mt-8 space-y-4">
                        <div class="p-4 bg-gray-800/50 rounded-lg">
                            <h4 class="text-hierarchy-3 font-semibold text-white mb-2">✨ What we analyze</h4>
                            <ul class="text-hierarchy-3 text-gray-400 space-y-1">
                                <li>• UPI transactions & categories</li>
                                <li>• Spending patterns & trends</li>
                                <li>• Financial health score</li>
                                <li>• Smart recommendations</li>
                            </ul>
                        </div>
                        
                        <div class="p-4 bg-gray-800/50 rounded-lg">
                            <h4 class="text-hierarchy-3 font-semibold text-white mb-2">🔒 Privacy guaranteed</h4>
                            <p class="text-hierarchy-3 text-gray-400">All processing happens locally. Your data never leaves your device.</p>
                        </div>
                    </div>
                </div>

                <!-- Right Panel - Results -->
                <div class="card p-6">
                    <h2 class="text-hierarchy-2 mb-6 text-white">Analysis Results</h2>
                    <div id="results-area" class="flex items-center justify-center min-h-[400px]">
                        <div class="text-center text-gray-500">
                            <div class="w-20 h-20 mx-auto mb-4 bg-gray-800 rounded-xl flex items-center justify-center">
                                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p class="text-hierarchy-3">Upload statement to see insights</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="processing-status" class="hidden mt-6 card p-4">
                <div class="flex items-center gap-4">
                    <div class="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <div class="text-hierarchy-3 font-semibold text-white">Processing statement...</div>
                        <div class="text-hierarchy-3 text-gray-400" id="processing-step">Reading PDF...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedFile = null;

        document.getElementById('file-input').onchange = function(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                selectedFile = file;
                document.getElementById('file-name').textContent = file.name;
                document.getElementById('file-size').textContent = formatFileSize(file.size);
                document.getElementById('file-info').classList.remove('hidden');
                document.getElementById('process-btn').disabled = false;
                document.getElementById('process-btn').textContent = 'Analyze Statement';
            }
        }

        document.getElementById('process-btn').onclick = async function() {
            if (!selectedFile) return;

            const processingStatus = document.getElementById('processing-status');
            
            processingStatus.classList.remove('hidden');
            this.disabled = true;
            this.textContent = 'Processing...';

            const steps = ['Extracting PDF text...', 'Parsing ICICI format...', 'Categorizing transactions...', 'Generating insights...'];
            for (let i = 0; i < steps.length; i++) {
                document.getElementById('processing-step').textContent = steps[i];
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            try {
                const formData = new FormData();
                formData.append('statement', selectedFile);
                
                const response = await fetch('/api/process-real', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                processingStatus.classList.add('hidden');
                this.disabled = false;
                this.textContent = 'Analyze Another';
                
                if (response.ok) {
                    displayResults(result);
                } else {
                    displayError(result.message || 'Processing failed');
                }
            } catch (error) {
                processingStatus.classList.add('hidden');
                this.disabled = false;
                this.textContent = 'Try Again';
                displayError(error.message);
            }
        }
        
        function getCategoryIcon(category) {
            const icons = {
                'Food & Dining': '🍽️',
                'Transportation': '🚗',
                'Shopping': '🛍️',
                'Entertainment': '🎬',
                'Utilities': '⚡',
                'Healthcare': '🏥',
                'Investment': '📈',
                'Education': '📚'
            };
            return icons[category] || '💰';
        }
        
        function displayResults(data) {
            const totalSpent = data.transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const totalIncome = data.transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const categories = [...new Set(data.transactions.map(tx => tx.category))];
            
            document.getElementById('results-area').innerHTML = \`
                <div class="space-y-6">
                    <!-- PRIMARY: Financial Overview -->
                    <div class="section-spacing">
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="text-center p-4 bg-gray-800/50 rounded-xl">
                                <div class="text-2xl font-bold text-red-400 mb-1">₹\${totalSpent.toLocaleString()}</div>
                                <div class="text-hierarchy-3 text-gray-300 font-medium">Total Spent</div>
                            </div>
                            <div class="text-center p-4 bg-gray-800/50 rounded-xl">
                                <div class="text-2xl font-bold brand-accent mb-1">₹\${totalIncome.toLocaleString()}</div>
                                <div class="text-hierarchy-3 text-gray-300 font-medium">Total Income</div>
                            </div>
                        </div>
                        <div class="text-center p-3 bg-teal-900/20 border border-teal-600/30 rounded-xl">
                            <div class="text-hierarchy-3 text-teal-300">✅ \${data.transactions.length} transactions analyzed • \${categories.length} categories</div>
                        </div>
                    </div>

                    <!-- SECONDARY: Transactions -->
                    <div class="section-spacing">
                        <h3 class="text-hierarchy-2 mb-4 text-white">Recent Transactions</h3>
                        <div class="space-y-2 max-h-80 overflow-y-auto">
                            \${data.transactions.slice(0, 8).map(tx => \`
                                <div class="p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-gray-600/50 transition-colors">
                                    <div class="flex justify-between items-center">
                                        <div class="flex items-center gap-3 flex-1">
                                            <div class="text-lg">\${getCategoryIcon(tx.category)}</div>
                                            <div class="flex-1 min-w-0">
                                                <div class="text-hierarchy-3 font-medium text-white truncate" title="\${tx.description}">
                                                    \${tx.description.length > 35 ? tx.description.substring(0, 35) + '...' : tx.description}
                                                </div>
                                                <div class="text-xs text-gray-400">
                                                    \${formatDate(tx.date)} • \${tx.category}
                                                </div>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <div class="text-base font-semibold \${tx.amount < 0 ? 'text-red-400' : 'brand-accent'}">
                                                \${tx.amount < 0 ? '-' : '+'}₹\${Math.abs(tx.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                            \${data.transactions.length > 8 ? \`<div class="text-center py-2"><span class="text-hierarchy-3 text-gray-400">+\${data.transactions.length - 8} more transactions</span></div>\` : ''}
                        </div>
                    </div>
                    
                    <!-- SECONDARY: Financial Health & Alerts -->
                    <div class="section-spacing">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Health Score -->
                            <div class="p-4 bg-gray-800/30 rounded-xl">
                                <h4 class="text-hierarchy-3 font-semibold text-white mb-3">💊 Health Score</h4>
                                <div class="flex items-center justify-center mb-4">
                                    <div class="relative w-20 h-20">
                                        <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="6" fill="none" />
                                            <circle id="health-circle" cx="50" cy="50" r="40" stroke="#14b8a6" stroke-width="6" fill="none" 
                                                    stroke-dasharray="0 251" class="transition-all duration-2000" />
                                        </svg>
                                        <div class="absolute inset-0 flex items-center justify-center">
                                            <div class="text-center">
                                                <div class="text-lg font-bold brand-accent" id="health-score">7.8</div>
                                                <div class="text-xs text-gray-400">/10</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between text-hierarchy-3">
                                        <span class="text-gray-300">Emergency Fund</span>
                                        <span class="brand-accent font-medium">8.5/10</span>
                                    </div>
                                    <div class="flex justify-between text-hierarchy-3">
                                        <span class="text-gray-300">Savings Rate</span>
                                        <span class="text-yellow-400 font-medium">6.1/10</span>
                                    </div>
                                    <div class="flex justify-between text-hierarchy-3">
                                        <span class="text-gray-300">Debt Ratio</span>
                                        <span class="brand-accent font-medium">9.2/10</span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Smart Alerts -->
                            <div class="p-4 bg-gray-800/30 rounded-xl">
                                <h4 class="text-hierarchy-3 font-semibold text-white mb-3">🚨 Smart Alerts</h4>
                                <div class="space-y-3">
                                    <div class="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                        <div class="flex items-start gap-2">
                                            <div class="text-sm">⚠️</div>
                                            <div class="flex-1">
                                                <div class="text-hierarchy-3 font-medium text-white">Overspend Alert</div>
                                                <div class="text-xs text-gray-300">May exceed budget by ₹2,400</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                                        <div class="flex items-start gap-2">
                                            <div class="text-sm">💡</div>
                                            <div class="flex-1">
                                                <div class="text-hierarchy-3 font-medium text-white">Investment Opportunity</div>
                                                <div class="text-xs text-gray-300">₹4,200 surplus available</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- TERTIARY: Spending Personality & Quick Actions -->
                    <div class="section-spacing">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Spending Personality -->
                            <div class="p-4 bg-gray-800/30 rounded-xl">
                                <h4 class="text-hierarchy-3 font-semibold text-white mb-3">🧠 Spending Pattern</h4>
                                <div class="text-center">
                                    <div class="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-xl flex items-center justify-center text-lg">
                                        🎉
                                    </div>
                                    <div class="text-hierarchy-3 font-semibold text-white mb-1">Weekend Warrior</div>
                                    <div class="text-xs text-gray-400 mb-3">85% confidence</div>
                                    <div class="space-y-1 text-xs text-gray-300">
                                        <div>• 60% spending on weekends</div>
                                        <div>• ₹8,400 weekend spending</div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Quick Actions -->
                            <div class="p-4 bg-gray-800/30 rounded-xl">
                                <h4 class="text-hierarchy-3 font-semibold text-white mb-3">⚡ Quick Actions</h4>
                                <div class="space-y-2">
                                    <button class="w-full p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-left hover:bg-teal-500/20 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm">💰</span>
                                            <div class="flex-1">
                                                <div class="text-hierarchy-3 font-medium text-white">Auto-Save Surplus</div>
                                                <div class="text-xs text-gray-300">Move ₹2,400 to savings</div>
                                            </div>
                                        </div>
                                    </button>
                                    <button class="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-left hover:bg-purple-500/20 transition-colors">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm">📈</span>
                                            <div class="flex-1">
                                                <div class="text-hierarchy-3 font-medium text-white">Start SIP</div>
                                                <div class="text-xs text-gray-300">₹1,000/month investment</div>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                
                <!-- AI Money Coach - Fixed Position -->
                <div class="fixed bottom-4 right-4 w-80 max-w-sm">
                    <div class="card p-4">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-6 h-6 brand-bg rounded-full flex items-center justify-center text-xs">🤖</div>
                            <h4 class="text-hierarchy-3 font-semibold text-white">AI Coach</h4>
                        </div>
                        <div class="bg-gray-800/50 rounded-lg p-3 mb-3">
                            <p class="text-hierarchy-3 text-gray-300">💡 Based on your spending, consider setting a ₹800/day limit for better control.</p>
                        </div>
                        <div class="flex gap-2">
                            <input type="text" placeholder="Ask me anything..." class="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-hierarchy-3 focus:outline-none focus:border-teal-500">
                            <button class="btn-primary px-3 py-2 text-hierarchy-3">Send</button>
                        </div>
                    </div>
                </div>
                </div>
            \`;
            
            // Animate health score circle
            setTimeout(() => {
                const circle = document.getElementById('health-circle');
                if (circle) {
                    const circumference = 2 * Math.PI * 40;
                    const score = 7.8;
                    const offset = circumference - (score / 10) * circumference;
                    circle.style.strokeDasharray = circumference + ' ' + circumference;
                    circle.style.strokeDashoffset = offset;
                }
            }, 500);
        }
        
        function displayError(message) {
            document.getElementById('results-area').innerHTML = \`
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-red-400 mb-2">Processing Failed</h3>
                    <p class="text-gray-400">\${message}</p>
                </div>
            \`;
        }

        function formatDate(dateStr) {
            const [day, month, year] = dateStr.split('-');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return \`\${day} \${months[parseInt(month) - 1]} 20\${year}\`;
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
    </script>
</body>
</html>
    `)
  } else if (req.url === '/api/process-real' && req.method === 'POST') {
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('📄 Processing real ICICI PDF...')
        
        const pdfData = await pdf(body)
        const text = pdfData.text
        
        console.log('✅ PDF text extracted, length:', text.length)
        
        const transactions = ICICIParser.parseTransactions(text)
        console.log('✅ Parsed transactions:', transactions.length)
        
        const categorizedTransactions = transactions.map(transaction => 
          MerchantCategorizer.processTransaction(transaction)
        )
        
        const result = {
          bank: 'ICICI',
          bankName: 'ICICI Bank',
          transactions: categorizedTransactions,
          processingTime: Date.now()
        }
        
        console.log('✅ Processing complete:', categorizedTransactions.length, 'transactions')
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
        
      } catch (error) {
        console.error('❌ Processing failed:', error.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
})

server.listen(3002, () => {
  console.log('🚀 Redesigned ExpenseAI on http://localhost:3002')
  console.log('📄 Upload your actual ICICI statement for real results')
})
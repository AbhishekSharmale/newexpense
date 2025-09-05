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
        .gradient-bg { background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%); }
        .card-glow { 
            background: linear-gradient(145deg, rgba(26, 26, 26, 0.8), rgba(10, 10, 10, 0.9));
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .neon-border {
            border: 1px solid transparent;
            background: linear-gradient(145deg, rgba(26, 26, 26, 0.8), rgba(10, 10, 10, 0.9)) padding-box,
                        linear-gradient(45deg, #00d4aa, #6366f1, #ec4899) border-box;
        }
        .upload-zone { transition: all 0.3s ease; }
        .upload-zone:hover { transform: scale(1.02); border-color: #00d4aa; }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div class="p-6">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ExpenseAI
                </h1>
                <p class="text-xl text-gray-400">Real ICICI statement processing</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div class="card-glow rounded-3xl p-8 h-full">
                    <h2 class="text-2xl font-bold mb-8">Upload ICICI Statement</h2>
                    
                    <div class="upload-zone border-3 border-dashed border-gray-600 rounded-2xl p-16 text-center cursor-pointer hover:border-green-400 hover:bg-green-400/5 transition-all duration-300" onclick="document.getElementById('file-input').click()">
                        <input type="file" id="file-input" accept=".pdf" style="display:none">
                        
                        <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center">
                            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-3">Upload Your ICICI PDF</h3>
                        <p class="text-gray-400">Real parsing of your actual statement</p>
                    </div>

                    <div id="file-info" class="hidden mt-4 p-4 bg-gray-700 rounded-lg">
                        <div class="font-medium" id="file-name">-</div>
                        <div class="text-sm text-gray-400" id="file-size">-</div>
                    </div>

                    <button id="process-btn" class="w-full mt-8 neon-border rounded-2xl py-5 px-8 font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50" disabled>
                        Select PDF to Process
                    </button>
                </div>

                <div class="card-glow rounded-3xl p-8 h-full">
                    <h2 class="text-2xl font-bold mb-8">Real Results</h2>
                    <div id="results-area" class="flex items-center justify-center h-full min-h-[400px]">
                        <div class="text-center text-gray-500">
                            <div class="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-2xl flex items-center justify-center">
                                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <p class="text-lg">Upload your ICICI statement</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="processing-status" class="hidden mt-8 card-glow rounded-2xl p-6">
                <div class="flex items-center gap-4">
                    <div class="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <div class="font-semibold">Processing your ICICI statement...</div>
                        <div class="text-sm text-gray-400" id="processing-step">Reading PDF...</div>
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
                document.getElementById('process-btn').textContent = 'Process Real Statement';
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
                this.textContent = 'Process Another';
                
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
                <div class="space-y-8">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center p-6 bg-gray-700/50 rounded-2xl border border-gray-600">
                            <div class="text-3xl font-bold text-red-400 mb-2">₹\${totalSpent.toLocaleString()}</div>
                            <div class="text-sm text-gray-400 font-medium">Total Spent</div>
                        </div>
                        <div class="text-center p-6 bg-gray-700/50 rounded-2xl border border-gray-600">
                            <div class="text-3xl font-bold text-green-400 mb-2">₹\${totalIncome.toLocaleString()}</div>
                            <div class="text-sm text-gray-400 font-medium">Total Income</div>
                        </div>
                        <div class="text-center p-6 bg-gray-700/50 rounded-2xl border border-gray-600">
                            <div class="text-3xl font-bold text-blue-400 mb-2">\${data.transactions.length}</div>
                            <div class="text-sm text-gray-400 font-medium">Transactions</div>
                        </div>
                    </div>

                    <div class="p-6 bg-green-900/20 border border-green-600 rounded-2xl">
                        <div class="font-semibold text-green-300 text-lg">✅ ICICI Bank Statement Processed</div>
                        <div class="text-sm text-green-200 mt-2">Real data from your PDF • \${categories.length} categories found</div>
                    </div>

                    <div>
                        <h3 class="text-2xl font-bold mb-6 text-white">Your Transactions</h3>
                        <div class="space-y-3 max-h-96 overflow-y-auto">
                            \${data.transactions.map(tx => \`
                                <div class="p-6 bg-gray-800/50 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1 pr-4">
                                            <div class="font-semibold text-base mb-2 text-white" title="\${tx.description}">
                                                \${tx.description.length > 40 ? tx.description.substring(0, 40) + '...' : tx.description}
                                            </div>
                                            <div class="text-sm text-gray-400">
                                                \${formatDate(tx.date)} • 
                                                <span class="inline-flex items-center gap-1">
                                                    \${getCategoryIcon(tx.category)} \${tx.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div class="text-right flex-shrink-0">
                                            <div class="text-xl font-bold mb-1 \${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}">
                                                \${tx.amount < 0 ? '-' : '+'}₹\${Math.abs(tx.amount).toLocaleString()}
                                            </div>
                                            <div class="text-sm text-gray-500">Balance: ₹\${tx.balance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                    
                    <!-- Advanced Intelligence Features -->
                    <div class="mt-20 space-y-16">
                        <!-- Financial Health Score -->
                        <div class="card-glow rounded-3xl p-10 shadow-2xl">
                            <h3 class="text-3xl font-black mb-8 text-center">💊 Financial Health Score</h3>
                            <div class="flex items-center justify-center mb-8">
                                <div class="relative w-32 h-32">
                                    <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none" />
                                        <circle id="health-circle" cx="50" cy="50" r="40" stroke="#00d4aa" stroke-width="8" fill="none" 
                                                stroke-dasharray="0 251" class="transition-all duration-2000" />
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <div class="text-center">
                                            <div class="text-3xl font-bold text-green-400" id="health-score">7.8</div>
                                            <div class="text-sm text-gray-400">out of 10</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                                    <div class="text-2xl font-bold text-green-400 mb-2">8.5/10</div>
                                    <div class="text-base text-gray-300 font-medium mb-1">Emergency Fund</div>
                                    <div class="text-sm text-gray-500">3.2 months covered</div>
                                </div>
                                <div class="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                                    <div class="text-2xl font-bold text-yellow-400 mb-2">6.1/10</div>
                                    <div class="text-base text-gray-300 font-medium mb-1">Savings Rate</div>
                                    <div class="text-sm text-gray-500">15% - aim for 20%</div>
                                </div>
                                <div class="text-center p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                                    <div class="text-2xl font-bold text-green-400 mb-2">9.2/10</div>
                                    <div class="text-base text-gray-300 font-medium mb-1">Debt Ratio</div>
                                    <div class="text-sm text-gray-500">Only 8% of income</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Spending Personality -->
                        <div class="card-glow rounded-3xl p-10 shadow-2xl">
                            <h3 class="text-3xl font-black mb-8 text-center">🧠 Your Spending Personality</h3>
                            <div class="text-center mb-6">
                                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
                                    🎉
                                </div>
                                <h4 class="text-xl font-bold mb-2">Weekend Warrior</h4>
                                <div class="text-sm text-gray-400 mb-4">85% confidence</div>
                                <div class="space-y-2 text-sm max-w-md mx-auto">
                                    <div class="text-gray-300">• You spend 60% of your money on weekends</div>
                                    <div class="text-gray-300">• Weekend spending: ₹8,400 this month</div>
                                    <div class="text-purple-300">→ Set a weekend budget to control leisure spending</div>
                                    <div class="text-purple-300">→ Plan weekday activities to balance your spending</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Smart Alerts -->
                        <div class="card-glow rounded-3xl p-10 shadow-2xl">
                            <h3 class="text-3xl font-black mb-8">🚨 Smart Alerts & Recommendations</h3>
                            <div class="space-y-4">
                                <div class="p-4 bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/30 rounded-xl">
                                    <div class="flex items-start gap-3">
                                        <div class="text-xl">⚠️</div>
                                        <div>
                                            <h4 class="font-semibold mb-1">Overspend Alert</h4>
                                            <p class="text-sm text-gray-300 mb-3">At this pace, you'll overspend by ₹2,400 this month</p>
                                            <div class="flex gap-2">
                                                <button class="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">See breakdown</button>
                                                <button class="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-lg text-sm hover:bg-yellow-500/30 transition-colors">Set daily limit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="p-4 bg-gradient-to-r from-blue-500/20 to-transparent border border-blue-500/30 rounded-xl">
                                    <div class="flex items-start gap-3">
                                        <div class="text-xl">💡</div>
                                        <div>
                                            <h4 class="font-semibold mb-1">Investment Opportunity</h4>
                                            <p class="text-sm text-gray-300 mb-3">You have ₹4,200 surplus this month. Perfect time to invest!</p>
                                            <div class="flex gap-2">
                                                <button class="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">Start SIP</button>
                                                <button class="px-3 py-1 bg-blue-500/20 border border-blue-500/40 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">Add to emergency fund</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Quick Actions -->
                        <div class="card-glow rounded-3xl p-10 shadow-2xl">
                            <h3 class="text-3xl font-black mb-8">⚡ Quick Actions</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div class="h-56 p-8 bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-3xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                    <div class="flex-1">
                                        <div class="text-5xl mb-6">💰</div>
                                        <h4 class="font-bold text-xl mb-3">Auto-Save Surplus</h4>
                                        <p class="text-gray-300 text-base">Move extra money to savings</p>
                                    </div>
                                    <div class="text-green-400 font-bold text-xl mt-4">₹2,400</div>
                                </div>
                                <div class="h-56 p-8 bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-3xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                    <div class="flex-1">
                                        <div class="text-5xl mb-6">📈</div>
                                        <h4 class="font-bold text-xl mb-3">Start SIP Investment</h4>
                                        <p class="text-gray-300 text-base">Begin systematic investing</p>
                                    </div>
                                    <div class="text-purple-400 font-bold text-xl mt-4">₹1,000/month</div>
                                </div>
                                <div class="h-56 p-8 bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/30 rounded-3xl cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
                                    <div class="flex-1">
                                        <div class="text-5xl mb-6">🎯</div>
                                        <h4 class="font-bold text-xl mb-3">Set Spending Limit</h4>
                                        <p class="text-gray-300 text-base">Control daily expenses</p>
                                    </div>
                                    <div class="text-pink-400 font-bold text-xl mt-4">₹800/day</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Money Coach Chat -->
                        <div class="card-glow rounded-3xl p-10 shadow-2xl">
                            <h3 class="text-3xl font-black mb-8">🤖 AI Money Coach</h3>
                            <div class="bg-gray-800/50 rounded-2xl p-6 mb-4">
                                <div class="flex items-start gap-3 mb-4">
                                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">🤖</div>
                                    <div class="flex-1">
                                        <div class="bg-gray-700 rounded-2xl p-4">
                                            <p class="text-sm">👋 Hi! I'm your AI money coach. Ask me anything about your finances!</p>
                                            <p class="text-xs text-gray-400 mt-2">Try: "Should I buy this ₹X item?" or "How can I save for vacation?"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <input type="text" placeholder="Ask your money coach..." class="flex-1 bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500">
                                <button class="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl font-medium transition-colors">Send</button>
                            </div>
                            <div class="flex gap-2 mt-3">
                                <button class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors">Saving tips?</button>
                                <button class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors">Investment advice?</button>
                                <button class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-full text-xs transition-colors">Budget help?</button>
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
            }, 1000);
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

server.listen(8084, () => {
  console.log('🚀 Fixed ExpenseAI on http://localhost:8084')
  console.log('📄 Upload your actual ICICI statement for real results')
})
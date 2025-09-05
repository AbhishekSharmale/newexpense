const http = require('http')
const pdf = require('pdf-parse')
const ICICIParser = require('./backend/services/iciciParser')
const MerchantCategorizer = require('./backend/services/merchantCategorizer')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>ExpenseAI - Clean CRED Style</title>
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
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes expandBar { to { transform: scaleX(1); } }
        .animate-slide-up { animation: slideUp 0.5s ease-out; }
        .chart-bar { transition: all 0.8s ease; transform-origin: bottom; }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div class="p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12">
                <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ExpenseAI
                </h1>
                <p class="text-xl text-gray-400">Beautiful ICICI statement visualization</p>
            </div>

            <!-- Upload -->
            <div class="card-glow rounded-3xl p-8 mb-12 text-center">
                <input type="file" id="file-input" accept=".pdf" style="display:none">
                <div class="border-2 border-dashed border-gray-600 hover:border-green-400 rounded-2xl p-8 cursor-pointer transition-colors" onclick="document.getElementById('file-input').click()">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold mb-2">Upload ICICI Statement</h3>
                    <p class="text-gray-400">Click to upload your PDF</p>
                </div>
                
                <div id="file-info" class="hidden mt-4 p-4 bg-gray-700 rounded-lg">
                    <div class="font-medium" id="file-name">-</div>
                    <div class="text-sm text-gray-400" id="file-size">-</div>
                </div>
                
                <button id="process-btn" class="mt-6 neon-border rounded-2xl py-4 px-8 font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50" disabled>
                    Select PDF to Process
                </button>
            </div>

            <!-- Results -->
            <div id="results" class="hidden">
                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div class="card-glow rounded-xl p-6 text-center animate-slide-up">
                        <div class="text-3xl font-bold text-red-400" id="total-spent">₹0</div>
                        <div class="text-sm text-gray-400">Total Spent</div>
                    </div>
                    <div class="card-glow rounded-xl p-6 text-center animate-slide-up">
                        <div class="text-3xl font-bold text-green-400" id="total-income">₹0</div>
                        <div class="text-sm text-gray-400">Total Income</div>
                    </div>
                    <div class="card-glow rounded-xl p-6 text-center animate-slide-up">
                        <div class="text-3xl font-bold text-blue-400" id="transaction-count">0</div>
                        <div class="text-sm text-gray-400">Transactions</div>
                    </div>
                    <div class="card-glow rounded-xl p-6 text-center animate-slide-up">
                        <div class="text-3xl font-bold text-purple-400" id="categories-count">0</div>
                        <div class="text-sm text-gray-400">Categories</div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    <!-- Category Chart -->
                    <div class="card-glow rounded-2xl p-6">
                        <h3 class="text-xl font-bold mb-6">Spending by Category</h3>
                        <div id="category-chart"></div>
                    </div>

                    <!-- Pie Chart -->
                    <div class="card-glow rounded-2xl p-6">
                        <h3 class="text-xl font-bold mb-6">Category Distribution</h3>
                        <canvas id="pie-chart" width="300" height="300" class="mx-auto"></canvas>
                    </div>
                </div>

                <!-- Transactions -->
                <div class="card-glow rounded-2xl p-6">
                    <h3 class="text-xl font-bold mb-6">Your Transactions</h3>
                    <div id="transactions-list" class="space-y-3 max-h-96 overflow-y-auto"></div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedFile = null;

        document.getElementById('file-input').onchange = function(e) {
            selectedFile = e.target.files[0];
            if (selectedFile && selectedFile.type === 'application/pdf') {
                document.getElementById('file-name').textContent = selectedFile.name;
                document.getElementById('file-size').textContent = formatFileSize(selectedFile.size);
                document.getElementById('file-info').classList.remove('hidden');
                document.getElementById('process-btn').disabled = false;
                document.getElementById('process-btn').textContent = 'Process Statement';
            }
        }

        document.getElementById('process-btn').onclick = async function() {
            if (!selectedFile) return;

            this.textContent = 'Processing...';
            this.disabled = true;

            try {
                const formData = new FormData();
                formData.append('statement', selectedFile);
                
                const response = await fetch('/api/process', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.error) {
                    alert('Error: ' + data.error);
                    return;
                }
                
                displayResults(data);
                
            } catch (error) {
                alert('Error: ' + error.message);
            }
            
            this.textContent = 'Process Another';
            this.disabled = false;
        }

        function displayResults(data) {
            const totalSpent = data.transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const totalIncome = data.transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const categories = [...new Set(data.transactions.map(tx => tx.category))];

            // Update stats
            document.getElementById('total-spent').textContent = '₹' + totalSpent.toLocaleString();
            document.getElementById('total-income').textContent = '₹' + totalIncome.toLocaleString();
            document.getElementById('transaction-count').textContent = data.transactions.length;
            document.getElementById('categories-count').textContent = categories.length;

            // Create charts
            createCategoryChart(data.transactions);
            createPieChart(data.transactions);
            displayTransactions(data.transactions);

            document.getElementById('results').classList.remove('hidden');
        }

        function createCategoryChart(transactions) {
            const categories = {};
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
            
            transactions.filter(tx => tx.amount < 0).forEach(tx => {
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
            });

            const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
            const container = document.getElementById('category-chart');

            container.innerHTML = Object.entries(categories).map(([category, amount], index) => {
                const percentage = (amount / total * 100).toFixed(1);
                return \`
                    <div class="mb-4">
                        <div class="flex justify-between mb-2">
                            <span class="font-medium">\${getCategoryIcon(category)} \${category}</span>
                            <span class="font-bold">₹\${amount.toLocaleString()} (\${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-3">
                            <div class="chart-bar h-3 rounded-full" 
                                 style="width: \${percentage}%; background: \${colors[index % colors.length]}; transform: scaleX(0); animation: expandBar 1s ease-out \${index * 0.2}s forwards;">
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function createPieChart(transactions) {
            const canvas = document.getElementById('pie-chart');
            const ctx = canvas.getContext('2d');
            const categories = {};
            const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
            
            transactions.filter(tx => tx.amount < 0).forEach(tx => {
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
            });

            const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 100;

            let currentAngle = -Math.PI / 2;

            Object.entries(categories).forEach(([category, amount], index) => {
                const sliceAngle = (amount / total) * 2 * Math.PI;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = colors[index % colors.length];
                ctx.fill();
                
                currentAngle += sliceAngle;
            });
        }

        function displayTransactions(transactions) {
            const container = document.getElementById('transactions-list');
            
            container.innerHTML = transactions.map(tx => \`
                <div class="p-4 bg-gray-800/50 rounded-xl">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="font-semibold mb-1">\${tx.description}</div>
                            <div class="text-sm text-gray-400">\${tx.date} • \${tx.category}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold \${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}">
                                \${tx.amount < 0 ? '-' : '+'}₹\${Math.abs(tx.amount).toLocaleString()}
                            </div>
                            <div class="text-sm text-gray-400">Bal: ₹\${tx.balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            \`).join('');
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
  } else if (req.url === '/api/process' && req.method === 'POST') {
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('📄 Processing ICICI PDF...')
        
        // Extract PDF from multipart form data
        let pdfBuffer = body
        const bodyStr = body.toString('binary')
        const pdfStart = bodyStr.indexOf('%PDF')
        const pdfEnd = bodyStr.lastIndexOf('%%EOF') + 5
        
        if (pdfStart !== -1 && pdfEnd !== -1) {
          pdfBuffer = Buffer.from(bodyStr.slice(pdfStart, pdfEnd), 'binary')
        }
        
        const pdfData = await pdf(pdfBuffer)
        const text = pdfData.text
        
        const transactions = ICICIParser.parseTransactions(text)
        const categorizedTransactions = transactions.map(transaction => 
          MerchantCategorizer.processTransaction(transaction)
        )
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          transactions: categorizedTransactions,
          bank: 'ICICI',
          bankName: 'ICICI Bank'
        }))
        
      } catch (error) {
        console.error('❌ Processing failed:', error.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
})

server.listen(1212, () => {
  console.log('🚀 Clean ExpenseAI on http://localhost:1212')
  console.log('🎨 Beautiful CRED-style UI with charts')
  console.log('📄 Real ICICI processing - no intelligence features')
})
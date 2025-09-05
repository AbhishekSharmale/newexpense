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
    <title>ExpenseAI - ICICI Parser</title>
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
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <div class="p-6">
        <div class="max-w-6xl mx-auto">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    ExpenseAI
                </h1>
                <p class="text-xl text-gray-400">Real ICICI Bank statement processing</p>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div class="card-glow rounded-3xl p-8">
                    <h2 class="text-2xl font-bold mb-6">Upload ICICI Statement</h2>
                    
                    <div class="border-2 border-dashed border-gray-600 rounded-2xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors" onclick="document.getElementById('file-input').click()">
                        <input type="file" id="file-input" accept=".pdf" style="display:none">
                        
                        <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold mb-2">Upload Your ICICI PDF</h3>
                        <p class="text-gray-400">Real parsing of your actual statement</p>
                    </div>

                    <div id="file-info" class="hidden mt-4 p-4 bg-gray-700 rounded-lg">
                        <div class="font-medium" id="file-name">-</div>
                        <div class="text-sm text-gray-400" id="file-size">-</div>
                    </div>

                    <button id="process-btn" class="w-full mt-6 neon-border rounded-2xl py-4 px-6 font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50" disabled>
                        Select PDF to Process
                    </button>
                </div>

                <div class="card-glow rounded-3xl p-8">
                    <h2 class="text-2xl font-bold mb-6">Real Results</h2>
                    <div id="results-area">
                        <div class="text-center py-16 text-gray-500">
                            <div class="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-2xl flex items-center justify-center">
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
        
        function displayResults(data) {
            const totalSpent = data.transactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const totalIncome = data.transactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
            const categories = [...new Set(data.transactions.map(tx => tx.category))];
            
            document.getElementById('results-area').innerHTML = \`
                <div class="space-y-6">
                    <div class="grid grid-cols-3 gap-4">
                        <div class="text-center p-4 bg-gray-700 rounded-lg">
                            <div class="text-xl font-bold text-red-400">₹\${totalSpent.toLocaleString()}</div>
                            <div class="text-sm text-gray-400">Total Spent</div>
                        </div>
                        <div class="text-center p-4 bg-gray-700 rounded-lg">
                            <div class="text-xl font-bold text-green-400">₹\${totalIncome.toLocaleString()}</div>
                            <div class="text-sm text-gray-400">Total Income</div>
                        </div>
                        <div class="text-center p-4 bg-gray-700 rounded-lg">
                            <div class="text-xl font-bold text-blue-400">\${data.transactions.length}</div>
                            <div class="text-sm text-gray-400">Transactions</div>
                        </div>
                    </div>

                    <div class="p-4 bg-green-900/20 border border-green-600 rounded-lg">
                        <div class="font-semibold text-green-300">✅ ICICI Bank Statement Processed</div>
                        <div class="text-sm text-green-200 mt-1">Real data from your PDF • \${categories.length} categories found</div>
                    </div>

                    <div>
                        <h3 class="font-semibold mb-3">Your Transactions</h3>
                        <div class="space-y-2 max-h-96 overflow-y-auto">
                            \${data.transactions.map(tx => \`
                                <div class="p-3 bg-gray-700 rounded-lg">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <div class="font-medium text-sm">\${tx.description}</div>
                                            <div class="text-xs text-gray-400">\${tx.date} • \${tx.category}</div>
                                        </div>
                                        <div class="text-right">
                                            <div class="font-semibold \${tx.amount < 0 ? 'text-red-400' : 'text-green-400'}">
                                                \${tx.amount < 0 ? '-' : '+'}₹\${Math.abs(tx.amount).toLocaleString()}
                                            </div>
                                            <div class="text-xs text-gray-400">Bal: ₹\${tx.balance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>
            \`;
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
        
        // Extract text from PDF
        const pdfData = await pdf(body)
        const text = pdfData.text
        
        console.log('✅ PDF text extracted, length:', text.length)
        
        // Parse with ICICI parser
        const transactions = ICICIParser.parseTransactions(text)
        console.log('✅ Parsed transactions:', transactions.length)
        
        // Categorize each transaction
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

server.listen(2222, () => {
  console.log('🚀 Real ICICI Processing on http://localhost:2222')
  console.log('📄 Upload your actual ICICI statement for real results')
})
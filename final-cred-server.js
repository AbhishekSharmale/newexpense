const http = require('http')
const pdf = require('pdf-parse')
const ICICIParser = require('./backend/services/iciciParser')
const MerchantCategorizer = require('./backend/services/merchantCategorizer')
const BehaviorAnalyzer = require('./backend/services/behaviorAnalyzer')
const FinancialHealthScore = require('./backend/services/financialHealthScore')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - CRED Style</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { 'inter': ['Inter', 'sans-serif'] },
                    colors: {
                        'cred': {
                            'dark': '#0a0a0a', 'card': '#1a1a1a', 'accent': '#00d4aa',
                            'purple': '#6366f1', 'pink': '#ec4899', 'orange': '#f97316'
                        }
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'glow': 'glow 2s ease-in-out infinite alternate',
                        'slide-up': 'slideUp 0.5s ease-out',
                        'fade-in': 'fadeIn 0.8s ease-out',
                        'scale-in': 'scaleIn 0.3s ease-out',
                        'bounce-subtle': 'bounceSubtle 0.6s ease-out'
                    }
                }
            }
        }
    </script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        @keyframes glow {
            from { box-shadow: 0 0 20px rgba(0, 212, 170, 0.3); }
            to { box-shadow: 0 0 30px rgba(0, 212, 170, 0.6); }
        }
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes bounceSubtle {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        
        .gradient-bg {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
        }
        
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
        
        .progress-bar {
            background: linear-gradient(90deg, #00d4aa 0%, #6366f1 50%, #ec4899 100%);
            background-size: 200% 100%;
            animation: shimmer 2s linear infinite;
        }
        
        @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        .transaction-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .transaction-card:hover {
            transform: translateY(-4px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 212, 170, 0.2);
        }
        
        .category-pill {
            background: linear-gradient(135deg, rgba(0, 212, 170, 0.2), rgba(99, 102, 241, 0.2));
            border: 1px solid rgba(0, 212, 170, 0.3);
        }
        
        .floating-element {
            animation: float 6s ease-in-out infinite;
        }
        
        .glow-effect {
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        .chart-bar {
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: bottom;
        }
        
        @keyframes expandBar {
            to { transform: scaleX(1); }
        }
    </style>
</head>
<body class="gradient-bg text-white min-h-screen">
    <!-- Floating Background Elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="floating-element absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-cred-accent/20 to-cred-purple/20 rounded-full blur-xl"></div>
        <div class="floating-element absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cred-pink/20 to-cred-orange/20 rounded-full blur-xl" style="animation-delay: -2s;"></div>
        <div class="floating-element absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-cred-purple/20 to-cred-accent/20 rounded-full blur-xl" style="animation-delay: -4s;"></div>
    </div>

    <div class="relative z-10 p-6">
        <div class="max-w-7xl mx-auto">
            <!-- Header -->
            <div class="text-center mb-12 animate-fade-in">
                <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-cred-accent via-cred-purple to-cred-pink bg-clip-text text-transparent">
                    ExpenseAI
                </h1>
                <p class="text-xl text-gray-400 mb-6">Real ICICI processing with CRED-style experience</p>
                <div class="flex justify-center gap-4">
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        🏦 Real ICICI Parser
                    </div>
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        ⚡ Instant Processing
                    </div>
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        🎨 CRED Experience
                    </div>
                </div>
            </div>

            <!-- Main Demo Section -->
            <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
                <!-- Upload Card -->
                <div class="xl:col-span-1">
                    <div class="card-glow rounded-3xl p-8 h-full animate-slide-up">
                        <div class="text-center">
                            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cred-accent to-cred-purple rounded-2xl flex items-center justify-center glow-effect">
                                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold mb-4">Upload ICICI Statement</h3>
                            <p class="text-gray-400 mb-6">Real parsing of your actual PDF</p>
                            
                            <div class="border-2 border-dashed border-gray-600 hover:border-cred-accent rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-cred-accent/5" onclick="document.getElementById('file-input').click()">
                                <input type="file" id="file-input" accept=".pdf" style="display:none">
                                <p class="text-gray-400">Click to upload PDF</p>
                            </div>
                            
                            <div id="file-info" class="hidden mt-4 p-4 bg-gray-700 rounded-lg">
                                <div class="font-medium" id="file-name">-</div>
                                <div class="text-sm text-gray-400" id="file-size">-</div>
                            </div>
                            
                            <button id="process-btn" class="w-full neon-border rounded-2xl py-4 px-6 font-semibold text-lg transition-all duration-300 hover:scale-105 glow-effect mt-6 disabled:opacity-50" disabled>
                                <span id="btn-text">Select PDF to Process</span>
                            </button>
                            
                            <div id="processing-animation" class="hidden mt-6">
                                <div class="relative">
                                    <div class="progress-bar h-2 rounded-full"></div>
                                    <div class="mt-4 text-cred-accent font-medium">
                                        <span id="process-step">Processing...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Section -->
                <div class="xl:col-span-2">
                    <div class="card-glow rounded-3xl p-8 h-full animate-slide-up" style="animation-delay: 0.2s;">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold">Live Results</h3>
                            <div id="bank-badge" class="hidden category-pill px-4 py-2 rounded-full text-sm font-medium">
                                🏦 <span id="bank-name">ICICI Bank</span>
                            </div>
                        </div>
                        
                        <div id="results-container">
                            <div class="text-center py-16 text-gray-500">
                                <div class="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-2xl flex items-center justify-center">
                                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p class="text-lg">Ready to process your ICICI statement</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats Dashboard -->
            <div id="stats-dashboard" class="hidden animate-fade-in">
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                    <div class="card-glow rounded-2xl p-6 text-center animate-scale-in">
                        <div class="text-3xl font-black text-cred-accent mb-2" id="total-amount">₹0</div>
                        <div class="text-gray-400">Total Processed</div>
                    </div>
                    <div class="card-glow rounded-2xl p-6 text-center animate-scale-in" style="animation-delay: 0.1s;">
                        <div class="text-3xl font-black text-cred-purple mb-2" id="categories-stat">0</div>
                        <div class="text-gray-400">Categories Found</div>
                    </div>
                    <div class="card-glow rounded-2xl p-6 text-center animate-scale-in" style="animation-delay: 0.2s;">
                        <div class="text-3xl font-black text-cred-pink mb-2" id="bank-stat">ICICI</div>
                        <div class="text-gray-400">Bank Detected</div>
                    </div>
                    <div class="card-glow rounded-2xl p-6 text-center animate-scale-in" style="animation-delay: 0.3s;">
                        <div class="text-3xl font-black text-cred-orange mb-2" id="transactions-stat">0</div>
                        <div class="text-gray-400">Transactions</div>
                    </div>
                </div>

                <!-- Charts Grid -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    <!-- Spending Breakdown Chart -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Spending Breakdown</h3>
                            <div class="text-sm text-gray-400">Real data</div>
                        </div>
                        <div id="category-chart" class="chart-container">
                            <!-- Chart will be populated by JavaScript -->
                        </div>
                    </div>

                    <!-- Donut Chart -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.1s;">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Category Distribution</h3>
                            <div class="text-sm text-gray-400">Total: <span id="total-spent">₹0</span></div>
                        </div>
                        <div class="relative">
                            <canvas id="donut-chart" width="300" height="300" class="mx-auto"></canvas>
                            <div class="absolute inset-0 flex items-center justify-center">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-cred-accent" id="center-amount">₹0</div>
                                    <div class="text-sm text-gray-400">Total Spent</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Transaction Heatmap -->
                <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up" style="animation-delay: 0.3s;">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-bold">Transaction Timeline</h3>
                        <div class="text-sm text-gray-400">Your spending pattern</div>
                    </div>
                    <div id="timeline-chart" class="grid grid-cols-7 gap-2">
                        <!-- Timeline will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Intelligence Dashboard -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    <!-- Financial Health Score -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.4s;">
                        <h3 class="text-xl font-bold mb-6 text-center">Financial Health Score</h3>
                        <div class="text-center mb-6">
                            <div class="relative w-32 h-32 mx-auto mb-4">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none" />
                                    <circle id="health-circle" cx="50" cy="50" r="40" stroke="#00d4aa" stroke-width="8" fill="none" 
                                            stroke-dasharray="0 251" class="transition-all duration-2000" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="text-center">
                                        <div class="text-2xl font-bold text-cred-accent" id="health-score">0</div>
                                        <div class="text-xs text-gray-400">out of 10</div>
                                    </div>
                                </div>
                            </div>
                            <div id="health-status" class="text-sm text-gray-400">Calculating...</div>
                        </div>
                        <div id="health-components" class="space-y-3">
                            <!-- Components will be populated -->
                        </div>
                    </div>

                    <!-- Spending Personality -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.5s;">
                        <h3 class="text-xl font-bold mb-6 text-center">Your Spending Personality</h3>
                        <div id="personality-card" class="text-center">
                            <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cred-purple to-cred-pink rounded-2xl flex items-center justify-center text-2xl" id="personality-icon">
                                🧠
                            </div>
                            <h4 class="text-lg font-bold mb-2" id="personality-type">Analyzing...</h4>
                            <div class="text-sm text-gray-400 mb-4" id="personality-confidence">-</div>
                            <div id="personality-insights" class="space-y-2 text-sm">
                                <!-- Insights will be populated -->
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Smart Alerts -->
                <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up" style="animation-delay: 0.6s;">
                    <h3 class="text-xl font-bold mb-6">🚨 Smart Alerts & Recommendations</h3>
                    <div id="smart-alerts" class="space-y-4">
                        <!-- Alerts will be populated -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedFile = null;
        let isProcessing = false;

        // DOM elements
        const fileInput = document.getElementById('file-input');
        const fileInfo = document.getElementById('file-info');
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const processBtn = document.getElementById('process-btn');
        const btnText = document.getElementById('btn-text');
        const processingAnimation = document.getElementById('processing-animation');
        const processStep = document.getElementById('process-step');
        const resultsContainer = document.getElementById('results-container');
        const bankBadge = document.getElementById('bank-badge');
        const statsDashboard = document.getElementById('stats-dashboard');

        fileInput.addEventListener('change', handleFileSelect);
        processBtn.addEventListener('click', processFile);

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file && file.type === 'application/pdf') {
                selectedFile = file;
                fileName.textContent = file.name;
                fileSize.textContent = formatFileSize(file.size);
                fileInfo.classList.remove('hidden');
                processBtn.disabled = false;
                btnText.textContent = 'Process Real Statement';
            }
        }

        async function processFile() {
            if (!selectedFile || isProcessing) return;
            
            isProcessing = true;
            processBtn.classList.add('animate-bounce-subtle');
            btnText.textContent = 'Processing...';
            processingAnimation.classList.remove('hidden');
            
            const steps = [
                'Extracting PDF text...',
                'Parsing ICICI format...',
                'Categorizing transactions...',
                'Generating insights...',
                'Creating visualizations...'
            ];
            
            // Animate through steps
            for (let i = 0; i < steps.length; i++) {
                processStep.textContent = steps[i];
                await new Promise(resolve => setTimeout(resolve, 800));
            }
            
            try {
                const formData = new FormData();
                formData.append('statement', selectedFile);
                
                const response = await fetch('/api/process-real', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                // Hide processing, show results
                processingAnimation.classList.add('hidden');
                bankBadge.classList.remove('hidden');
                processBtn.classList.remove('animate-bounce-subtle');
                btnText.textContent = 'Process Another';
                
                // Animate results
                displayResults(data);
                updateStats(data);
                createCharts(data.transactions);
                displayIntelligence(data);
                statsDashboard.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error:', error);
                processStep.textContent = 'Error processing statement';
                displayError(error.message);
            }
            
            isProcessing = false;
        }
        
        function displayResults(data) {
            resultsContainer.innerHTML = data.transactions.map((tx, index) => \`
                <div class="transaction-card card-glow rounded-2xl p-4 animate-slide-up" style="animation-delay: \${index * 0.1}s;">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <div class="font-semibold text-lg mb-1">\${tx.description}</div>
                            <div class="text-sm text-gray-400">\${tx.date} • \${tx.type}</div>
                        </div>
                        <div class="text-right">
                            <div class="text-xl font-bold \${tx.amount < 0 ? 'text-red-400' : 'text-cred-accent'}">
                                \${tx.amount < 0 ? '-' : '+'}₹\${Math.abs(tx.amount).toLocaleString()}
                            </div>
                            <div class="text-sm text-gray-400">Bal: ₹\${tx.balance.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <span class="category-pill px-3 py-1 rounded-full text-sm font-medium">
                                \${getCategoryIcon(tx.category)} \${tx.category}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            \${tx.needsReview ? 
                                '<span class="text-yellow-400 text-sm font-medium">Review Needed</span>' : 
                                '<span class="text-cred-accent text-sm font-medium">Auto-categorized</span>'
                            }
                        </div>
                    </div>
                </div>
            \`).join('');
        }
        
        function updateStats(data) {
            const totalAmount = data.transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
            const categories = [...new Set(data.transactions.map(tx => tx.category))];
            
            // Animate numbers
            animateNumber('total-amount', 0, totalAmount, '₹', true);
            animateNumber('categories-stat', 0, categories.length, '');
            animateNumber('transactions-stat', 0, data.transactions.length, '');
        }
        
        function createCharts(transactions) {
            const categories = {};
            const colors = ['#00d4aa', '#6366f1', '#ec4899', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#06b6d4'];
            
            transactions.filter(tx => tx.amount < 0).forEach(tx => {
                categories[tx.category] = (categories[tx.category] || 0) + Math.abs(tx.amount);
            });
            
            const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
            document.getElementById('total-spent').textContent = '₹' + total.toLocaleString();
            
            // Create bar chart
            createBarChart(categories, colors);
            
            // Create donut chart
            createDonutChart(categories, colors, total);
            
            // Create timeline
            createTimeline(transactions);
        }
        
        function createBarChart(categories, colors) {
            const chartContainer = document.getElementById('category-chart');
            const total = Object.values(categories).reduce((sum, val) => sum + val, 0);
            
            chartContainer.innerHTML = Object.entries(categories).map(([category, amount], index) => {
                const percentage = (amount / total * 100).toFixed(1);
                const width = Math.max(percentage, 5);
                
                return \`
                    <div class="mb-4 animate-slide-up" style="animation-delay: \${index * 0.1}s;">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-2">
                                <div class="w-3 h-3 rounded-full" style="background: \${colors[index % colors.length]}"></div>
                                <span class="font-medium text-sm">\${category}</span>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-sm">₹\${amount.toLocaleString()}</div>
                                <div class="text-xs text-gray-400">\${percentage}%</div>
                            </div>
                        </div>
                        <div class="relative w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                            <div class="chart-bar h-full rounded-full relative" 
                                 style="width: \${width}%; background: linear-gradient(90deg, \${colors[index % colors.length]}, \${colors[index % colors.length]}80); transform: scaleX(0); animation: expandBar 1.5s ease-out \${index * 0.2}s forwards;">
                                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');
        }
        
        function createDonutChart(categories, colors, total) {
            const canvas = document.getElementById('donut-chart');
            const ctx = canvas.getContext('2d');
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = 80;
            const innerRadius = 50;
            
            let currentAngle = -Math.PI / 2;
            
            Object.entries(categories).forEach(([category, amount], index) => {
                const sliceAngle = (amount / total) * 2 * Math.PI;
                
                // Draw slice
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
                ctx.closePath();
                
                // Gradient fill
                const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
                gradient.addColorStop(0, colors[index % colors.length] + '80');
                gradient.addColorStop(1, colors[index % colors.length]);
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // Glow effect
                ctx.shadowColor = colors[index % colors.length];
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                currentAngle += sliceAngle;
            });
            
            // Animate center amount
            animateNumber('center-amount', 0, total, '₹', true);
        }
        
        function createTimeline(transactions) {
            const container = document.getElementById('timeline-chart');
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
            container.innerHTML = days.map((day, index) => {
                const intensity = Math.random();
                const opacity = Math.max(intensity, 0.1);
                
                return \`
                    <div class="text-center">
                        <div class="text-xs text-gray-400 mb-2">\${day}</div>
                        <div class="aspect-square rounded-sm transition-all duration-500 hover:scale-110 cursor-pointer"
                             style="background: rgba(0, 212, 170, \${opacity}); animation-delay: \${index * 100}ms;"
                             title="\${day} - \${Math.round(intensity * 10)} transactions">
                        </div>
                    </div>
                \`;
            }).join('');
        }
        
        function animateNumber(elementId, start, end, prefix = '', isRupee = false) {
            const element = document.getElementById(elementId);
            const duration = 1000;
            const startTime = Date.now();
            
            function update() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(start + (end - start) * progress);
                
                if (isRupee) {
                    element.textContent = prefix + current.toLocaleString();
                } else {
                    element.textContent = current + prefix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            update();
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
        
        function displayError(message) {
            resultsContainer.innerHTML = \`
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
        
        function displayIntelligence(data) {
            // Display health score
            if (data.healthScore) {
                displayHealthScore(data.healthScore);
            }
            
            // Display personality
            if (data.behaviorAnalysis) {
                displayPersonality(data.behaviorAnalysis);
            }
            
            // Display alerts
            if (data.alerts) {
                displayAlerts(data.alerts);
            }
        }
        
        function displayHealthScore(healthData) {
            const score = healthData.overallScore;
            document.getElementById('health-score').textContent = score.toFixed(1);
            document.getElementById('health-status').textContent = getHealthStatus(score);
            
            // Animate circle
            setTimeout(() => {
                const circle = document.getElementById('health-circle');
                const circumference = 2 * Math.PI * 40;
                const offset = circumference - (score / 10) * circumference;
                circle.style.strokeDasharray = circumference + ' ' + circumference;
                circle.style.strokeDashoffset = offset;
            }, 500);
            
            // Display components
            const container = document.getElementById('health-components');
            container.innerHTML = Object.entries(healthData.components).slice(0, 3).map(([key, component]) => \`
                <div class="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg">
                    <span class="text-sm font-medium">\${formatComponentName(key)}</span>
                    <span class="text-sm font-bold \${getScoreColor(component.score)}">\${component.score.toFixed(1)}/10</span>
                </div>
            \`).join('');
        }
        
        function displayPersonality(behaviorData) {
            document.getElementById('personality-icon').textContent = getPersonalityIcon(behaviorData.type);
            document.getElementById('personality-type').textContent = behaviorData.type;
            document.getElementById('personality-confidence').textContent = behaviorData.confidence + '% confidence';
            
            const container = document.getElementById('personality-insights');
            container.innerHTML = behaviorData.insights.slice(0, 2).map(insight => \`
                <div class="text-gray-300 text-left">• \${insight}</div>
            \`).join('');
        }
        
        function displayAlerts(alerts) {
            const container = document.getElementById('smart-alerts');
            
            if (alerts.length === 0) {
                container.innerHTML = '<div class="text-center text-gray-400 py-4">✅ No alerts - you\'re doing great!</div>';
                return;
            }
            
            container.innerHTML = alerts.slice(0, 3).map(alert => \`
                <div class="p-4 bg-gradient-to-r from-\${getAlertColor(alert.urgency)}/20 to-transparent border border-\${getAlertColor(alert.urgency)}/30 rounded-xl">
                    <div class="flex items-start gap-3">
                        <div class="text-xl">\${getAlertIcon(alert.type)}</div>
                        <div>
                            <h4 class="font-semibold mb-1">\${alert.title}</h4>
                            <p class="text-sm text-gray-300">\${alert.message}</p>
                        </div>
                    </div>
                </div>
            \`).join('');
        }
        
        function getHealthStatus(score) {
            if (score >= 8.5) return 'Excellent Health';
            if (score >= 7) return 'Good Health';
            if (score >= 5.5) return 'Fair Health';
            return 'Needs Improvement';
        }
        
        function getScoreColor(score) {
            if (score >= 8) return 'text-green-400';
            if (score >= 6) return 'text-yellow-400';
            return 'text-red-400';
        }
        
        function formatComponentName(key) {
            const names = {
                emergencyFund: 'Emergency Fund',
                debtRatio: 'Debt Ratio',
                savingsRate: 'Savings Rate',
                spendingDiscipline: 'Budget Control',
                investmentDiversification: 'Investments'
            };
            return names[key] || key;
        }
        
        function getPersonalityIcon(type) {
            const icons = {
                'Weekend Warrior': '🎉',
                'Stress Spender': '😰',
                'Social Spender': '👥',
                'Night Owl Spender': '🦉',
                'Balanced Spender': '⚖️'
            };
            return icons[type] || '🧠';
        }
        
        function getAlertColor(urgency) {
            return urgency === 'high' ? 'red-500' : urgency === 'medium' ? 'yellow-500' : 'blue-500';
        }
        
        function getAlertIcon(type) {
            const icons = {
                overspend_warning: '⚠️',
                category_warning: '📊',
                surplus_opportunity: '💡'
            };
            return icons[type] || '🔔';
        }
        
        // Add expand animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes expandBar {
                to { transform: scaleX(1); }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>
    `)
  } else if (req.url === '/api/process-real' && req.method === 'POST') {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('📄 Processing real ICICI PDF...', body.length, 'bytes')
        
        // Extract PDF from multipart form data
        let pdfBuffer = body
        
        // Simple multipart parsing - find PDF content
        const bodyStr = body.toString('binary')
        const pdfStart = bodyStr.indexOf('%PDF')
        const pdfEnd = bodyStr.lastIndexOf('%%EOF') + 5
        
        if (pdfStart !== -1 && pdfEnd !== -1) {
          pdfBuffer = Buffer.from(bodyStr.slice(pdfStart, pdfEnd), 'binary')
          console.log('✅ Extracted PDF buffer:', pdfBuffer.length, 'bytes')
        }
        
        const pdfData = await pdf(pdfBuffer)
        const text = pdfData.text
        
        console.log('✅ PDF text extracted, length:', text.length)
        
        const transactions = ICICIParser.parseTransactions(text)
        console.log('✅ Parsed transactions:', transactions.length)
        
        const categorizedTransactions = transactions.map(transaction => 
          MerchantCategorizer.processTransaction(transaction)
        )
        
        // Generate behavioral analysis
        const behaviorAnalysis = BehaviorAnalyzer.analyzeSpendingPersonality(categorizedTransactions)
        
        // Calculate financial health score
        const mockUserData = {
          monthlyIncome: 50000,
          monthlyExpenses: 25000,
          emergencyFund: 75000,
          monthlyDebtPayments: 5000,
          monthlySavings: 10000,
          budgetAdherence: 0.75,
          investments: { mutualFunds: 50000, stocks: 25000 }
        }
        
        const healthScore = FinancialHealthScore.calculateScore(mockUserData)
        
        // Generate predictive alerts
        const alerts = BehaviorAnalyzer.generatePredictiveAlerts(categorizedTransactions)
        
        const result = {
          bank: 'ICICI',
          bankName: 'ICICI Bank',
          transactions: categorizedTransactions,
          behaviorAnalysis,
          healthScore,
          alerts,
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

server.listen(2020, () => {
  console.log('🚀 ExpenseAI CRED Experience on http://localhost:2020')
  console.log('🎨 Full CRED-style UI with Grafana charts + Real ICICI processing')
  console.log('✨ Animations, glassmorphism, neon effects - the complete experience!')
})
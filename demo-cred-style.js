const http = require('http')
const BankParsers = require('./backend/services/bankParsers')
const MerchantCategorizer = require('./backend/services/merchantCategorizer')

const PORT = 3009

const mockPDFText = `
HDFC BANK LIMITED
Statement of Account

Date        Description                     Amount      Dr/Cr
15/01/2024  UPI/PAYTM/ZOMATO/12345         340.00      Dr
16/01/2024  UPI/PHONEPE/UBER/67890         180.00      Dr  
17/01/2024  SALARY CREDIT TCS LTD          75000.00    Cr
18/01/2024  UPI/GPAY/AMAZON/54321          1250.00     Dr
19/01/2024  UPI/SWIGGY/FOOD/98765          420.00      Dr
20/01/2024  NEFT RENT PAYMENT              15000.00    Dr
21/01/2024  UPI/NETFLIX/SUBSCRIPTION       199.00      Dr
22/01/2024  UPI/JIO/RECHARGE               399.00      Dr
`

const htmlContent = `
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
                    fontFamily: {
                        'inter': ['Inter', 'sans-serif'],
                    },
                    colors: {
                        'cred': {
                            'dark': '#0a0a0a',
                            'card': '#1a1a1a',
                            'accent': '#00d4aa',
                            'purple': '#6366f1',
                            'pink': '#ec4899',
                            'orange': '#f97316'
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
        
        .confidence-high { color: #00d4aa; }
        .confidence-medium { color: #f59e0b; }
        .confidence-low { color: #ef4444; }
        
        .chart-container {
            position: relative;
            overflow: hidden;
        }
        
        .chart-bar {
            transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: bottom;
        }
        
        .floating-element {
            animation: float 6s ease-in-out infinite;
        }
        
        .glow-effect {
            animation: glow 2s ease-in-out infinite alternate;
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
                <p class="text-xl text-gray-400 mb-6">AI-powered expense tracking for Indian banking</p>
                <div class="flex justify-center gap-4">
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        🏦 Multi-Bank Support
                    </div>
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        ⚡ Instant Analysis
                    </div>
                    <div class="category-pill px-4 py-2 rounded-full text-sm font-medium">
                        🔒 100% Private
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
                            <h3 class="text-2xl font-bold mb-4">Process Statement</h3>
                            <p class="text-gray-400 mb-6">Upload your bank PDF and watch the magic happen</p>
                            
                            <button onclick="processDemo()" id="process-btn" class="w-full neon-border rounded-2xl py-4 px-6 font-semibold text-lg transition-all duration-300 hover:scale-105 glow-effect">
                                <span id="btn-text">Analyze HDFC Statement</span>
                            </button>
                            
                            <div id="processing-animation" class="hidden mt-6">
                                <div class="relative">
                                    <div class="progress-bar h-2 rounded-full"></div>
                                    <div class="mt-4 text-cred-accent font-medium">
                                        <span id="process-step">Parsing transactions...</span>
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
                                🏦 <span id="bank-name">HDFC Bank</span>
                            </div>
                        </div>
                        
                        <div id="results-container" class="space-y-4">
                            <div class="text-center py-16 text-gray-500">
                                <div class="w-24 h-24 mx-auto mb-4 bg-gray-800 rounded-2xl flex items-center justify-center">
                                    <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <p class="text-lg">Ready to process your statement</p>
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
                        <div class="text-3xl font-black text-cred-pink mb-2" id="bank-stat">-</div>
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
                            <div class="text-sm text-gray-400">Last 30 days</div>
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

                <!-- Time Series Charts -->
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
                    <!-- Daily Spending Trend -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.2s;">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Daily Spending Trend</h3>
                            <div class="flex gap-2">
                                <div class="w-3 h-3 bg-cred-accent rounded-full"></div>
                                <span class="text-sm text-gray-400">Expenses</span>
                            </div>
                        </div>
                        <canvas id="line-chart" width="400" height="200"></canvas>
                    </div>

                    <!-- Transaction Heatmap -->
                    <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.3s;">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-xl font-bold">Transaction Heatmap</h3>
                            <div class="text-sm text-gray-400">Activity by hour</div>
                        </div>
                        <div id="heatmap-chart" class="grid grid-cols-12 gap-1">
                            <!-- Heatmap will be populated by JavaScript -->
                        </div>
                        <div class="flex justify-between text-xs text-gray-500 mt-2">
                            <span>12 AM</span>
                            <span>6 AM</span>
                            <span>12 PM</span>
                            <span>6 PM</span>
                            <span>11 PM</span>
                        </div>
                    </div>
                </div>


            </div>

            <!-- Features Section -->
            <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.4s;">
                <h3 class="text-2xl font-bold mb-8 text-center">Why Choose ExpenseAI</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="text-center p-6 bg-gradient-to-b from-cred-accent/10 to-transparent rounded-2xl">
                        <div class="text-4xl mb-4">🏦</div>
                        <h4 class="font-bold mb-2">Multi-Bank Support</h4>
                        <p class="text-sm text-gray-400">Works with SBI, HDFC, ICICI, Axis & more</p>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-b from-cred-purple/10 to-transparent rounded-2xl">
                        <div class="text-4xl mb-4">⚡</div>
                        <h4 class="font-bold mb-2">Instant Processing</h4>
                        <p class="text-sm text-gray-400">Get results in milliseconds, not minutes</p>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-b from-cred-pink/10 to-transparent rounded-2xl">
                        <div class="text-4xl mb-4">🔒</div>
                        <h4 class="font-bold mb-2">100% Private</h4>
                        <p class="text-sm text-gray-400">Your data never leaves your device</p>
                    </div>
                    <div class="text-center p-6 bg-gradient-to-b from-cred-orange/10 to-transparent rounded-2xl">
                        <div class="text-4xl mb-4">🎯</div>
                        <h4 class="font-bold mb-2">Smart Categories</h4>
                        <p class="text-sm text-gray-400">Understands Indian spending patterns</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let isProcessing = false;

        async function processDemo() {
            if (isProcessing) return;
            
            isProcessing = true;
            const btn = document.getElementById('process-btn');
            const btnText = document.getElementById('btn-text');
            const processingAnimation = document.getElementById('processing-animation');
            const processStep = document.getElementById('process-step');
            const resultsContainer = document.getElementById('results-container');
            const bankBadge = document.getElementById('bank-badge');
            const statsDashboard = document.getElementById('stats-dashboard');
            
            // Start processing animation
            btn.classList.add('animate-bounce-subtle');
            btnText.textContent = 'Processing...';
            processingAnimation.classList.remove('hidden');
            
            const steps = [
                'Detecting bank format...',
                'Parsing transactions...',
                'Categorizing merchants...',
                'Calculating confidence...',
                'Generating insights...'
            ];
            
            // Animate through steps
            for (let i = 0; i < steps.length; i++) {
                processStep.textContent = steps[i];
                await new Promise(resolve => setTimeout(resolve, 600));
            }
            
            try {
                const response = await fetch('/api/process-demo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                // Hide processing, show results
                processingAnimation.classList.add('hidden');
                bankBadge.classList.remove('hidden');
                btn.classList.remove('animate-bounce-subtle');
                btnText.textContent = 'Process Again';
                
                // Animate results
                displayResults(data);
                updateStats(data);
                createCategoryChart(data.transactions);
                statsDashboard.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error:', error);
                processStep.textContent = 'Error processing statement';
            }
            
            isProcessing = false;
        }
        
        function displayResults(data) {
            const container = document.getElementById('results-container');
            
            container.innerHTML = data.transactions.map((tx, index) => \`
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
                        </div>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-3">
                            <span class="category-pill px-3 py-1 rounded-full text-sm font-medium">
                                \${getCategoryIcon(tx.category)} \${tx.category}
                            </span>
                            \${tx.subcategory ? \`<span class="bg-gray-700 px-2 py-1 rounded-full text-xs">\${tx.subcategory}</span>\` : ''}
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
            animateNumber('transactions-stat', 0, data.totalTransactions, '');
            document.getElementById('bank-stat').textContent = data.bankName.split(' ')[0];
        }
        
        function animateNumber(elementId, start, end, suffix = '', isRupee = false) {
            const element = document.getElementById(elementId);
            const duration = 1000;
            const startTime = Date.now();
            
            function update() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = Math.floor(start + (end - start) * progress);
                
                if (isRupee) {
                    element.textContent = suffix + current.toLocaleString();
                } else {
                    element.textContent = current + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            update();
        }
        
        function createCategoryChart(transactions) {
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
            
            // Create line chart
            createLineChart(transactions);
            
            // Create heatmap
            createHeatmap(transactions);
            

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
        
        function createLineChart(transactions) {
            const canvas = document.getElementById('line-chart');
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            
            // Generate daily data (mock)
            const dailyData = [];
            for (let i = 0; i < 7; i++) {
                dailyData.push(Math.random() * 5000 + 1000);
            }
            
            const maxValue = Math.max(...dailyData);
            const padding = 40;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            
            for (let i = 0; i <= 5; i++) {
                const y = padding + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding, y);
                ctx.lineTo(width - padding, y);
                ctx.stroke();
            }
            
            // Draw line
            ctx.strokeStyle = '#00d4aa';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            // Create gradient
            const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
            gradient.addColorStop(0, '#00d4aa40');
            gradient.addColorStop(1, '#00d4aa00');
            
            ctx.beginPath();
            dailyData.forEach((value, index) => {
                const x = padding + (chartWidth / (dailyData.length - 1)) * index;
                const y = height - padding - (value / maxValue) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            // Fill area under curve
            ctx.lineTo(width - padding, height - padding);
            ctx.lineTo(padding, height - padding);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
            
            // Draw line
            ctx.beginPath();
            dailyData.forEach((value, index) => {
                const x = padding + (chartWidth / (dailyData.length - 1)) * index;
                const y = height - padding - (value / maxValue) * chartHeight;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw points
            dailyData.forEach((value, index) => {
                const x = padding + (chartWidth / (dailyData.length - 1)) * index;
                const y = height - padding - (value / maxValue) * chartHeight;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fillStyle = '#00d4aa';
                ctx.fill();
                
                // Glow effect
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fillStyle = '#00d4aa40';
                ctx.fill();
            });
        }
        
        function createHeatmap(transactions) {
            const container = document.getElementById('heatmap-chart');
            const hours = Array(24).fill(0);
            
            // Generate mock hourly data
            for (let i = 0; i < 24; i++) {
                hours[i] = Math.random() * 10;
            }
            
            const maxValue = Math.max(...hours);
            
            container.innerHTML = hours.map((value, hour) => {
                const intensity = value / maxValue;
                const opacity = Math.max(intensity, 0.1);
                
                return \`
                    <div class="aspect-square rounded-sm transition-all duration-500 hover:scale-110 cursor-pointer"
                         style="background: rgba(0, 212, 170, \${opacity}); animation-delay: \${hour * 50}ms;"
                         title="\${hour}:00 - \${Math.round(value)} transactions">
                    </div>
                \`;
            }).join('');
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
        
        function getConfidenceLevel(confidence) {
            if (confidence >= 90) return 'high';
            if (confidence >= 70) return 'medium';
            return 'low';
        }
    </script>
</body>
</html>
`

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/process-demo' && req.method === 'POST') {
    try {
      const startTime = Date.now()
      
      const parseResult = BankParsers.parse(mockPDFText)
      const categorizedTransactions = parseResult.transactions.map(transaction => 
        MerchantCategorizer.processTransaction(transaction)
      )
      
      const processingTime = Date.now() - startTime
      const avgAccuracy = Math.round(
        categorizedTransactions.reduce((sum, tx) => sum + tx.confidence, 0) / categorizedTransactions.length
      )
      
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        bank: parseResult.bank,
        bankName: parseResult.bankName,
        transactions: categorizedTransactions,
        processingTime,
        avgAccuracy,
        totalTransactions: categorizedTransactions.length,
        needsReview: categorizedTransactions.filter(tx => tx.needsReview).length
      }))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: error.message }))
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(htmlContent)
  }
})

server.listen(PORT, () => {
  console.log(`🚀 CRED-Style Demo running on http://localhost:${PORT}`)
  console.log(`✨ Features: Modern animations, interactive charts, CRED-inspired design`)
  console.log(`🎨 Design: Glassmorphism, neon effects, smooth transitions`)
})
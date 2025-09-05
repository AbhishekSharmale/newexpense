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
    <title>ExpenseAI - Advanced Intelligence</title>
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
                        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
                        'pulse-glow': 'pulseGlow 2s ease-in-out infinite'
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
        
        @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 20px rgba(0, 212, 170, 0.4); }
            50% { box-shadow: 0 0 40px rgba(0, 212, 170, 0.8); }
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
        
        .health-score-circle {
            background: conic-gradient(from 0deg, #00d4aa 0deg, #6366f1 120deg, #ec4899 240deg, #00d4aa 360deg);
            animation: rotate 10s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .personality-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .personality-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 25px 50px rgba(0, 212, 170, 0.3);
        }
        
        .alert-card {
            animation: slideUp 0.5s ease-out;
        }
        
        .quick-action-btn {
            transition: all 0.2s ease;
        }
        
        .quick-action-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 10px 25px rgba(0, 212, 170, 0.4);
        }
        
        .floating-element {
            animation: float 6s ease-in-out infinite;
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
                    ExpenseAI Intelligence
                </h1>
                <p class="text-xl text-gray-400 mb-6">Advanced behavioral insights & financial intelligence</p>
                <div class="flex justify-center gap-4">
                    <div class="bg-gradient-to-r from-cred-accent/20 to-cred-purple/20 border border-cred-accent/30 px-4 py-2 rounded-full text-sm font-medium">
                        🧠 Behavioral Analysis
                    </div>
                    <div class="bg-gradient-to-r from-cred-purple/20 to-cred-pink/20 border border-cred-purple/30 px-4 py-2 rounded-full text-sm font-medium">
                        📊 Health Score
                    </div>
                    <div class="bg-gradient-to-r from-cred-pink/20 to-cred-orange/20 border border-cred-pink/30 px-4 py-2 rounded-full text-sm font-medium">
                        🚨 Smart Alerts
                    </div>
                </div>
            </div>

            <!-- Upload Section -->
            <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up">
                <div class="text-center">
                    <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-cred-accent to-cred-purple rounded-2xl flex items-center justify-center animate-pulse-glow">
                        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Upload Statement for AI Analysis</h3>
                    <p class="text-gray-400 mb-6">Get behavioral insights, health score, and predictive alerts</p>
                    
                    <div class="max-w-md mx-auto">
                        <div class="border-2 border-dashed border-gray-600 hover:border-cred-accent rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-cred-accent/5" onclick="document.getElementById('file-input').click()">
                            <input type="file" id="file-input" accept=".pdf" style="display:none">
                            <p class="text-gray-400">Click to upload ICICI PDF</p>
                        </div>
                        
                        <div id="file-info" class="hidden mt-4 p-4 bg-gray-700 rounded-lg">
                            <div class="font-medium" id="file-name">-</div>
                            <div class="text-sm text-gray-400" id="file-size">-</div>
                        </div>
                        
                        <button id="process-btn" class="w-full neon-border rounded-2xl py-4 px-6 font-semibold text-lg transition-all duration-300 hover:scale-105 mt-6 disabled:opacity-50" disabled>
                            <span id="btn-text">Select PDF for AI Analysis</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Intelligence Dashboard -->
            <div id="intelligence-dashboard" class="hidden">
                <!-- Financial Health Score -->
                <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold mb-4">Financial Health Score</h2>
                        <div class="relative w-48 h-48 mx-auto mb-6">
                            <div class="health-score-circle w-full h-full rounded-full p-2">
                                <div class="w-full h-full bg-cred-dark rounded-full flex items-center justify-center">
                                    <div class="text-center">
                                        <div class="text-4xl font-black text-cred-accent" id="health-score">0</div>
                                        <div class="text-sm text-gray-400">out of 10</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="health-status" class="text-xl font-semibold text-cred-accent">Calculating...</div>
                    </div>
                    
                    <div id="health-components" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Components will be populated by JavaScript -->
                    </div>
                </div>

                <!-- Behavioral Insights -->
                <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up" style="animation-delay: 0.2s;">
                    <h2 class="text-3xl font-bold mb-8 text-center">Your Spending Personality</h2>
                    <div id="personality-insights">
                        <!-- Personality analysis will be populated -->
                    </div>
                </div>

                <!-- Smart Alerts -->
                <div class="card-glow rounded-3xl p-8 mb-12 animate-slide-up" style="animation-delay: 0.4s;">
                    <h2 class="text-3xl font-bold mb-8 text-center">Smart Alerts & Recommendations</h2>
                    <div id="smart-alerts" class="space-y-6">
                        <!-- Alerts will be populated -->
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="card-glow rounded-3xl p-8 animate-slide-up" style="animation-delay: 0.6s;">
                    <h2 class="text-3xl font-bold mb-8 text-center">Quick Actions</h2>
                    <div id="quick-actions" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Quick actions will be populated -->
                    </div>
                </div>
            </div>

            <!-- Processing Animation -->
            <div id="processing-status" class="hidden card-glow rounded-2xl p-6 mb-8">
                <div class="flex items-center gap-4">
                    <div class="w-8 h-8 border-4 border-cred-accent border-t-transparent rounded-full animate-spin"></div>
                    <div>
                        <div class="font-semibold">AI is analyzing your financial behavior...</div>
                        <div class="text-sm text-gray-400" id="processing-step">Processing...</div>
                    </div>
                </div>
                <div class="mt-4 w-full bg-gray-700 rounded-full h-2">
                    <div id="progress-bar" class="bg-gradient-to-r from-cred-accent to-cred-purple h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
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
        const processingStatus = document.getElementById('processing-status');
        const processStep = document.getElementById('processing-step');
        const progressBar = document.getElementById('progress-bar');
        const intelligenceDashboard = document.getElementById('intelligence-dashboard');

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
                btnText.textContent = 'Analyze with AI Intelligence';
            }
        }

        async function processFile() {
            if (!selectedFile || isProcessing) return;
            
            isProcessing = true;
            processBtn.disabled = true;
            btnText.textContent = 'Analyzing...';
            processingStatus.classList.remove('hidden');
            
            const steps = [
                { text: 'Extracting transaction data...', progress: 20 },
                { text: 'Analyzing spending patterns...', progress: 40 },
                { text: 'Calculating financial health...', progress: 60 },
                { text: 'Generating behavioral insights...', progress: 80 },
                { text: 'Creating smart recommendations...', progress: 100 }
            ];
            
            // Animate through steps
            for (let i = 0; i < steps.length; i++) {
                processStep.textContent = steps[i].text;
                progressBar.style.width = steps[i].progress + '%';
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
            
            try {
                const formData = new FormData();
                formData.append('statement', selectedFile);
                
                const response = await fetch('/api/analyze-intelligence', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                // Hide processing, show results
                processingStatus.classList.add('hidden');
                btnText.textContent = 'Analyze Another Statement';
                
                // Display intelligence results
                displayHealthScore(data.healthScore);
                displayPersonalityInsights(data.behaviorAnalysis);
                displaySmartAlerts(data.alerts);
                displayQuickActions(data.quickActions);
                
                intelligenceDashboard.classList.remove('hidden');
                
            } catch (error) {
                console.error('Error:', error);
                processStep.textContent = 'Analysis failed';
                displayError(error.message);
            }
            
            isProcessing = false;
            processBtn.disabled = false;
        }
        
        function displayHealthScore(healthData) {
            // Animate score
            animateNumber('health-score', 0, healthData.overallScore, '', false, 2000);
            
            document.getElementById('health-status').textContent = getHealthStatus(healthData.overallScore);
            
            // Display components
            const componentsContainer = document.getElementById('health-components');
            componentsContainer.innerHTML = Object.entries(healthData.components).map(([key, component]) => \`
                <div class="bg-gray-800/50 rounded-xl p-6 animate-scale-in">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="font-semibold">\${formatComponentName(key)}</h4>
                        <div class="text-2xl font-bold \${getScoreColor(component.score)}">\${component.score}/10</div>
                    </div>
                    <div class="text-sm text-gray-400 mb-3">\${component.message}</div>
                    <div class="w-full bg-gray-700 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-1000 \${getScoreGradient(component.score)}" 
                             style="width: \${component.score * 10}%"></div>
                    </div>
                    \${component.improvement ? \`
                        <div class="mt-3 text-xs text-yellow-400">
                            💡 \${component.improvement}
                        </div>
                    \` : ''}
                </div>
            \`).join('');
        }
        
        function displayPersonalityInsights(behaviorData) {
            const container = document.getElementById('personality-insights');
            
            container.innerHTML = \`
                <div class="personality-card card-glow rounded-2xl p-8 mb-6">
                    <div class="flex items-center gap-4 mb-6">
                        <div class="w-16 h-16 bg-gradient-to-r from-cred-purple to-cred-pink rounded-2xl flex items-center justify-center text-2xl">
                            \${getPersonalityIcon(behaviorData.type)}
                        </div>
                        <div>
                            <h3 class="text-2xl font-bold">\${behaviorData.type}</h3>
                            <div class="text-sm text-gray-400">\${behaviorData.confidence}% confidence</div>
                        </div>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold mb-2 text-cred-accent">Key Insights:</h4>
                            <ul class="space-y-2">
                                \${behaviorData.insights.map(insight => \`
                                    <li class="text-gray-300 flex items-start gap-2">
                                        <span class="text-cred-accent mt-1">•</span>
                                        \${insight}
                                    </li>
                                \`).join('')}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-2 text-cred-purple">Recommendations:</h4>
                            <ul class="space-y-2">
                                \${behaviorData.recommendations.map(rec => \`
                                    <li class="text-gray-300 flex items-start gap-2">
                                        <span class="text-cred-purple mt-1">→</span>
                                        \${rec}
                                    </li>
                                \`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            \`;
        }
        
        function displaySmartAlerts(alerts) {
            const container = document.getElementById('smart-alerts');
            
            if (alerts.length === 0) {
                container.innerHTML = \`
                    <div class="text-center py-8 text-gray-400">
                        <div class="text-4xl mb-4">✅</div>
                        <p>No alerts - your spending is on track!</p>
                    </div>
                \`;
                return;
            }
            
            container.innerHTML = alerts.map((alert, index) => \`
                <div class="alert-card bg-gradient-to-r from-\${getAlertColor(alert.urgency)}/20 to-transparent border border-\${getAlertColor(alert.urgency)}/30 rounded-2xl p-6" style="animation-delay: \${index * 0.1}s;">
                    <div class="flex items-start gap-4">
                        <div class="w-12 h-12 bg-\${getAlertColor(alert.urgency)}/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            \${getAlertIcon(alert.type)}
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-lg mb-2">\${alert.title}</h4>
                            <p class="text-gray-300 mb-4">\${alert.message}</p>
                            <div class="flex gap-2 flex-wrap">
                                \${alert.actions.map(action => \`
                                    <button class="quick-action-btn px-4 py-2 bg-\${getAlertColor(alert.urgency)}/20 border border-\${getAlertColor(alert.urgency)}/40 rounded-lg text-sm font-medium hover:bg-\${getAlertColor(alert.urgency)}/30 transition-all">
                                        \${action.label}
                                    </button>
                                \`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            \`).join('');
        }
        
        function displayQuickActions(actions) {
            const container = document.getElementById('quick-actions');
            
            const defaultActions = [
                {
                    icon: '💰',
                    title: 'Auto-Save Surplus',
                    description: 'Move extra money to savings',
                    amount: '₹2,400',
                    color: 'cred-accent'
                },
                {
                    icon: '📈',
                    title: 'Start SIP Investment',
                    description: 'Begin systematic investing',
                    amount: '₹1,000/month',
                    color: 'cred-purple'
                },
                {
                    icon: '🎯',
                    title: 'Set Spending Limit',
                    description: 'Control daily expenses',
                    amount: '₹800/day',
                    color: 'cred-pink'
                },
                {
                    icon: '🔔',
                    title: 'Enable Smart Alerts',
                    description: 'Get proactive notifications',
                    amount: 'Real-time',
                    color: 'cred-orange'
                },
                {
                    icon: '📊',
                    title: 'Budget Optimizer',
                    description: 'AI-powered budget suggestions',
                    amount: 'Personalized',
                    color: 'cred-accent'
                },
                {
                    icon: '🏆',
                    title: 'Financial Goals',
                    description: 'Track and achieve targets',
                    amount: 'Goal-based',
                    color: 'cred-purple'
                }
            ];
            
            container.innerHTML = defaultActions.map((action, index) => \`
                <div class="quick-action-btn bg-gradient-to-br from-\${action.color}/20 to-\${action.color}/5 border border-\${action.color}/30 rounded-2xl p-6 cursor-pointer animate-scale-in" style="animation-delay: \${index * 0.1}s;">
                    <div class="text-3xl mb-4">\${action.icon}</div>
                    <h4 class="font-bold text-lg mb-2">\${action.title}</h4>
                    <p class="text-gray-400 text-sm mb-3">\${action.description}</p>
                    <div class="text-\${action.color} font-semibold">\${action.amount}</div>
                </div>
            \`).join('');
        }
        
        // Utility functions
        function animateNumber(elementId, start, end, prefix = '', suffix = false, duration = 1000) {
            const element = document.getElementById(elementId);
            const startTime = Date.now();
            
            function update() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const current = start + (end - start) * progress;
                
                element.textContent = prefix + (suffix ? current.toFixed(1) : Math.floor(current));
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                }
            }
            
            update();
        }
        
        function getHealthStatus(score) {
            if (score >= 8.5) return 'Excellent Financial Health';
            if (score >= 7) return 'Good Financial Health';
            if (score >= 5.5) return 'Fair Financial Health';
            return 'Needs Improvement';
        }
        
        function getScoreColor(score) {
            if (score >= 8) return 'text-cred-accent';
            if (score >= 6) return 'text-yellow-400';
            return 'text-red-400';
        }
        
        function getScoreGradient(score) {
            if (score >= 8) return 'bg-gradient-to-r from-cred-accent to-green-400';
            if (score >= 6) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
            return 'bg-gradient-to-r from-red-400 to-pink-400';
        }
        
        function formatComponentName(key) {
            const names = {
                emergencyFund: 'Emergency Fund',
                debtRatio: 'Debt Management',
                savingsRate: 'Savings Rate',
                spendingDiscipline: 'Spending Control',
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
            const colors = {
                high: 'red-500',
                medium: 'yellow-500',
                low: 'blue-500'
            };
            return colors[urgency] || 'gray-500';
        }
        
        function getAlertIcon(type) {
            const icons = {
                overspend_warning: '⚠️',
                category_warning: '📊',
                surplus_opportunity: '💡'
            };
            return icons[type] || '🔔';
        }
        
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        function displayError(message) {
            intelligenceDashboard.innerHTML = \`
                <div class="text-center py-16">
                    <div class="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-2xl flex items-center justify-center">
                        <svg class="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-red-400 mb-4">Analysis Failed</h3>
                    <p class="text-gray-400">\${message}</p>
                </div>
            \`;
            intelligenceDashboard.classList.remove('hidden');
        }
    </script>
</body>
</html>
    `)
  } else if (req.url === '/api/analyze-intelligence' && req.method === 'POST') {
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('🧠 Starting AI intelligence analysis...')
        
        // Extract and parse PDF
        const pdfData = await pdf(body)
        const text = pdfData.text
        const transactions = ICICIParser.parseTransactions(text)
        const categorizedTransactions = transactions.map(transaction => 
          MerchantCategorizer.processTransaction(transaction)
        )
        
        console.log('✅ Transactions processed:', categorizedTransactions.length)
        
        // Generate behavioral analysis
        const behaviorAnalysis = BehaviorAnalyzer.analyzeSpendingPersonality(categorizedTransactions)
        console.log('✅ Behavior analysis complete:', behaviorAnalysis.type)
        
        // Calculate financial health score
        const mockUserData = {
          monthlyIncome: 50000,
          monthlyExpenses: 25000,
          emergencyFund: 75000,
          monthlyDebtPayments: 5000,
          monthlySavings: 10000,
          budgetAdherence: 0.75,
          investments: {
            mutualFunds: 50000,
            stocks: 25000,
            fixedDeposits: 30000
          }
        }
        
        const healthScore = FinancialHealthScore.calculateScore(mockUserData)
        console.log('✅ Health score calculated:', healthScore.overallScore)
        
        // Generate predictive alerts
        const alerts = BehaviorAnalyzer.generatePredictiveAlerts(categorizedTransactions)
        console.log('✅ Alerts generated:', alerts.length)
        
        // Mock quick actions
        const quickActions = [
          {
            type: 'auto_save',
            title: 'Auto-Save Surplus',
            description: 'Move ₹2,400 surplus to savings',
            impact: 'Earn 6% interest annually'
          },
          {
            type: 'start_sip',
            title: 'Start SIP Investment', 
            description: 'Begin ₹1,000/month SIP',
            impact: 'Expected 12% returns'
          }
        ]
        
        const result = {
          transactions: categorizedTransactions,
          behaviorAnalysis,
          healthScore,
          alerts,
          quickActions,
          processingTime: Date.now()
        }
        
        console.log('✅ Intelligence analysis complete')
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
        
      } catch (error) {
        console.error('❌ Intelligence analysis failed:', error.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
})

server.listen(4040, () => {
  console.log('🧠 ExpenseAI Advanced Intelligence on http://localhost:4040')
  console.log('🎯 Features: Behavioral Analysis, Health Score, Smart Alerts, Quick Actions')
  console.log('✨ Complete AI-powered financial intelligence platform')
})
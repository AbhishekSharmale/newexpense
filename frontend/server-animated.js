const http = require('http')
const PORT = 3001

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Interactive Demo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
            color: white; 
            overflow-x: hidden;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Header Animations */
        .header { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 20px 0;
            animation: slideDown 0.8s ease-out;
        }
        .logo { 
            font-size: 24px; 
            font-weight: bold; 
            color: #60a5fa;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .logo:hover {
            transform: scale(1.05);
            text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
        }
        
        /* Button Animations */
        .btn { 
            padding: 12px 24px; 
            border-radius: 8px; 
            border: none; 
            cursor: pointer; 
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }
        .btn:hover::before {
            left: 100%;
        }
        .btn-primary { 
            background: linear-gradient(135deg, #3b82f6, #1d4ed8); 
            color: white;
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }
        .btn-secondary { 
            background: linear-gradient(135deg, #374151, #1f2937); 
            color: white;
        }
        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(55, 65, 81, 0.4);
        }
        
        /* Hero Section Animations */
        .hero { 
            text-align: center; 
            padding: 80px 0;
            animation: fadeInUp 1s ease-out 0.3s both;
        }
        .hero h1 { 
            font-size: 48px; 
            margin-bottom: 24px; 
            background: linear-gradient(45deg, #ffffff, #60a5fa, #3b82f6);
            background-size: 200% 200%;
            -webkit-background-clip: text; 
            -webkit-text-fill-color: transparent;
            animation: gradientShift 3s ease-in-out infinite;
        }
        .hero p { 
            font-size: 20px; 
            color: #9ca3af; 
            margin-bottom: 32px; 
            max-width: 600px; 
            margin-left: auto; 
            margin-right: auto;
            animation: fadeInUp 1s ease-out 0.6s both;
        }
        
        /* Feature Cards */
        .features { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 24px; 
            margin: 60px 0;
        }
        .card { 
            background: rgba(31, 41, 55, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(55, 65, 81, 0.5); 
            border-radius: 12px; 
            padding: 24px; 
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .card:hover::before {
            opacity: 1;
        }
        .card:hover { 
            transform: translateY(-8px) scale(1.02);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .card h3 { font-size: 20px; margin: 16px 0 8px; position: relative; z-index: 1; }
        .card p { color: #9ca3af; position: relative; z-index: 1; }
        .card .icon { 
            font-size: 48px; 
            margin-bottom: 16px; 
            display: inline-block;
            animation: float 3s ease-in-out infinite;
        }
        
        /* Demo Section */
        .demo { 
            background: rgba(31, 41, 55, 0.5); 
            padding: 60px 0; 
            margin: 40px 0;
            position: relative;
        }
        .demo-content { max-width: 600px; margin: 0 auto; position: relative; z-index: 1; }
        
        /* Transaction Animations */
        .transaction { 
            display: flex; 
            justify-content: space-between; 
            padding: 12px; 
            background: rgba(17, 24, 39, 0.8);
            backdrop-filter: blur(5px);
            border-radius: 8px; 
            margin-bottom: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid transparent;
            animation: slideInLeft 0.6s ease-out;
        }
        .transaction:hover {
            transform: translateX(8px);
            border-color: rgba(59, 130, 246, 0.3);
            background: rgba(17, 24, 39, 0.9);
        }
        .transaction:nth-child(1) { animation-delay: 0.1s; }
        .transaction:nth-child(2) { animation-delay: 0.2s; }
        .transaction:nth-child(3) { animation-delay: 0.3s; }
        
        .insight { 
            padding: 16px; 
            background: rgba(59, 130, 246, 0.1); 
            border: 1px solid #3b82f6; 
            border-radius: 8px; 
            margin-top: 24px; 
            color: #60a5fa;
            animation: pulse 2s ease-in-out infinite;
        }
        
        /* Dashboard */
        .hidden { display: none; }
        .dashboard { min-height: 100vh; }
        .dashboard-header { 
            background: rgba(31, 41, 55, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #374151; 
            padding: 16px 0;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        /* Stats Cards */
        .stats { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 24px; 
            margin: 24px 0;
        }
        .stat-card { 
            background: rgba(31, 41, 55, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(55, 65, 81, 0.5); 
            border-radius: 12px; 
            padding: 20px;
            transition: all 0.3s ease;
            cursor: pointer;
            animation: fadeInUp 0.6s ease-out;
        }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:nth-child(4) { animation-delay: 0.4s; }
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        .stat-value { 
            font-size: 24px; 
            font-weight: bold; 
            margin-top: 8px;
        }
        
        /* Upload Area */
        .upload-area { 
            border: 2px dashed #4b5563; 
            border-radius: 12px; 
            padding: 48px; 
            text-align: center; 
            cursor: pointer; 
            margin: 40px 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }
        .upload-area::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .upload-area:hover {
            border-color: #3b82f6;
            transform: scale(1.02);
            box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
        }
        .upload-area:hover::before {
            opacity: 1;
        }
        
        /* Keyframe Animations */
        @keyframes slideDown {
            from { transform: translateY(-100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fadeInUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInLeft {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
        }
        
        /* Page Transitions */
        .page-enter {
            animation: pageSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes pageSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        /* Loading Animation */
        .loading-spinner {
            border: 2px solid #374151;
            border-top: 2px solid #3b82f6;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .hero h1 { font-size: 36px; }
            .features { grid-template-columns: 1fr; }
            .stats { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div id="landing">
        <div class="container">
            <div class="header">
                <div class="logo" onclick="showLanding()">ExpenseAI</div>
                <button class="btn btn-secondary" onclick="showAuth()">Sign In</button>
            </div>
            
            <div class="hero">
                <h1>Transform Your UPI Statements Into Smart Financial Insights</h1>
                <p>AI-powered expense tracking built specifically for Indian spending patterns. Upload your bank statement and get instant insights.</p>
                <button class="btn btn-primary" onclick="showAuth()">Get Started Free →</button>
            </div>
            
            <div class="features">
                <div class="card" onclick="animateCard(this)">
                    <div class="icon">🧠</div>
                    <h3>AI Categorization</h3>
                    <p>Understands PhonePe, GPay, Paytm transactions with 95% accuracy</p>
                </div>
                <div class="card" onclick="animateCard(this)">
                    <div class="icon">🛡️</div>
                    <h3>Privacy First</h3>
                    <p>Process PDFs locally, zero data storage, bank-grade security</p>
                </div>
                <div class="card" onclick="animateCard(this)">
                    <div class="icon">📈</div>
                    <h3>Smart Predictions</h3>
                    <p>Forecast spending, track goals, optimize EMIs and cashbacks</p>
                </div>
                <div class="card" onclick="animateCard(this)">
                    <div class="icon">⚡</div>
                    <h3>Instant Insights</h3>
                    <p>Festival budgets, subscription tracking, spending triggers</p>
                </div>
            </div>
            
            <div class="demo">
                <div class="container">
                    <h2 style="text-align: center; margin-bottom: 32px; font-size: 32px;">See Your Money in Action</h2>
                    <div class="demo-content">
                        <div class="transaction" onclick="highlightTransaction(this)">
                            <span>🍕 Zomato Delivery</span>
                            <span style="color: #f87171;">-₹340</span>
                        </div>
                        <div class="transaction" onclick="highlightTransaction(this)">
                            <span>🚗 Uber Ride</span>
                            <span style="color: #f87171;">-₹180</span>
                        </div>
                        <div class="transaction" onclick="highlightTransaction(this)">
                            <span>💰 Salary Credit</span>
                            <span style="color: #4ade80;">+₹75,000</span>
                        </div>
                        <div class="insight">
                            <strong>💡 AI Insight:</strong> You spent 23% more on food delivery this week. Consider cooking at home to save ₹1,200/month.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="auth" class="hidden">
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center;" class="page-enter">
            <div class="card" style="max-width: 400px; width: 100%; margin: 0 20px;">
                <h1 style="font-size: 24px; text-align: center; margin-bottom: 24px;">Welcome to ExpenseAI</h1>
                <p style="color: #9ca3af; text-align: center; margin-bottom: 32px;">Sign in to start tracking your expenses</p>
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 16px;" onclick="showDashboard()">
                    🔐 Continue with Google
                </button>
                <button style="width: 100%; background: none; border: none; color: #9ca3af; cursor: pointer;" onclick="showLanding()">← Back to Home</button>
            </div>
        </div>
    </div>

    <div id="dashboard" class="hidden dashboard">
        <div class="dashboard-header">
            <div class="container">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 style="font-size: 24px; font-weight: bold; color: #60a5fa;">ExpenseAI Dashboard</h1>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <span style="color: #9ca3af;">Welcome, Demo User</span>
                        <button class="btn btn-secondary" onclick="showLanding()">Logout</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="container">
            <div id="upload-section">
                <h2 style="text-align: center; margin: 40px 0 16px; font-size: 32px;">Upload Your First Statement</h2>
                <p style="text-align: center; color: #9ca3af; margin-bottom: 32px;">Get instant AI-powered insights from your bank statement</p>
                
                <div class="upload-area" onclick="simulateUpload()">
                    <div style="font-size: 48px; margin-bottom: 16px;" class="icon">📄</div>
                    <h3 style="font-size: 20px; margin-bottom: 16px;">Upload Bank Statement</h3>
                    <p style="color: #9ca3af; margin-bottom: 16px;">Click to browse and select your PDF statement</p>
                    <p style="color: #6b7280; font-size: 14px;">Supports SBI, HDFC, ICICI, Axis Bank statements</p>
                </div>
            </div>

            <div id="analytics-section" class="hidden">
                <div class="stats">
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <p style="color: #9ca3af; font-size: 14px;">Total Spent</p>
                        <p class="stat-value" style="color: #f87171;" data-value="47580">₹0</p>
                    </div>
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <p style="color: #9ca3af; font-size: 14px;">Income</p>
                        <p class="stat-value" style="color: #4ade80;" data-value="75000">₹0</p>
                    </div>
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <p style="color: #9ca3af; font-size: 14px;">Savings</p>
                        <p class="stat-value" style="color: #60a5fa;" data-value="27420">₹0</p>
                    </div>
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <p style="color: #9ca3af; font-size: 14px;">vs Last Month</p>
                        <p class="stat-value" style="color: #fbbf24;">-8.2%</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin: 40px 0;">
                    <div class="card">
                        <h3 style="margin-bottom: 24px;">Spending by Category</h3>
                        <div id="category-list">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; opacity: 0;" class="category-item">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
                                    <span>Food & Dining</span>
                                </div>
                                <span>₹15,420</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; opacity: 0;" class="category-item">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 12px; height: 12px; background: #f97316; border-radius: 50%;"></div>
                                    <span>Transportation</span>
                                </div>
                                <span>₹8,340</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; opacity: 0;" class="category-item">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 12px; height: 12px; background: #eab308; border-radius: 50%;"></div>
                                    <span>Shopping</span>
                                </div>
                                <span>₹12,680</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; opacity: 0;" class="category-item">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                                    <span>Entertainment</span>
                                </div>
                                <span>₹4,250</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 24px;">AI Insights</h3>
                        <div style="padding: 16px; background: rgba(251, 191, 36, 0.1); border: 1px solid #f59e0b; border-radius: 8px; margin-bottom: 16px; color: #fbbf24; opacity: 0;" class="insight-item">
                            <strong>💡 Spending Alert:</strong> You spent 23% more on food delivery this month.
                        </div>
                        <div style="padding: 16px; background: rgba(74, 222, 128, 0.1); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 16px; color: #4ade80; opacity: 0;" class="insight-item">
                            <strong>✅ Good News:</strong> Transportation costs decreased by 15%.
                        </div>
                        <div style="padding: 16px; background: rgba(96, 165, 250, 0.1); border: 1px solid #3b82f6; border-radius: 8px; color: #60a5fa; opacity: 0;" class="insight-item">
                            <strong>📊 Prediction:</strong> You'll save ₹32,000 by month end!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function showLanding() {
            document.getElementById('landing').classList.remove('hidden');
            document.getElementById('auth').classList.add('hidden');
            document.getElementById('dashboard').classList.add('hidden');
        }

        function showAuth() {
            document.getElementById('landing').classList.add('hidden');
            document.getElementById('auth').classList.remove('hidden');
            document.getElementById('dashboard').classList.add('hidden');
            
            // Add page transition
            document.getElementById('auth').querySelector('div').classList.add('page-enter');
        }

        function showDashboard() {
            document.getElementById('landing').classList.add('hidden');
            document.getElementById('auth').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
        }

        function animateCard(card) {
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            }, 100);
        }

        function highlightTransaction(transaction) {
            transaction.style.background = 'rgba(59, 130, 246, 0.2)';
            transaction.style.borderColor = '#3b82f6';
            setTimeout(() => {
                transaction.style.background = 'rgba(17, 24, 39, 0.8)';
                transaction.style.borderColor = 'transparent';
            }, 1000);
        }

        function animateStatCard(card) {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'translateY(-4px)';
            }, 200);
        }

        function countUp(element, target) {
            let current = 0;
            const increment = target / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = '₹' + Math.floor(current).toLocaleString();
            }, 30);
        }

        function simulateUpload() {
            document.getElementById('upload-section').innerHTML = \`
                <div style="max-width: 600px; margin: 40px auto;">
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center; animation: fadeInUp 0.5s ease-out;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 32px;">📄</div>
                            <div>
                                <p style="font-weight: bold;">SBI_Statement_April_2024.pdf</p>
                                <p style="color: #9ca3af; font-size: 14px;">2.4 MB</p>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; animation: pulse 1s ease-in-out infinite;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div class="loading-spinner"></div>
                            <span style="color: #60a5fa;">Processing your statement...</span>
                        </div>
                    </div>
                </div>
            \`;
            
            setTimeout(() => {
                document.getElementById('upload-section').classList.add('hidden');
                document.getElementById('analytics-section').classList.remove('hidden');
                
                // Animate stat values
                setTimeout(() => {
                    const statValues = document.querySelectorAll('.stat-value[data-value]');
                    statValues.forEach(stat => {
                        const target = parseInt(stat.getAttribute('data-value'));
                        countUp(stat, target);
                    });
                }, 500);
                
                // Animate category items
                setTimeout(() => {
                    const categoryItems = document.querySelectorAll('.category-item');
                    categoryItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                            item.style.transition = 'all 0.5s ease-out';
                        }, index * 200);
                    });
                }, 1000);
                
                // Animate insights
                setTimeout(() => {
                    const insightItems = document.querySelectorAll('.insight-item');
                    insightItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                            item.style.transition = 'all 0.5s ease-out';
                        }, index * 300);
                    });
                }, 1500);
                
            }, 3000);
        }
    </script>
</body>
</html>
`

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(htmlContent)
})

server.listen(PORT, () => {
  console.log(`🚀 ExpenseAI Animated Frontend running on http://localhost:${PORT}`)
  console.log(`📱 Open your browser and visit: http://localhost:${PORT}`)
  console.log(`✨ Now with smooth animations and interactions!`)
})
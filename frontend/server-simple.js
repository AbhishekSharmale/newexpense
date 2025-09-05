const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = 3000

// Simple HTML content
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Working Version</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #111827; color: white; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; }
        .logo { font-size: 24px; font-weight: bold; color: #60a5fa; }
        .btn { padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-secondary { background: #374151; color: white; }
        .hero { text-align: center; padding: 80px 0; }
        .hero h1 { font-size: 48px; margin-bottom: 24px; background: linear-gradient(to right, white, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .hero p { font-size: 20px; color: #9ca3af; margin-bottom: 32px; max-width: 600px; margin-left: auto; margin-right: auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin: 60px 0; }
        .card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 24px; text-align: center; }
        .card h3 { font-size: 20px; margin: 16px 0 8px; }
        .card p { color: #9ca3af; }
        .demo { background: rgba(31, 41, 55, 0.5); padding: 60px 0; margin: 40px 0; }
        .demo-content { max-width: 600px; margin: 0 auto; }
        .transaction { display: flex; justify-content: space-between; padding: 12px; background: #111827; border-radius: 8px; margin-bottom: 12px; }
        .insight { padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; margin-top: 24px; color: #60a5fa; }
        .hidden { display: none; }
        .dashboard { min-height: 100vh; }
        .dashboard-header { background: #1f2937; border-bottom: 1px solid #374151; padding: 16px 0; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin: 24px 0; }
        .stat-card { background: #1f2937; border: 1px solid #374151; border-radius: 12px; padding: 20px; }
        .stat-value { font-size: 24px; font-weight: bold; margin-top: 8px; }
        .upload-area { border: 2px dashed #4b5563; border-radius: 12px; padding: 48px; text-align: center; cursor: pointer; margin: 40px 0; }
        .upload-area:hover { border-color: #6b7280; }
    </style>
</head>
<body>
    <div id="landing">
        <div class="container">
            <div class="header">
                <div class="logo">ExpenseAI</div>
                <button class="btn btn-secondary" onclick="showAuth()">Sign In</button>
            </div>
            
            <div class="hero">
                <h1>Transform Your UPI Statements Into Smart Financial Insights</h1>
                <p>AI-powered expense tracking built specifically for Indian spending patterns. Upload your bank statement and get instant insights.</p>
                <button class="btn btn-primary" onclick="showAuth()">Get Started Free →</button>
            </div>
            
            <div class="features">
                <div class="card">
                    <div style="font-size: 48px;">🧠</div>
                    <h3>AI Categorization</h3>
                    <p>Understands PhonePe, GPay, Paytm transactions with 95% accuracy</p>
                </div>
                <div class="card">
                    <div style="font-size: 48px;">🛡️</div>
                    <h3>Privacy First</h3>
                    <p>Process PDFs locally, zero data storage, bank-grade security</p>
                </div>
                <div class="card">
                    <div style="font-size: 48px;">📈</div>
                    <h3>Smart Predictions</h3>
                    <p>Forecast spending, track goals, optimize EMIs and cashbacks</p>
                </div>
                <div class="card">
                    <div style="font-size: 48px;">⚡</div>
                    <h3>Instant Insights</h3>
                    <p>Festival budgets, subscription tracking, spending triggers</p>
                </div>
            </div>
            
            <div class="demo">
                <div class="container">
                    <h2 style="text-align: center; margin-bottom: 32px; font-size: 32px;">See Your Money in Action</h2>
                    <div class="demo-content">
                        <div class="transaction">
                            <span>🍕 Zomato Delivery</span>
                            <span style="color: #f87171;">-₹340</span>
                        </div>
                        <div class="transaction">
                            <span>🚗 Uber Ride</span>
                            <span style="color: #f87171;">-₹180</span>
                        </div>
                        <div class="transaction">
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
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
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
                    <div style="font-size: 48px; margin-bottom: 16px;">📄</div>
                    <h3 style="font-size: 20px; margin-bottom: 16px;">Upload Bank Statement</h3>
                    <p style="color: #9ca3af; margin-bottom: 16px;">Click to browse and select your PDF statement</p>
                    <p style="color: #6b7280; font-size: 14px;">Supports SBI, HDFC, ICICI, Axis Bank statements</p>
                </div>
            </div>

            <div id="analytics-section" class="hidden">
                <div class="stats">
                    <div class="stat-card">
                        <p style="color: #9ca3af; font-size: 14px;">Total Spent</p>
                        <p class="stat-value" style="color: #f87171;">₹47,580</p>
                    </div>
                    <div class="stat-card">
                        <p style="color: #9ca3af; font-size: 14px;">Income</p>
                        <p class="stat-value" style="color: #4ade80;">₹75,000</p>
                    </div>
                    <div class="stat-card">
                        <p style="color: #9ca3af; font-size: 14px;">Savings</p>
                        <p class="stat-value" style="color: #60a5fa;">₹27,420</p>
                    </div>
                    <div class="stat-card">
                        <p style="color: #9ca3af; font-size: 14px;">vs Last Month</p>
                        <p class="stat-value" style="color: #fbbf24;">-8.2%</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin: 40px 0;">
                    <div class="card">
                        <h3 style="margin-bottom: 24px;">Spending by Category</h3>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
                                <span>Food & Dining</span>
                            </div>
                            <span>₹15,420</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; background: #f97316; border-radius: 50%;"></div>
                                <span>Transportation</span>
                            </div>
                            <span>₹8,340</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; background: #eab308; border-radius: 50%;"></div>
                                <span>Shopping</span>
                            </div>
                            <span>₹12,680</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                                <span>Entertainment</span>
                            </div>
                            <span>₹4,250</span>
                        </div>
                    </div>

                    <div class="card">
                        <h3 style="margin-bottom: 24px;">AI Insights</h3>
                        <div style="padding: 16px; background: rgba(251, 191, 36, 0.1); border: 1px solid #f59e0b; border-radius: 8px; margin-bottom: 16px; color: #fbbf24;">
                            <strong>💡 Spending Alert:</strong> You spent 23% more on food delivery this month.
                        </div>
                        <div style="padding: 16px; background: rgba(74, 222, 128, 0.1); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 16px; color: #4ade80;">
                            <strong>✅ Good News:</strong> Transportation costs decreased by 15%.
                        </div>
                        <div style="padding: 16px; background: rgba(96, 165, 250, 0.1); border: 1px solid #3b82f6; border-radius: 8px; color: #60a5fa;">
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
        }

        function showDashboard() {
            document.getElementById('landing').classList.add('hidden');
            document.getElementById('auth').classList.add('hidden');
            document.getElementById('dashboard').classList.remove('hidden');
        }

        function simulateUpload() {
            document.getElementById('upload-section').innerHTML = \`
                <div style="max-width: 600px; margin: 40px auto;">
                    <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="font-size: 32px;">📄</div>
                            <div>
                                <p style="font-weight: bold;">SBI_Statement_April_2024.pdf</p>
                                <p style="color: #9ca3af; font-size: 14px;">2.4 MB</p>
                            </div>
                        </div>
                    </div>
                    <div style="margin-top: 16px; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <div style="border: 2px solid #374151; border-top: 2px solid #3b82f6; border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;"></div>
                            <span style="color: #60a5fa;">Processing your statement...</span>
                        </div>
                    </div>
                </div>
            \`;
            
            setTimeout(() => {
                document.getElementById('upload-section').classList.add('hidden');
                document.getElementById('analytics-section').classList.remove('hidden');
            }, 3000);
        }
    </script>
    
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</body>
</html>
`

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(htmlContent)
})

server.listen(PORT, () => {
  console.log(`🚀 ExpenseAI Frontend running on http://localhost:${PORT}`)
  console.log(`📱 Open your browser and visit: http://localhost:${PORT}`)
  console.log(`✅ This is a working version of your ExpenseAI app!`)
})
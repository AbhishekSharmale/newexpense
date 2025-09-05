const http = require('http')
const PORT = 3002

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ExpenseAI - Modern UI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-50: #eff6ff;
            --primary-100: #dbeafe;
            --primary-200: #bfdbfe;
            --primary-300: #93c5fd;
            --primary-400: #60a5fa;
            --primary-500: #3b82f6;
            --primary-600: #2563eb;
            --primary-700: #1d4ed8;
            --primary-800: #1e40af;
            --primary-900: #1e3a8a;
            
            --gray-50: #f9fafb;
            --gray-100: #f3f4f6;
            --gray-200: #e5e7eb;
            --gray-300: #d1d5db;
            --gray-400: #9ca3af;
            --gray-500: #6b7280;
            --gray-600: #4b5563;
            --gray-700: #374151;
            --gray-800: #1f2937;
            --gray-900: #111827;
            
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            
            --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            --gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            
            --border-radius-sm: 0.375rem;
            --border-radius-md: 0.5rem;
            --border-radius-lg: 0.75rem;
            --border-radius-xl: 1rem;
            --border-radius-2xl: 1.5rem;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: white;
            line-height: 1.6;
            overflow-x: hidden;
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
        }

        /* Modern Background */
        .bg-pattern {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
            z-index: -1;
        }

        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Modern Typography */
        .text-display {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -0.02em;
        }

        .text-heading {
            font-size: clamp(1.5rem, 3vw, 2.25rem);
            font-weight: 700;
            line-height: 1.2;
            letter-spacing: -0.01em;
        }

        .text-body {
            font-size: 1.125rem;
            font-weight: 400;
            line-height: 1.7;
        }

        .text-caption {
            font-size: 0.875rem;
            font-weight: 500;
            line-height: 1.4;
        }

        /* Modern Header */
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            backdrop-filter: blur(20px) saturate(180%);
            background: rgba(10, 10, 10, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            animation: slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
        }

        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logo:hover {
            transform: scale(1.05);
            filter: brightness(1.2);
        }

        /* Modern Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: var(--border-radius-lg);
            font-family: inherit;
            font-size: 0.875rem;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
            transform: translateX(-100%);
            transition: transform 0.6s;
        }

        .btn:hover::before {
            transform: translateX(100%);
        }

        .btn-primary {
            background: var(--gradient-primary);
            color: white;
            box-shadow: var(--shadow-lg);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-xl);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        /* Hero Section */
        .hero {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 8rem 2rem 4rem;
        }

        .hero-content {
            max-width: 800px;
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }

        .hero-title {
            background: linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%);
            background-size: 200% 200%;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: gradientShift 4s ease-in-out infinite;
            margin-bottom: 1.5rem;
        }

        .hero-subtitle {
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 2rem;
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
        }

        .hero-cta {
            display: flex;
            flex-direction: column;
            sm:flex-direction: row;
            gap: 1rem;
            align-items: center;
            justify-content: center;
            animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both;
        }

        /* Modern Cards */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            padding: 4rem 2rem;
        }

        .feature-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius-2xl);
            padding: 2rem;
            text-align: center;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: var(--gradient-primary);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: inherit;
        }

        .feature-card:hover {
            transform: translateY(-8px) scale(1.02);
            border-color: rgba(255, 255, 255, 0.2);
            box-shadow: var(--shadow-2xl);
        }

        .feature-card:hover::before {
            opacity: 0.1;
        }

        .feature-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            display: inline-block;
            position: relative;
            z-index: 1;
            animation: float 3s ease-in-out infinite;
        }

        .feature-title {
            margin-bottom: 0.75rem;
            position: relative;
            z-index: 1;
        }

        .feature-description {
            color: rgba(255, 255, 255, 0.7);
            position: relative;
            z-index: 1;
        }

        /* Dashboard Styles */
        .dashboard {
            min-height: 100vh;
            padding-top: 5rem;
        }

        .dashboard-header {
            background: rgba(10, 10, 10, 0.9);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 1.5rem 0;
            position: sticky;
            top: 4rem;
            z-index: 100;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: var(--border-radius-xl);
            padding: 1.5rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: var(--gradient-primary);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
            transform: scaleX(1);
        }

        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-xl);
            border-color: rgba(255, 255, 255, 0.2);
        }

        .stat-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 0.5rem;
            font-weight: 500;
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 800;
            font-family: 'JetBrains Mono', monospace;
            margin-bottom: 0.25rem;
        }

        .stat-change {
            font-size: 0.75rem;
            font-weight: 600;
            opacity: 0.8;
        }

        /* Upload Area */
        .upload-area {
            border: 2px dashed rgba(255, 255, 255, 0.2);
            border-radius: var(--border-radius-2xl);
            padding: 3rem;
            text-align: center;
            cursor: pointer;
            margin: 2rem 0;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(10px);
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
            background: var(--gradient-primary);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .upload-area:hover {
            border-color: var(--primary-400);
            transform: scale(1.02);
            box-shadow: var(--shadow-xl);
        }

        .upload-area:hover::before {
            opacity: 0.05;
        }

        .upload-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
            opacity: 0.8;
            position: relative;
            z-index: 1;
        }

        /* Animations */
        @keyframes slideDown {
            from {
                transform: translateY(-100%);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes fadeInUp {
            from {
                transform: translateY(40px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes gradientShift {
            0%, 100% {
                background-position: 0% 50%;
            }
            50% {
                background-position: 100% 50%;
            }
        }

        @keyframes float {
            0%, 100% {
                transform: translateY(0px);
            }
            50% {
                transform: translateY(-10px);
            }
        }

        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.8;
            }
        }

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }

        /* Utility Classes */
        .hidden {
            display: none !important;
        }

        .loading-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top: 2px solid var(--primary-400);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .container {
                padding: 0 1rem;
            }
            
            .hero {
                padding: 6rem 1rem 2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
                padding: 2rem 1rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* Modern Scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }
    </style>
</head>
<body>
    <div class="bg-pattern"></div>
    
    <!-- Landing Page -->
    <div id="landing">
        <header class="header">
            <div class="header-content">
                <div class="logo" onclick="showLanding()">ExpenseAI</div>
                <button class="btn btn-secondary" onclick="showAuth()">Sign In</button>
            </div>
        </header>

        <section class="hero">
            <div class="hero-content">
                <h1 class="text-display hero-title">
                    Transform Your UPI Statements Into Smart Financial Insights
                </h1>
                <p class="text-body hero-subtitle">
                    AI-powered expense tracking built specifically for Indian spending patterns. 
                    Upload your bank statement and get instant categorization, predictions, and actionable insights.
                </p>
                <div class="hero-cta">
                    <button class="btn btn-primary" onclick="showAuth()">
                        Get Started Free
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                    <p class="text-caption" style="color: rgba(255, 255, 255, 0.6);">
                        ✨ Free forever • 🔒 100% private • ⚡ Instant insights
                    </p>
                </div>
            </div>
        </section>

        <section class="container">
            <div class="features-grid">
                <div class="feature-card" onclick="animateCard(this)">
                    <div class="feature-icon">🧠</div>
                    <h3 class="text-heading feature-title">AI Categorization</h3>
                    <p class="feature-description">
                        Advanced ML models understand PhonePe, GPay, Paytm transactions with 95% accuracy
                    </p>
                </div>
                
                <div class="feature-card" onclick="animateCard(this)">
                    <div class="feature-icon">🛡️</div>
                    <h3 class="text-heading feature-title">Privacy First</h3>
                    <p class="feature-description">
                        Client-side processing, zero data storage, bank-grade security with end-to-end encryption
                    </p>
                </div>
                
                <div class="feature-card" onclick="animateCard(this)">
                    <div class="feature-icon">📈</div>
                    <h3 class="text-heading feature-title">Smart Predictions</h3>
                    <p class="feature-description">
                        Forecast spending patterns, track financial goals, optimize EMIs and cashback rewards
                    </p>
                </div>
                
                <div class="feature-card" onclick="animateCard(this)">
                    <div class="feature-icon">⚡</div>
                    <h3 class="text-heading feature-title">Instant Insights</h3>
                    <p class="feature-description">
                        Festival budgets, subscription tracking, spending triggers with real-time notifications
                    </p>
                </div>
            </div>
        </section>
    </div>

    <!-- Auth Page -->
    <div id="auth" class="hidden">
        <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;">
            <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 3rem; max-width: 400px; width: 100%; text-align: center;">
                <h1 class="text-heading" style="margin-bottom: 1rem;">Welcome to ExpenseAI</h1>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
                    Sign in to start tracking your expenses with AI-powered insights
                </p>
                
                <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" onclick="showDashboard()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>
                
                <button style="background: none; border: none; color: rgba(255, 255, 255, 0.6); cursor: pointer; font-size: 0.875rem;" onclick="showLanding()">
                    ← Back to Home
                </button>
            </div>
        </div>
    </div>

    <!-- Dashboard -->
    <div id="dashboard" class="hidden dashboard">
        <header class="header">
            <div class="header-content">
                <div class="logo">ExpenseAI Dashboard</div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: rgba(255, 255, 255, 0.7); font-size: 0.875rem;">Welcome, Demo User</span>
                    <button class="btn btn-secondary" onclick="showLanding()">Logout</button>
                </div>
            </div>
        </header>

        <div class="container" style="padding-top: 2rem;">
            <div id="upload-section">
                <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                    <h2 class="text-heading" style="margin-bottom: 1rem;">Upload Your First Statement</h2>
                    <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 2rem;">
                        Get instant AI-powered insights from your bank statement
                    </p>
                    
                    <div class="upload-area" onclick="simulateUpload()">
                        <div class="upload-icon">📄</div>
                        <h3 class="text-heading" style="margin-bottom: 0.5rem; position: relative; z-index: 1;">Upload Bank Statement</h3>
                        <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 1rem; position: relative; z-index: 1;">
                            Drag & drop your PDF statement or click to browse
                        </p>
                        <p class="text-caption" style="color: rgba(255, 255, 255, 0.5); position: relative; z-index: 1;">
                            Supports SBI, HDFC, ICICI, Axis Bank statements
                        </p>
                    </div>
                </div>
            </div>

            <div id="analytics-section" class="hidden">
                <div class="stats-grid">
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <div class="stat-label">Total Spent</div>
                        <div class="stat-value" style="color: #ef4444;" data-value="47580">₹0</div>
                        <div class="stat-change" style="color: #ef4444;">↑ 12% from last month</div>
                    </div>
                    
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <div class="stat-label">Income</div>
                        <div class="stat-value" style="color: #10b981;" data-value="75000">₹0</div>
                        <div class="stat-change" style="color: #10b981;">↑ 5% from last month</div>
                    </div>
                    
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <div class="stat-label">Savings</div>
                        <div class="stat-value" style="color: #3b82f6;" data-value="27420">₹0</div>
                        <div class="stat-change" style="color: #10b981;">↑ 8% from last month</div>
                    </div>
                    
                    <div class="stat-card" onclick="animateStatCard(this)">
                        <div class="stat-label">Savings Rate</div>
                        <div class="stat-value" style="color: #f59e0b;">36.6%</div>
                        <div class="stat-change" style="color: #10b981;">↑ 2.1% from last month</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; margin: 3rem 0;">
                    <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 2rem;">
                        <h3 class="text-heading" style="margin-bottom: 1.5rem;">Spending Categories</h3>
                        <div id="category-list">
                            <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); opacity: 0;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 12px; height: 12px; background: #ef4444; border-radius: 50%;"></div>
                                    <span>Food & Dining</span>
                                </div>
                                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">₹15,420</span>
                            </div>
                            <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); opacity: 0;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 12px; height: 12px; background: #f97316; border-radius: 50%;"></div>
                                    <span>Transportation</span>
                                </div>
                                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">₹8,340</span>
                            </div>
                            <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255, 255, 255, 0.1); opacity: 0;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 12px; height: 12px; background: #eab308; border-radius: 50%;"></div>
                                    <span>Shopping</span>
                                </div>
                                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">₹12,680</span>
                            </div>
                            <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; opacity: 0;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 12px; height: 12px; background: #22c55e; border-radius: 50%;"></div>
                                    <span>Entertainment</span>
                                </div>
                                <span style="font-family: 'JetBrains Mono', monospace; font-weight: 600;">₹4,250</span>
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 2rem;">
                        <h3 class="text-heading" style="margin-bottom: 1.5rem;">AI Insights</h3>
                        <div class="insight-item" style="padding: 1rem; background: rgba(251, 191, 36, 0.1); border: 1px solid #f59e0b; border-radius: 0.75rem; margin-bottom: 1rem; color: #fbbf24; opacity: 0;">
                            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                                <span style="font-size: 1.25rem;">💡</span>
                                <div>
                                    <strong>Spending Alert</strong>
                                    <p style="margin-top: 0.25rem; font-size: 0.875rem; opacity: 0.9;">
                                        You spent 23% more on food delivery this month. Consider cooking at home to save ₹3,500/month.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="insight-item" style="padding: 1rem; background: rgba(74, 222, 128, 0.1); border: 1px solid #10b981; border-radius: 0.75rem; margin-bottom: 1rem; color: #4ade80; opacity: 0;">
                            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                                <span style="font-size: 1.25rem;">✅</span>
                                <div>
                                    <strong>Good News</strong>
                                    <p style="margin-top: 0.25rem; font-size: 0.875rem; opacity: 0.9;">
                                        Your transportation costs decreased by 15% due to work from home days.
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="insight-item" style="padding: 1rem; background: rgba(96, 165, 250, 0.1); border: 1px solid #3b82f6; border-radius: 0.75rem; color: #60a5fa; opacity: 0;">
                            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                                <span style="font-size: 1.25rem;">📊</span>
                                <div>
                                    <strong>Prediction</strong>
                                    <p style="margin-top: 0.25rem; font-size: 0.875rem; opacity: 0.9;">
                                        At current spending rate, you'll save ₹32,000 by month end. On track for your bike goal!
                                    </p>
                                </div>
                            </div>
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

        function animateCard(card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            }, 100);
        }

        function animateStatCard(card) {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'translateY(-4px)';
            }, 200);
        }

        function countUp(element, target) {
            let current = 0;
            const increment = target / 60;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = '₹' + Math.floor(current).toLocaleString('en-IN');
            }, 25);
        }

        function simulateUpload() {
            document.getElementById('upload-section').innerHTML = \`
                <div style="max-width: 600px; margin: 0 auto;">
                    <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1rem; padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; animation: fadeInUp 0.5s ease-out;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="font-size: 2rem;">📄</div>
                            <div>
                                <p style="font-weight: 600; margin-bottom: 0.25rem;">SBI_Statement_April_2024.pdf</p>
                                <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">2.4 MB • Processing...</p>
                            </div>
                        </div>
                        <div class="loading-spinner"></div>
                    </div>
                    <div style="margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 0.75rem; text-align: center;">
                        <span style="color: #60a5fa; font-weight: 500;">🤖 AI is analyzing your transactions...</span>
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
                }, 300);
                
                // Animate category items
                setTimeout(() => {
                    const categoryItems = document.querySelectorAll('.category-item');
                    categoryItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateX(0)';
                            item.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                        }, index * 150);
                    });
                }, 800);
                
                // Animate insights
                setTimeout(() => {
                    const insightItems = document.querySelectorAll('.insight-item');
                    insightItems.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                            item.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                        }, index * 200);
                    });
                }, 1200);
                
            }, 3500);
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
  console.log(`🚀 ExpenseAI Modern UI running on http://localhost:${PORT}`)
  console.log(`✨ Features: Inter font, modern design system, smooth animations`)
  console.log(`🎨 Design: Glassmorphism, proper spacing, professional typography`)
})
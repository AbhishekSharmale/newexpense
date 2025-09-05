class BehaviorAnalyzer {
  static analyzeSpendingPersonality(transactions) {
    const patterns = this.detectPatterns(transactions)
    const personality = this.determinePersonality(patterns)
    
    return {
      type: personality.type,
      confidence: personality.confidence,
      insights: personality.insights,
      recommendations: personality.recommendations,
      patterns
    }
  }
  
  static detectPatterns(transactions) {
    const weekendSpending = this.analyzeWeekendSpending(transactions)
    const timeBasedSpending = this.analyzeTimeBasedSpending(transactions)
    const stressSpending = this.analyzeStressSpending(transactions)
    const socialSpending = this.analyzeSocialSpending(transactions)
    
    return {
      weekendSpending,
      timeBasedSpending,
      stressSpending,
      socialSpending
    }
  }
  
  static analyzeWeekendSpending(transactions) {
    const weekendTxns = transactions.filter(tx => {
      const day = new Date(tx.date).getDay()
      return day === 0 || day === 6 // Sunday or Saturday
    })
    
    const weekendAmount = weekendTxns.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const totalAmount = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const weekendPercentage = (weekendAmount / totalAmount) * 100
    
    return {
      percentage: weekendPercentage,
      amount: weekendAmount,
      isSignificant: weekendPercentage > 50
    }
  }
  
  static analyzeTimeBasedSpending(transactions) {
    const hourlySpending = {}
    
    transactions.forEach(tx => {
      // Mock hour extraction (in real app, would parse timestamp)
      const hour = Math.floor(Math.random() * 24)
      hourlySpending[hour] = (hourlySpending[hour] || 0) + Math.abs(tx.amount)
    })
    
    const peakHours = Object.entries(hourlySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
    
    return {
      peakHours,
      lateNightSpending: peakHours.some(h => h >= 22 || h <= 6),
      workHourSpending: peakHours.some(h => h >= 9 && h <= 17)
    }
  }
  
  static analyzeStressSpending(transactions) {
    // Detect days with multiple small transactions (stress indicator)
    const dailyTransactions = {}
    
    transactions.forEach(tx => {
      const date = tx.date
      if (!dailyTransactions[date]) {
        dailyTransactions[date] = []
      }
      dailyTransactions[date].push(tx)
    })
    
    const stressDays = Object.entries(dailyTransactions)
      .filter(([date, txns]) => {
        const smallTxns = txns.filter(tx => Math.abs(tx.amount) < 500)
        return smallTxns.length >= 3 // 3+ small transactions in a day
      })
    
    return {
      stressDaysCount: stressDays.length,
      isStressSpender: stressDays.length > transactions.length * 0.1
    }
  }
  
  static analyzeSocialSpending(transactions) {
    const socialCategories = ['Food & Dining', 'Entertainment']
    const eveningTxns = transactions.filter(tx => {
      // Mock evening detection
      return Math.random() > 0.7 // 30% chance of being evening
    })
    
    const socialTxns = eveningTxns.filter(tx => 
      socialCategories.includes(tx.category)
    )
    
    const avgSocialAmount = socialTxns.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) / socialTxns.length || 0
    
    return {
      socialTransactions: socialTxns.length,
      avgAmount: avgSocialAmount,
      isSocialSpender: avgSocialAmount > 800
    }
  }
  
  static determinePersonality(patterns) {
    const personalities = []
    
    // Weekend Warrior
    if (patterns.weekendSpending.isSignificant) {
      personalities.push({
        type: "Weekend Warrior",
        confidence: Math.min(patterns.weekendSpending.percentage, 95),
        insights: [
          `You spend ${patterns.weekendSpending.percentage.toFixed(1)}% of your money on weekends`,
          `Weekend spending: ₹${patterns.weekendSpending.amount.toLocaleString()}`
        ],
        recommendations: [
          "Set a weekend budget to control leisure spending",
          "Plan weekday activities to balance your spending",
          "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings"
        ]
      })
    }
    
    // Stress Spender
    if (patterns.stressSpending.isStressSpender) {
      personalities.push({
        type: "Stress Spender",
        confidence: 80,
        insights: [
          `${patterns.stressSpending.stressDaysCount} high-transaction days detected`,
          "Multiple small purchases often indicate stress spending"
        ],
        recommendations: [
          "Try the 24-hour rule before non-essential purchases",
          "Use meditation apps when feeling urge to shop",
          "Set up automatic savings to reduce available spending money"
        ]
      })
    }
    
    // Social Spender
    if (patterns.socialSpending.isSocialSpender) {
      personalities.push({
        type: "Social Spender",
        confidence: 75,
        insights: [
          `Average social spending: ₹${patterns.socialSpending.avgAmount.toFixed(0)}`,
          `${patterns.socialSpending.socialTransactions} social transactions detected`
        ],
        recommendations: [
          "Set a monthly 'social budget' of ₹3,000",
          "Suggest cheaper alternatives when friends invite you out",
          "Use apps to split bills fairly with friends"
        ]
      })
    }
    
    // Late Night Spender
    if (patterns.timeBasedSpending.lateNightSpending) {
      personalities.push({
        type: "Night Owl Spender",
        confidence: 70,
        insights: [
          "Significant spending happens after 10 PM",
          "Late night purchases are often impulsive"
        ],
        recommendations: [
          "Enable spending limits after 10 PM",
          "Remove saved payment methods from shopping apps",
          "Set phone to 'Do Not Disturb' for shopping notifications"
        ]
      })
    }
    
    // Return primary personality or default
    return personalities.length > 0 ? personalities[0] : {
      type: "Balanced Spender",
      confidence: 60,
      insights: ["Your spending patterns are well-balanced across different times and categories"],
      recommendations: [
        "Continue your disciplined approach",
        "Consider increasing your savings rate by 5%",
        "Explore investment options for long-term growth"
      ]
    }
  }
  
  static generatePredictiveAlerts(transactions, currentMonth) {
    const alerts = []
    
    // Monthly overspend prediction
    const monthlySpending = this.calculateMonthlyProjection(transactions)
    if (monthlySpending.projectedOverspend > 0) {
      alerts.push({
        type: 'overspend_warning',
        urgency: 'high',
        title: 'Overspend Alert',
        message: `At this pace, you'll overspend by ₹${monthlySpending.projectedOverspend.toLocaleString()} this month`,
        actions: [
          { label: 'See spending breakdown', action: 'view_categories' },
          { label: 'Set daily limit', action: 'set_daily_limit' },
          { label: 'Move money to savings', action: 'transfer_savings' }
        ]
      })
    }
    
    // Category overspend
    const categoryAlerts = this.detectCategoryOverspend(transactions)
    alerts.push(...categoryAlerts)
    
    // Surplus detection
    const surplus = this.detectSurplus(transactions)
    if (surplus.amount > 0) {
      alerts.push({
        type: 'surplus_opportunity',
        urgency: 'low',
        title: 'Investment Opportunity',
        message: `You have ₹${surplus.amount.toLocaleString()} surplus this month. Perfect time to invest!`,
        actions: [
          { label: 'Start SIP', action: 'start_sip' },
          { label: 'Add to emergency fund', action: 'add_emergency' },
          { label: 'Boost savings goal', action: 'boost_goal' }
        ]
      })
    }
    
    return alerts
  }
  
  static calculateMonthlyProjection(transactions) {
    const currentDate = new Date()
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    const daysPassed = currentDate.getDate()
    
    const monthlySpending = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    
    const projectedMonthlySpending = (monthlySpending / daysPassed) * daysInMonth
    const assumedBudget = 25000 // Mock budget
    
    return {
      current: monthlySpending,
      projected: projectedMonthlySpending,
      budget: assumedBudget,
      projectedOverspend: Math.max(0, projectedMonthlySpending - assumedBudget)
    }
  }
  
  static detectCategoryOverspend(transactions) {
    const categorySpending = {}
    const categoryBudgets = {
      'Food & Dining': 8000,
      'Transportation': 3000,
      'Shopping': 5000,
      'Entertainment': 2000
    }
    
    transactions.filter(tx => tx.amount < 0).forEach(tx => {
      categorySpending[tx.category] = (categorySpending[tx.category] || 0) + Math.abs(tx.amount)
    })
    
    const alerts = []
    Object.entries(categorySpending).forEach(([category, spent]) => {
      const budget = categoryBudgets[category]
      if (budget && spent > budget * 0.8) {
        alerts.push({
          type: 'category_warning',
          urgency: spent > budget ? 'high' : 'medium',
          title: `${category} Budget Alert`,
          message: `You've spent ₹${spent.toLocaleString()} of ₹${budget.toLocaleString()} ${category} budget`,
          actions: [
            { label: 'See transactions', action: `view_${category.toLowerCase()}` },
            { label: 'Adjust budget', action: `adjust_${category.toLowerCase()}` }
          ]
        })
      }
    })
    
    return alerts
  }
  
  static detectSurplus(transactions) {
    const income = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const expenses = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    
    const surplus = income - expenses - 15000 // Assuming ₹15k monthly expenses baseline
    
    return {
      amount: Math.max(0, surplus),
      percentage: surplus > 0 ? (surplus / income) * 100 : 0
    }
  }
}

module.exports = BehaviorAnalyzer
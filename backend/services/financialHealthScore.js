class FinancialHealthScore {
  static calculateScore(userData) {
    const components = {
      emergencyFund: this.calculateEmergencyFundScore(userData),
      debtRatio: this.calculateDebtScore(userData),
      savingsRate: this.calculateSavingsRate(userData),
      spendingDiscipline: this.calculateSpendingDiscipline(userData),
      investmentDiversification: this.calculateInvestmentScore(userData)
    }
    
    const weights = {
      emergencyFund: 25,
      debtRatio: 25,
      savingsRate: 20,
      spendingDiscipline: 15,
      investmentDiversification: 15
    }
    
    const totalScore = Object.keys(components).reduce((total, component) => {
      return total + (components[component].score * weights[component] / 100)
    }, 0)
    
    return {
      overallScore: Math.round(totalScore * 10) / 10,
      components,
      recommendations: this.generateRecommendations(components),
      trend: this.calculateTrend(userData),
      nextMilestone: this.getNextMilestone(totalScore)
    }
  }
  
  static calculateEmergencyFundScore(userData) {
    const monthlyExpenses = userData.monthlyExpenses || 25000
    const emergencyFund = userData.emergencyFund || 0
    const monthsCovered = emergencyFund / monthlyExpenses
    
    let score = 0
    let status = 'critical'
    let message = ''
    
    if (monthsCovered >= 6) {
      score = 10
      status = 'excellent'
      message = `${monthsCovered.toFixed(1)} months covered - excellent safety net!`
    } else if (monthsCovered >= 3) {
      score = 7 + (monthsCovered - 3) * 1 // 7-10 range
      status = 'good'
      message = `${monthsCovered.toFixed(1)} months covered - good foundation`
    } else if (monthsCovered >= 1) {
      score = 4 + (monthsCovered - 1) * 1.5 // 4-7 range
      status = 'fair'
      message = `${monthsCovered.toFixed(1)} months covered - needs improvement`
    } else {
      score = monthsCovered * 4 // 0-4 range
      status = 'critical'
      message = 'Emergency fund critically low'
    }
    
    return {
      score: Math.round(score * 10) / 10,
      status,
      message,
      monthsCovered: monthsCovered.toFixed(1),
      target: '6 months of expenses',
      improvement: monthsCovered < 6 ? `Add ₹${((6 - monthsCovered) * monthlyExpenses).toLocaleString()} to reach target` : null
    }
  }
  
  static calculateDebtScore(userData) {
    const monthlyIncome = userData.monthlyIncome || 50000
    const monthlyDebtPayments = userData.monthlyDebtPayments || 0
    const debtRatio = (monthlyDebtPayments / monthlyIncome) * 100
    
    let score = 0
    let status = 'excellent'
    let message = ''
    
    if (debtRatio <= 10) {
      score = 10
      status = 'excellent'
      message = `Only ${debtRatio.toFixed(1)}% of income goes to debt`
    } else if (debtRatio <= 20) {
      score = 8 - (debtRatio - 10) * 0.2 // 8-10 range
      status = 'good'
      message = `${debtRatio.toFixed(1)}% debt ratio - manageable level`
    } else if (debtRatio <= 36) {
      score = 5 - (debtRatio - 20) * 0.1875 // 5-8 range
      status = 'fair'
      message = `${debtRatio.toFixed(1)}% debt ratio - consider debt reduction`
    } else {
      score = Math.max(0, 5 - (debtRatio - 36) * 0.1) // 0-5 range
      status = 'critical'
      message = `${debtRatio.toFixed(1)}% debt ratio - urgent attention needed`
    }
    
    return {
      score: Math.round(score * 10) / 10,
      status,
      message,
      debtRatio: debtRatio.toFixed(1) + '%',
      target: '<20% of income',
      improvement: debtRatio > 20 ? `Reduce debt payments by ₹${((debtRatio - 20) * monthlyIncome / 100).toLocaleString()}/month` : null
    }
  }
  
  static calculateSavingsRate(userData) {
    const monthlyIncome = userData.monthlyIncome || 50000
    const monthlySavings = userData.monthlySavings || 0
    const savingsRate = (monthlySavings / monthlyIncome) * 100
    
    let score = 0
    let status = 'critical'
    let message = ''
    
    if (savingsRate >= 30) {
      score = 10
      status = 'excellent'
      message = `${savingsRate.toFixed(1)}% savings rate - exceptional!`
    } else if (savingsRate >= 20) {
      score = 7 + (savingsRate - 20) * 0.3 // 7-10 range
      status = 'good'
      message = `${savingsRate.toFixed(1)}% savings rate - great job!`
    } else if (savingsRate >= 10) {
      score = 4 + (savingsRate - 10) * 0.3 // 4-7 range
      status = 'fair'
      message = `${savingsRate.toFixed(1)}% savings rate - room for improvement`
    } else {
      score = savingsRate * 0.4 // 0-4 range
      status = 'critical'
      message = `${savingsRate.toFixed(1)}% savings rate - needs immediate attention`
    }
    
    return {
      score: Math.round(score * 10) / 10,
      status,
      message,
      savingsRate: savingsRate.toFixed(1) + '%',
      target: '>20% of income',
      improvement: savingsRate < 20 ? `Increase savings by ₹${((20 - savingsRate) * monthlyIncome / 100).toLocaleString()}/month` : null
    }
  }
  
  static calculateSpendingDiscipline(userData) {
    const budgetAdherence = userData.budgetAdherence || 0.6 // 60% default
    const score = budgetAdherence * 10
    
    let status = 'critical'
    let message = ''
    
    if (budgetAdherence >= 0.9) {
      status = 'excellent'
      message = `${(budgetAdherence * 100).toFixed(0)}% budget adherence - excellent discipline!`
    } else if (budgetAdherence >= 0.8) {
      status = 'good'
      message = `${(budgetAdherence * 100).toFixed(0)}% budget adherence - good control`
    } else if (budgetAdherence >= 0.6) {
      status = 'fair'
      message = `${(budgetAdherence * 100).toFixed(0)}% budget adherence - needs improvement`
    } else {
      status = 'critical'
      message = `${(budgetAdherence * 100).toFixed(0)}% budget adherence - poor discipline`
    }
    
    return {
      score: Math.round(score * 10) / 10,
      status,
      message,
      adherence: (budgetAdherence * 100).toFixed(0) + '%',
      target: '>80% adherence',
      improvement: budgetAdherence < 0.8 ? 'Set up automatic savings and spending alerts' : null
    }
  }
  
  static calculateInvestmentScore(userData) {
    const investments = userData.investments || {}
    const totalInvestments = Object.values(investments).reduce((sum, val) => sum + val, 0)
    const monthlyIncome = userData.monthlyIncome || 50000
    const investmentRate = (totalInvestments / (monthlyIncome * 12)) * 100
    
    // Diversification score
    const investmentTypes = Object.keys(investments).length
    const diversificationScore = Math.min(investmentTypes * 2, 10) // Max 5 types = 10 points
    
    // Investment rate score
    let rateScore = 0
    if (investmentRate >= 15) rateScore = 10
    else if (investmentRate >= 10) rateScore = 7 + (investmentRate - 10) * 0.6
    else if (investmentRate >= 5) rateScore = 4 + (investmentRate - 5) * 0.6
    else rateScore = investmentRate * 0.8
    
    const score = (diversificationScore * 0.4) + (rateScore * 0.6)
    
    let status = 'critical'
    let message = ''
    
    if (score >= 8) {
      status = 'excellent'
      message = `Well diversified portfolio with ${investmentRate.toFixed(1)}% investment rate`
    } else if (score >= 6) {
      status = 'good'
      message = `Good investment foundation - ${investmentTypes} asset classes`
    } else if (score >= 4) {
      status = 'fair'
      message = `Basic investments in place - consider diversification`
    } else {
      status = 'critical'
      message = 'Investment portfolio needs development'
    }
    
    return {
      score: Math.round(score * 10) / 10,
      status,
      message,
      investmentRate: investmentRate.toFixed(1) + '%',
      diversification: `${investmentTypes} asset classes`,
      target: '>10% in diversified portfolio',
      improvement: score < 8 ? 'Start SIP investments and diversify across asset classes' : null
    }
  }
  
  static generateRecommendations(components) {
    const recommendations = []
    
    // Priority recommendations based on lowest scores
    const sortedComponents = Object.entries(components)
      .sort(([,a], [,b]) => a.score - b.score)
    
    sortedComponents.slice(0, 3).forEach(([component, data]) => {
      if (data.improvement) {
        recommendations.push({
          priority: component === sortedComponents[0][0] ? 'high' : 'medium',
          category: component,
          title: this.getRecommendationTitle(component),
          description: data.improvement,
          impact: this.getImpactDescription(component),
          timeframe: this.getTimeframe(component)
        })
      }
    })
    
    return recommendations
  }
  
  static getRecommendationTitle(component) {
    const titles = {
      emergencyFund: 'Build Emergency Fund',
      debtRatio: 'Reduce Debt Burden',
      savingsRate: 'Increase Savings Rate',
      spendingDiscipline: 'Improve Budget Control',
      investmentDiversification: 'Start Investing'
    }
    return titles[component] || 'Improve Financial Health'
  }
  
  static getImpactDescription(component) {
    const impacts = {
      emergencyFund: 'Protects against financial emergencies and reduces stress',
      debtRatio: 'Frees up income for savings and investments',
      savingsRate: 'Accelerates wealth building and financial independence',
      spendingDiscipline: 'Ensures consistent progress toward financial goals',
      investmentDiversification: 'Builds long-term wealth and beats inflation'
    }
    return impacts[component] || 'Improves overall financial stability'
  }
  
  static getTimeframe(component) {
    const timeframes = {
      emergencyFund: '6-12 months',
      debtRatio: '12-24 months',
      savingsRate: '3-6 months',
      spendingDiscipline: '1-3 months',
      investmentDiversification: '3-6 months'
    }
    return timeframes[component] || '6 months'
  }
  
  static calculateTrend(userData) {
    // Mock trend calculation (in real app, would compare historical data)
    const trendValue = (Math.random() - 0.5) * 1 // -0.5 to +0.5
    
    return {
      direction: trendValue > 0 ? 'improving' : 'declining',
      change: Math.abs(trendValue).toFixed(1),
      period: 'last 3 months'
    }
  }
  
  static getNextMilestone(currentScore) {
    const milestones = [
      { score: 5, title: 'Financial Foundation', description: 'Basic financial stability achieved' },
      { score: 6.5, title: 'Getting Stronger', description: 'Building good financial habits' },
      { score: 8, title: 'Financially Healthy', description: 'Strong financial position' },
      { score: 9, title: 'Financial Excellence', description: 'Exceptional financial management' },
      { score: 10, title: 'Financial Mastery', description: 'Perfect financial health score' }
    ]
    
    const nextMilestone = milestones.find(m => m.score > currentScore)
    
    return nextMilestone || {
      score: 10,
      title: 'Maintain Excellence',
      description: 'Keep up your excellent financial habits'
    }
  }
}

module.exports = FinancialHealthScore
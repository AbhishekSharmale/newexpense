const pdf = require('pdf-parse')
const BankParsers = require('./bankParsers')
const MerchantCategorizer = require('./merchantCategorizer')

class PDFProcessor {
  async extractTransactions(buffer) {
    try {
      const data = await pdf(buffer)
      const text = data.text
      
      // Use rule-based bank parsing
      const parseResult = BankParsers.parse(text)
      
      // Categorize each transaction
      const categorizedTransactions = parseResult.transactions.map(transaction => 
        MerchantCategorizer.processTransaction(transaction)
      )
      
      return {
        bank: parseResult.bank,
        bankName: parseResult.bankName,
        transactions: categorizedTransactions,
        summary: this.generateSummary(categorizedTransactions)
      }
    } catch (error) {
      throw new Error(`PDF processing failed: ${error.message}`)
    }
  }
  
  generateSummary(transactions) {
    const totalSpent = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
      
    const categories = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})
      
    const needsReview = transactions.filter(t => t.needsReview).length
    const avgConfidence = transactions.reduce((sum, t) => sum + t.confidence, 0) / transactions.length
    
    return {
      totalTransactions: transactions.length,
      totalSpent,
      totalIncome,
      savings: totalIncome - totalSpent,
      categories,
      needsReview,
      avgConfidence: Math.round(avgConfidence)
    }
  }
}

module.exports = new PDFProcessor()
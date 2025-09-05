const OpenAI = require('openai')

class AICategorizer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  }

  async categorizeTransactions(transactions) {
    const prompt = `Categorize these Indian UPI transactions into categories like Food & Dining, Transportation, Shopping, Entertainment, Utilities, Healthcare, Education, Investment/Savings, EMI/Loans.

Transactions:
${transactions.map(t => `${t.description}: ₹${Math.abs(t.amount)}`).join('\n')}

Return JSON array with category for each transaction:`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1
      })

      const categories = JSON.parse(response.choices[0].message.content)
      
      return transactions.map((transaction, index) => ({
        ...transaction,
        category: categories[index] || 'Other'
      }))
    } catch (error) {
      // Fallback to rule-based categorization
      return this.fallbackCategorization(transactions)
    }
  }

  fallbackCategorization(transactions) {
    const rules = {
      'Food & Dining': ['zomato', 'swiggy', 'restaurant', 'food', 'cafe'],
      'Transportation': ['uber', 'ola', 'petrol', 'fuel', 'metro'],
      'Shopping': ['amazon', 'flipkart', 'myntra', 'shopping'],
      'Entertainment': ['netflix', 'spotify', 'movie', 'game'],
      'Utilities': ['electricity', 'internet', 'mobile', 'recharge']
    }

    return transactions.map(transaction => {
      const desc = transaction.description.toLowerCase()
      
      for (const [category, keywords] of Object.entries(rules)) {
        if (keywords.some(keyword => desc.includes(keyword))) {
          return { ...transaction, category }
        }
      }
      
      return { ...transaction, category: 'Other' }
    })
  }
}

module.exports = new AICategorizer()
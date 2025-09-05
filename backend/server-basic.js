const express = require('express')

const app = express()
const PORT = 5000

// Basic middleware
app.use(express.json())
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'ExpenseAI Backend Running'
  })
})

app.post('/api/process-statement', (req, res) => {
  console.log('Processing statement...')
  
  // Mock response for demo
  setTimeout(() => {
    res.json({
      status: 'success',
      message: 'Statement processed successfully',
      transactions: [
        { date: '01/04/2024', description: 'UPI-ZOMATO-DELIVERY', amount: -340, category: 'Food & Dining' },
        { date: '02/04/2024', description: 'UPI-UBER-RIDE', amount: -180, category: 'Transportation' },
        { date: '03/04/2024', description: 'SALARY-CREDIT', amount: 75000, category: 'Income' },
        { date: '04/04/2024', description: 'UPI-AMAZON-SHOPPING', amount: -1250, category: 'Shopping' }
      ],
      summary: {
        totalSpent: 47580,
        totalIncome: 75000,
        savings: 27420,
        categories: {
          'Food & Dining': 15420,
          'Transportation': 8340,
          'Shopping': 12680,
          'Entertainment': 4250
        }
      }
    })
  }, 2000) // 2 second delay to simulate processing
})

app.listen(PORT, () => {
  console.log(`🚀 ExpenseAI Backend running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Frontend should be at: http://localhost:3000`)
})
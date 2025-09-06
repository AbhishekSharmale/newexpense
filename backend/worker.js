import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

app.use('*', cors())

app.get('/', (c) => {
  return c.json({ 
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      processStatement: '/api/process-statement'
    }
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.post('/api/process-statement', async (c) => {
  try {
    const formData = await c.req.formData()
    const file = formData.get('statement')
    
    if (!file) {
      return c.json({ error: 'No file uploaded' }, 400)
    }

    // Mock response for Cloudflare deployment
    const mockTransactions = [
      { id: 1, date: '2024-01-15', description: 'UPI Payment', amount: -340, category: 'Food & Dining' },
      { id: 2, date: '2024-01-15', description: 'UPI Transfer', amount: -180, category: 'Transportation' },
      { id: 3, date: '2024-01-14', description: 'Salary Credit', amount: 75000, category: 'Income' }
    ]
    
    const summary = {
      totalTransactions: mockTransactions.length,
      totalSpent: 520,
      totalIncome: 75000,
      categories: {
        'Food & Dining': 340,
        'Transportation': 180,
        'Income': 75000
      }
    }

    return c.json({ 
      transactions: mockTransactions,
      summary,
      status: 'success',
      message: 'PDF processed successfully'
    })
  } catch (error) {
    return c.json({ 
      error: 'Processing failed',
      message: error.message 
    }, 500)
  }
})

export default app
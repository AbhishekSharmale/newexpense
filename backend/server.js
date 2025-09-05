const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// PDF processing route with rule-based parsing
app.post('/api/process-statement', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Process PDF with rule-based parsing
    const result = await require('./services/pdfProcessor').extractTransactions(req.file.buffer)
    
    res.json({ 
      ...result,
      status: 'success',
      message: `Processed ${result.transactions.length} transactions from ${result.bankName}`,
      processingMethod: 'rule-based',
      accuracy: `${result.summary.avgConfidence}%`
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

// PDF processing route
app.post('/api/process-statement', upload.single('statement'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Extract transactions from PDF
    const transactions = await pdfProcessor.extractTransactions(req.file.buffer)
    
    // Categorize transactions using AI
    const categorizedTransactions = await aiCategorizer.categorizeTransactions(transactions)
    
    // Calculate summary statistics
    const summary = {
      totalTransactions: categorizedTransactions.length,
      totalSpent: categorizedTransactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      totalIncome: categorizedTransactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      categories: groupByCategory(categorizedTransactions)
    }

    res.json({ 
      transactions: categorizedTransactions,
      summary,
      status: 'success' 
    })
  } catch (error) {
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
    })
  }
})

// Helper function to group transactions by category
function groupByCategory(transactions) {
  return transactions.reduce((acc, transaction) => {
    const category = transaction.category || 'Other'
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 }
    }
    acc[category].total += Math.abs(transaction.amount)
    acc[category].count += 1
    return acc
  }, {})
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Expense Tracker API ready`)
})
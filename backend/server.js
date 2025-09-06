const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const multer = require('multer')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 4005

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false
}))
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.get('/', (req, res) => {
  res.json({ 
    message: 'Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      processStatement: '/api/process-statement'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/test', (req, res) => {
  res.json({ message: 'API is working!', port: 4005 })
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

    // Process PDF using real PDF processor
    const pdfProcessor = require('./services/pdfProcessor')
    const result = await pdfProcessor.extractTransactions(req.file.buffer)
    
    res.json({ 
      transactions: result.transactions,
      summary: result.summary,
      bankName: result.bankName,
      status: 'success',
      message: `Processed ${result.transactions.length} transactions from ${result.bankName}`,
      processingMethod: 'rule-based'
    })
  } catch (error) {
    console.error('PDF processing error:', error)
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 Expense Tracker API ready`)
  console.log(`🔗 Test at: http://localhost:${PORT}/test`)
})
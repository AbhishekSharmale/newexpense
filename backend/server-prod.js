const express = require('express')
const multer = require('multer')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')
const pdfProcessor = require('./services/pdfProcessor')
const secureFileHandler = require('./services/secureFileHandler')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting - 10 uploads per 15 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many uploads. Please try again later.' }
})

// Body parsing
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Configure multer for secure file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Keep in memory for security
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  }
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ExpenseAI API',
    version: '1.0.0'
  })
})

// Main PDF processing endpoint
app.post('/api/process-statement', uploadLimiter, upload.single('statement'), async (req, res) => {
  const startTime = Date.now()
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a PDF bank statement to upload'
      })
    }

    console.log(`📄 Processing ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)}KB)`)

    // Process PDF directly from memory buffer (most secure)
    const result = await secureFileHandler.processInMemory(
      req.file.buffer, 
      pdfProcessor.extractTransactions.bind(pdfProcessor)
    )

    const processingTime = Date.now() - startTime

    // Log success (without sensitive data)
    console.log(`✅ Processed ${result.transactions.length} transactions from ${result.bankName} in ${processingTime}ms`)

    res.json({
      ...result,
      status: 'success',
      processingTime,
      message: `Successfully processed ${result.transactions.length} transactions`,
      metadata: {
        filename: req.file.originalname,
        fileSize: req.file.size,
        processingTime,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    console.error(`❌ Processing failed: ${error.message}`)
    
    res.status(500).json({
      error: 'Processing failed',
      message: error.message,
      processingTime,
      timestamp: new Date().toISOString()
    })
  }
})

// Batch processing endpoint (for multiple statements)
app.post('/api/process-batch', uploadLimiter, upload.array('statements', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }

    const results = []
    
    for (const file of req.files) {
      try {
        const result = await secureFileHandler.processInMemory(
          file.buffer,
          pdfProcessor.extractTransactions.bind(pdfProcessor)
        )
        
        results.push({
          filename: file.originalname,
          status: 'success',
          ...result
        })
      } catch (error) {
        results.push({
          filename: file.originalname,
          status: 'error',
          error: error.message
        })
      }
    }

    res.json({
      status: 'completed',
      processed: results.length,
      results
    })

  } catch (error) {
    res.status(500).json({
      error: 'Batch processing failed',
      message: error.message
    })
  }
})

// Get supported banks
app.get('/api/supported-banks', (req, res) => {
  res.json({
    banks: [
      { code: 'SBI', name: 'State Bank of India', supported: true },
      { code: 'HDFC', name: 'HDFC Bank', supported: true },
      { code: 'ICICI', name: 'ICICI Bank', supported: true },
      { code: 'AXIS', name: 'Axis Bank', supported: false },
      { code: 'KOTAK', name: 'Kotak Mahindra Bank', supported: false }
    ],
    totalSupported: 3,
    coverage: '85% of Indian banking transactions'
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Please upload a file smaller than 10MB'
      })
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Invalid file',
        message: 'Only PDF files are allowed'
      })
    }
  }
  
  res.status(500).json({
    error: 'Server error',
    message: error.message
  })
})

// Cleanup old temp files every hour
setInterval(() => {
  secureFileHandler.cleanupOldFiles()
}, 60 * 60 * 1000)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...')
  secureFileHandler.cleanupOldFiles()
  process.exit(0)
})

app.listen(PORT, () => {
  console.log(`🚀 ExpenseAI Production API running on port ${PORT}`)
  console.log(`🔒 Security: Rate limiting, file validation, secure processing`)
  console.log(`📊 Features: Real PDF processing, batch uploads, auto-cleanup`)
  console.log(`🏦 Banks: SBI, HDFC, ICICI supported`)
})
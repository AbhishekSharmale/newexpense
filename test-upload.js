const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const PORT = 5000

// Enable CORS for all origins
app.use(cors())
app.use(express.json())

// Simple multer setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

// Serve the HTML content
app.get('/', (req, res) => {
  const htmlContent = fs.readFileSync(path.join(__dirname, 'frontend', 'upload-prod.html'), 'utf8')
  res.send(htmlContent)
})

// Test upload endpoint
app.post('/api/process-statement', upload.single('statement'), (req, res) => {
  console.log('📄 File received:', req.file ? req.file.originalname : 'No file')
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  // Mock response for testing
  res.json({
    status: 'success',
    bankName: 'Test Bank',
    processingTime: 150,
    transactions: [
      {
        date: '2024-01-15',
        description: 'UPI-ZOMATO-DELIVERY',
        amount: -340,
        category: 'Food & Dining'
      },
      {
        date: '2024-01-16', 
        description: 'SALARY CREDIT',
        amount: 50000,
        category: 'Income'
      }
    ]
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`)
  console.log(`📄 Upload test ready - try uploading a PDF`)
})
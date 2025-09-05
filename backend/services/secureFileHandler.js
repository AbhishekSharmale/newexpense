const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

class SecureFileHandler {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp')
    this.ensureTempDir()
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true })
    }
  }

  generateSecureFilename(originalName) {
    const timestamp = Date.now()
    const random = crypto.randomBytes(8).toString('hex')
    const ext = path.extname(originalName)
    return `${timestamp}_${random}${ext}`
  }

  async storeTempFile(buffer, originalName) {
    const filename = this.generateSecureFilename(originalName)
    const filepath = path.join(this.tempDir, filename)
    
    // Write file with restricted permissions
    fs.writeFileSync(filepath, buffer, { mode: 0o600 })
    
    // Set auto-cleanup timer (5 minutes)
    setTimeout(() => {
      this.deleteFile(filepath)
    }, 5 * 60 * 1000)
    
    return filepath
  }

  deleteFile(filepath) {
    try {
      if (fs.existsSync(filepath)) {
        // Overwrite with random data before deletion (secure delete)
        const stats = fs.statSync(filepath)
        const randomData = crypto.randomBytes(stats.size)
        fs.writeFileSync(filepath, randomData)
        fs.unlinkSync(filepath)
        console.log(`🗑️ Securely deleted: ${path.basename(filepath)}`)
      }
    } catch (error) {
      console.error('Error deleting file:', error.message)
    }
  }

  async processInMemory(buffer, processor) {
    // Process PDF directly from buffer without saving to disk
    try {
      const result = await processor(buffer)
      return result
    } catch (error) {
      throw new Error(`In-memory processing failed: ${error.message}`)
    }
  }

  cleanupOldFiles() {
    // Clean up any files older than 1 hour
    try {
      const files = fs.readdirSync(this.tempDir)
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      
      files.forEach(file => {
        const filepath = path.join(this.tempDir, file)
        const stats = fs.statSync(filepath)
        
        if (stats.mtime.getTime() < oneHourAgo) {
          this.deleteFile(filepath)
        }
      })
    } catch (error) {
      console.error('Cleanup error:', error.message)
    }
  }
}

module.exports = new SecureFileHandler()
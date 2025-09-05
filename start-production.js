const { spawn } = require('child_process')
const http = require('http')
const fs = require('fs')
const path = require('path')

const BACKEND_PORT = 5000
const FRONTEND_PORT = 3000

// Start backend server
console.log('🚀 Starting ExpenseAI Production...')

const backend = spawn('node', ['backend/server-prod.js'], {
  stdio: 'inherit',
  cwd: __dirname
})

// Frontend server
const frontendHtml = fs.readFileSync(path.join(__dirname, 'frontend/upload-prod.html'), 'utf8')

const frontendServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(frontendHtml)
})

frontendServer.listen(FRONTEND_PORT, () => {
  console.log(`✅ Backend API: http://localhost:${BACKEND_PORT}`)
  console.log(`✅ Frontend UI: http://localhost:${FRONTEND_PORT}`)
  console.log(`📄 Ready to process real bank statements!`)
})

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...')
  backend.kill()
  frontendServer.close()
  process.exit(0)
})
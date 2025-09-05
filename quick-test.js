const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
      <h1>ExpenseAI Upload Test</h1>
      <p>Server is working on port 8080!</p>
      <input type="file" accept=".pdf">
      <button>Upload PDF</button>
    `)
  }
})

server.listen(8080, () => {
  console.log('✅ Server running on http://localhost:8080')
  console.log('📄 Try uploading a PDF file')
})
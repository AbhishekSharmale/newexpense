const http = require('http')
const pdf = require('pdf-parse')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>PDF Analyzer</title>
    <style>
        body { font-family: Arial; background: #111; color: white; padding: 20px; }
        .upload { border: 2px dashed #666; padding: 40px; text-align: center; margin: 20px 0; cursor: pointer; }
        button { background: #00d4aa; color: white; padding: 15px 30px; border: none; border-radius: 5px; }
        #output { background: #222; padding: 20px; border-radius: 5px; white-space: pre-wrap; font-family: monospace; }
    </style>
</head>
<body>
    <h1>📄 PDF Text Analyzer</h1>
    <p>Upload your bank statement to see the raw text format</p>
    
    <div class="upload" onclick="document.getElementById('file').click()">
        <input type="file" id="file" accept=".pdf" style="display:none">
        <h2>Click to Upload PDF</h2>
        <p id="filename"></p>
    </div>
    
    <button onclick="analyzePDF()" id="analyzeBtn" disabled>Analyze PDF Text</button>
    
    <div id="output"></div>

    <script>
        let selectedFile = null;
        
        document.getElementById('file').onchange = function(e) {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                document.getElementById('filename').textContent = '✅ ' + selectedFile.name;
                document.getElementById('analyzeBtn').disabled = false;
            }
        }
        
        async function analyzePDF() {
            if (!selectedFile) return;
            
            document.getElementById('output').textContent = 'Analyzing PDF...';
            
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            
            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.text();
                document.getElementById('output').textContent = result;
            } catch (error) {
                document.getElementById('output').textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
    `)
  } else if (req.url === '/analyze' && req.method === 'POST') {
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('📄 Analyzing PDF...')
        
        // Extract text from PDF
        const pdfData = await pdf(body)
        const text = pdfData.text
        
        console.log('✅ PDF text extracted, length:', text.length)
        
        // Return formatted analysis
        const analysis = `
PDF ANALYSIS RESULTS:
=====================

Total Characters: ${text.length}
Total Lines: ${text.split('\n').length}

RAW TEXT CONTENT:
=================
${text}

LINE-BY-LINE BREAKDOWN:
=======================
${text.split('\n').map((line, i) => `${i+1}: ${line}`).join('\n')}
        `
        
        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end(analysis)
        
      } catch (error) {
        console.error('❌ PDF analysis failed:', error.message)
        res.writeHead(500, { 'Content-Type': 'text/plain' })
        res.end('PDF analysis failed: ' + error.message)
      }
    })
  }
})

server.listen(1111, () => {
  console.log('🔍 PDF Analyzer running on http://localhost:1111')
  console.log('📄 Upload your bank statement to see the exact text format')
})
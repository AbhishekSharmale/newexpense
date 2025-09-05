const http = require('http')

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`)
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>ExpenseAI Debug</title>
    <style>
        body { font-family: Arial; background: #111; color: white; padding: 20px; }
        .upload { border: 2px dashed #666; padding: 40px; text-align: center; margin: 20px 0; cursor: pointer; }
        .upload:hover { border-color: #00d4aa; }
        button { background: #00d4aa; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; }
        #result { margin-top: 20px; padding: 20px; background: #222; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🚀 ExpenseAI - Upload Test</h1>
    
    <div class="upload" onclick="document.getElementById('file').click()">
        <input type="file" id="file" accept=".pdf" style="display:none">
        <h2>📄 Click to Upload PDF</h2>
        <p>Select your bank statement</p>
        <p id="filename"></p>
    </div>
    
    <button onclick="uploadFile()" id="uploadBtn" disabled>Process Statement</button>
    
    <div id="result"></div>

    <script>
        let selectedFile = null;
        
        document.getElementById('file').onchange = function(e) {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                document.getElementById('filename').textContent = '✅ ' + selectedFile.name;
                document.getElementById('uploadBtn').disabled = false;
            }
        }
        
        async function uploadFile() {
            if (!selectedFile) return;
            
            document.getElementById('result').innerHTML = '⏳ Processing...';
            
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.text();
                document.getElementById('result').innerHTML = '✅ ' + result;
            } catch (error) {
                document.getElementById('result').innerHTML = '❌ Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
    `)
  } else if (req.url === '/upload' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Upload successful! File received.')
  } else {
    res.writeHead(404)
    res.end('Not found')
  }
})

server.listen(4444, () => {
  console.log('✅ Debug server running on http://localhost:4444')
  console.log('📄 Test the upload functionality')
})
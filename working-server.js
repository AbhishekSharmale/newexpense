const http = require('http')
const pdf = require('pdf-parse')
const ICICIParser = require('./backend/services/iciciParser')
const MerchantCategorizer = require('./backend/services/merchantCategorizer')

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`
<!DOCTYPE html>
<html>
<head>
    <title>ExpenseAI - Working Upload</title>
    <style>
        body { font-family: Arial; background: #111; color: white; padding: 20px; }
        .upload { border: 2px dashed #666; padding: 40px; text-align: center; margin: 20px 0; cursor: pointer; }
        .upload:hover { border-color: #00d4aa; }
        button { background: #00d4aa; color: white; padding: 15px 30px; border: none; border-radius: 5px; font-size: 16px; }
        .result { margin-top: 20px; padding: 20px; background: #222; border-radius: 5px; }
        .transaction { padding: 10px; margin: 5px 0; background: #333; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>📄 ExpenseAI - Upload Test</h1>
    
    <div class="upload" onclick="document.getElementById('file').click()">
        <input type="file" id="file" accept=".pdf" style="display:none">
        <h2>Click to Upload ICICI PDF</h2>
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
            
            document.getElementById('result').innerHTML = '⏳ Processing PDF...';
            
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.error) {
                    document.getElementById('result').innerHTML = '❌ Error: ' + result.error;
                    return;
                }
                
                // Display results
                let html = '<h3>✅ Processing Complete!</h3>';
                html += '<p><strong>Bank:</strong> ' + result.bankName + '</p>';
                html += '<p><strong>Transactions:</strong> ' + result.transactions.length + '</p>';
                
                html += '<h4>Transactions:</h4>';
                result.transactions.forEach(tx => {
                    const color = tx.amount < 0 ? '#ff6b6b' : '#51cf66';
                    html += \`
                        <div class="transaction">
                            <strong>\${tx.description}</strong><br>
                            <span style="color: \${color}">₹\${Math.abs(tx.amount).toLocaleString()}</span> • 
                            <span>\${tx.category}</span> • 
                            <span>\${tx.date}</span>
                        </div>
                    \`;
                });
                
                document.getElementById('result').innerHTML = html;
                
            } catch (error) {
                document.getElementById('result').innerHTML = '❌ Error: ' + error.message;
            }
        }
    </script>
</body>
</html>
    `)
  } else if (req.url === '/upload' && req.method === 'POST') {
    let body = Buffer.alloc(0)
    
    req.on('data', chunk => {
      body = Buffer.concat([body, chunk])
    })
    
    req.on('end', async () => {
      try {
        console.log('📄 Processing PDF upload...')
        
        // Extract PDF text
        const pdfData = await pdf(body)
        const text = pdfData.text
        
        console.log('✅ PDF text extracted, length:', text.length)
        
        // Parse transactions
        const transactions = ICICIParser.parseTransactions(text)
        console.log('✅ Parsed transactions:', transactions.length)
        
        // Categorize transactions
        const categorizedTransactions = transactions.map(transaction => 
          MerchantCategorizer.processTransaction(transaction)
        )
        
        const result = {
          bank: 'ICICI',
          bankName: 'ICICI Bank',
          transactions: categorizedTransactions,
          processingTime: Date.now()
        }
        
        console.log('✅ Processing complete:', categorizedTransactions.length, 'transactions')
        
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(result))
        
      } catch (error) {
        console.error('❌ Processing failed:', error.message)
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    })
  }
})

server.listen(9090, () => {
  console.log('🚀 Working ExpenseAI on http://localhost:9090')
  console.log('📄 Simple upload test - should work!')
})
const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>ExpenseAI Upload Test</title>
    <style>
        body { font-family: Arial, sans-serif; background: #111; color: white; padding: 20px; }
        .upload-area { border: 2px dashed #666; padding: 40px; text-align: center; margin: 20px 0; }
        button { background: #0066cc; color: white; padding: 10px 20px; border: none; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>ExpenseAI - PDF Upload Test</h1>
    
    <div class="upload-area" onclick="document.getElementById('file').click()">
        <input type="file" id="file" accept=".pdf" style="display:none">
        <h3>Click to Upload PDF</h3>
        <p>Select your bank statement PDF</p>
    </div>
    
    <button onclick="uploadFile()">Process PDF</button>
    
    <div id="result"></div>

    <script>
        let selectedFile = null;
        
        document.getElementById('file').onchange = function(e) {
            selectedFile = e.target.files[0];
            if (selectedFile) {
                document.querySelector('.upload-area h3').textContent = selectedFile.name;
            }
        }
        
        async function uploadFile() {
            if (!selectedFile) {
                alert('Please select a PDF first');
                return;
            }
            
            const formData = new FormData();
            formData.append('statement', selectedFile);
            
            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                document.getElementById('result').innerHTML = '<h3>Success!</h3><pre>' + JSON.stringify(result, null, 2) + '</pre>';
            } catch (error) {
                document.getElementById('result').innerHTML = '<h3>Error: ' + error.message + '</h3>';
            }
        }
    </script>
</body>
</html>
  `)
})

app.post('/upload', (req, res) => {
  res.json({ message: 'Upload endpoint working!', timestamp: new Date() })
})

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})
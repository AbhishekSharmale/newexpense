export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData()
    const file = formData.get('statement')
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Adobe PDF Extract API
    const arrayBuffer = await file.arrayBuffer()
    const base64PDF = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    const adobeResponse = await fetch('https://pdf-services.adobe.io/operation/extractpdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + await getAdobeToken(),
        'x-api-key': '40468cc0b9bd4471a4156759a7cdde87'
      },
      body: JSON.stringify({
        assetID: await uploadToAdobe(base64PDF),
        getCharBounds: false,
        includeStyling: false
      })
    })
    
    if (!adobeResponse.ok) {
      throw new Error('Adobe API failed')
    }
    
    const extractResult = await adobeResponse.json()
    const text = extractResult.elements?.map(el => el.Text).join(' ') || ''
    
    // Parse ICICI transactions from extracted text
    const transactions = parseICICITransactions(text)
    
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    
    return new Response(JSON.stringify({ 
      transactions,
      summary: {
        totalTransactions: transactions.length,
        totalSpent,
        totalIncome,
        savings: totalIncome - totalSpent,
        categories: categorizeTransactions(transactions)
      },
      status: 'success',
      message: `Processed ${transactions.length} real transactions`
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Processing failed',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

async function getAdobeToken() {
  const response = await fetch('https://ims-na1.adobelogin.com/ims/token/v1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: '40468cc0b9bd4471a4156759a7cdde87',
      client_secret: 'your_client_secret_here',
      grant_type: 'client_credentials',
      scope: 'openid,AdobeID,read_organizations'
    })
  })
  const data = await response.json()
  return data.access_token
}

async function uploadToAdobe(base64PDF) {
  // Simplified - would need proper Adobe asset upload
  return 'asset-id-placeholder'
}

function parseICICITransactions(text) {
  const transactions = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.match(/\d{2}-\d{2}-\d{4}/) && line.match(/\d+\.\d{2}/)) {
      const dateMatch = line.match(/(\d{2}-\d{2}-\d{4})/)
      const amountMatch = line.match(/(\d+\.\d{2})/g)
      
      if (dateMatch && amountMatch) {
        const [day, month, year] = dateMatch[1].split('-')
        transactions.push({
          date: `${year}-${month}-${day}`,
          description: line.replace(/\d+\.\d{2}/g, '').trim(),
          amount: line.includes('Dr') ? -parseFloat(amountMatch[0]) : parseFloat(amountMatch[0]),
          category: categorizeDescription(line)
        })
      }
    }
  }
  
  return transactions
}

function categorizeDescription(desc) {
  if (desc.includes('UPI')) return 'UPI Payment'
  if (desc.includes('EMI')) return 'Loan EMI'
  if (desc.includes('SALARY')) return 'Income'
  return 'Other'
}

function categorizeTransactions(transactions) {
  return transactions.reduce((acc, t) => {
    if (t.amount < 0) {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
    }
    return acc
  }, {})
}
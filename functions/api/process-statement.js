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

    // Convert file to base64 for PDF.co API
    const arrayBuffer = await file.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    
    // Extract text using PDF.co API
    const pdfResponse = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'demo' // Free tier
      },
      body: JSON.stringify({
        file: `data:application/pdf;base64,${base64}`,
        inline: true
      })
    })
    
    if (!pdfResponse.ok) {
      throw new Error('PDF extraction failed')
    }
    
    const pdfResult = await pdfResponse.json()
    const extractedText = pdfResult.body || ''
    
    // Parse ICICI transactions from extracted text
    const transactions = parseICICITransactions(extractedText)
    
    if (transactions.length === 0) {
      throw new Error('No transactions found in PDF')
    }
    
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    
    const categories = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})
    
    return new Response(JSON.stringify({ 
      transactions,
      summary: {
        totalTransactions: transactions.length,
        totalSpent,
        totalIncome,
        savings: totalIncome - totalSpent,
        categories
      },
      bankName: 'ICICI Bank',
      status: 'success',
      message: `Processed ${transactions.length} transactions from PDF`
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

function parseICICITransactions(text) {
  const transactions = []
  const lines = text.split('\n')
  
  let currentTransaction = null
  let isInTransactionSection = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Start of transaction section
    if (line.includes('DATEMODEPARTICULARSDEPOSITSWITHDRAWALSBALANCE') || 
        line.includes('Date') && line.includes('Particulars')) {
      isInTransactionSection = true
      continue
    }
    
    // End of transaction section
    if (line.includes('Total:') || line.includes('Page ')) {
      isInTransactionSection = false
      break
    }
    
    if (!isInTransactionSection) continue
    
    // Skip empty lines and B/F entries
    if (!line || line.includes('B/F')) continue
    
    // Check if line starts with date pattern (DD-MM-YYYY)
    const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/)
    
    if (dateMatch) {
      // Save previous transaction if exists
      if (currentTransaction) {
        transactions.push(processTransaction(currentTransaction))
      }
      
      // Start new transaction
      currentTransaction = {
        date: dateMatch[1],
        description: '',
        amount: 0,
        balance: 0,
        rawLines: [line]
      }
      
      // Extract description and amounts from current line
      const afterDate = line.substring(dateMatch[0].length).trim()
      
      // Look for amount patterns at the end
      const amountMatch = afterDate.match(/(.+?)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/)
      
      if (amountMatch) {
        currentTransaction.description = amountMatch[1].trim()
        currentTransaction.amount = -parseFloat(amountMatch[2].replace(/,/g, ''))
        currentTransaction.balance = parseFloat(amountMatch[3].replace(/,/g, ''))
      } else {
        // Check for deposit pattern
        const depositMatch = afterDate.match(/(.+?)(\d{1,3}(?:,\d{3})*\.\d{2})\s+(\d{1,3}(?:,\d{3})*\.\d{2})$/)
        if (depositMatch) {
          currentTransaction.description = depositMatch[1].trim()
          currentTransaction.amount = parseFloat(depositMatch[2].replace(/,/g, ''))
          currentTransaction.balance = parseFloat(depositMatch[3].replace(/,/g, ''))
        } else {
          currentTransaction.description = afterDate
        }
      }
    } else if (currentTransaction) {
      // Continuation line - add to description
      currentTransaction.rawLines.push(line)
      
      // Check if this line has amounts
      const amountMatch = line.match(/(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/)
      if (amountMatch) {
        currentTransaction.amount = -parseFloat(amountMatch[1].replace(/,/g, ''))
        currentTransaction.balance = parseFloat(amountMatch[2].replace(/,/g, ''))
      } else {
        // Check for deposit pattern
        const depositMatch = line.match(/(\d{1,3}(?:,\d{3})*\.\d{2})\s+(\d{1,3}(?:,\d{3})*\.\d{2})$/)
        if (depositMatch) {
          currentTransaction.amount = parseFloat(depositMatch[1].replace(/,/g, ''))
          currentTransaction.balance = parseFloat(depositMatch[2].replace(/,/g, ''))
        } else if (line.trim()) {
          currentTransaction.description += ' ' + line.trim()
        }
      }
    }
  }
  
  // Add last transaction
  if (currentTransaction) {
    transactions.push(processTransaction(currentTransaction))
  }
  
  return transactions
}

function processTransaction(txn) {
  // Clean up description
  let description = txn.description
    .replace(/\s+/g, ' ')
    .replace(/CMS TRANSACTION\s*/i, '')
    .replace(/NET BANKING\s*/i, '')
    .trim()
  
  // Format date to YYYY-MM-DD
  const [day, month, year] = txn.date.split('-')
  const formattedDate = `${year}-${month}-${day}`
  
  // Categorize transaction
  let category = 'Other'
  if (description.includes('UPI')) category = 'UPI Payment'
  else if (description.includes('EMI')) category = 'Loan EMI'
  else if (description.includes('SALARY')) category = 'Income'
  else if (description.includes('Flipkart')) category = 'Shopping'
  else if (description.includes('Spotify')) category = 'Entertainment'
  else if (description.includes('CREDIT CARD')) category = 'Credit Card'
  
  return {
    date: formattedDate,
    description,
    amount: txn.amount,
    balance: txn.balance,
    type: txn.amount > 0 ? 'CREDIT' : 'DEBIT',
    category
  }
}
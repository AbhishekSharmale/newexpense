const pdf = require('pdf-parse')
const formidable = require('formidable')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const form = formidable()
    const [fields, files] = await form.parse(req)
    
    const file = files.statement?.[0]
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Read PDF file
    const fs = require('fs')
    const buffer = fs.readFileSync(file.filepath)
    
    // Extract text from PDF
    const data = await pdf(buffer)
    const text = data.text
    
    // Parse ICICI transactions
    const transactions = parseICICITransactions(text)
    
    if (transactions.length === 0) {
      return res.status(400).json({ 
        error: 'No transactions found',
        debug: {
          textLength: text.length,
          textSample: text.substring(0, 500)
        }
      })
    }
    
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
    
    const categories = transactions
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount)
        return acc
      }, {})
    
    res.json({
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
      message: `Processed ${transactions.length} transactions`
    })
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Processing failed',
      message: error.message 
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
    
    if (line.includes('DATEMODEPARTICULARSDEPOSITSWITHDRAWALSBALANCE')) {
      isInTransactionSection = true
      continue
    }
    
    if (line.includes('Total:') || line.includes('Page ')) {
      isInTransactionSection = false
      break
    }
    
    if (!isInTransactionSection) continue
    if (!line || line.includes('B/F')) continue
    
    const dateMatch = line.match(/^(\d{2}-\d{2}-\d{4})/)
    
    if (dateMatch) {
      if (currentTransaction) {
        transactions.push(processTransaction(currentTransaction))
      }
      
      currentTransaction = {
        date: dateMatch[1],
        description: '',
        amount: 0,
        balance: 0,
        rawLines: [line]
      }
      
      const afterDate = line.substring(dateMatch[0].length).trim()
      const amountMatch = afterDate.match(/(.+?)(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/)
      
      if (amountMatch) {
        currentTransaction.description = amountMatch[1].trim()
        currentTransaction.amount = -parseFloat(amountMatch[2].replace(/,/g, ''))
        currentTransaction.balance = parseFloat(amountMatch[3].replace(/,/g, ''))
      } else {
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
      currentTransaction.rawLines.push(line)
      
      const amountMatch = line.match(/(\d{1,3}(?:,\d{3})*\.\d{2})(\d{1,3}(?:,\d{3})*\.\d{2})$/)
      if (amountMatch) {
        currentTransaction.amount = -parseFloat(amountMatch[1].replace(/,/g, ''))
        currentTransaction.balance = parseFloat(amountMatch[2].replace(/,/g, ''))
      } else {
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
  
  if (currentTransaction) {
    transactions.push(processTransaction(currentTransaction))
  }
  
  return transactions
}

function processTransaction(txn) {
  let description = txn.description
    .replace(/\s+/g, ' ')
    .replace(/CMS TRANSACTION\s*/i, '')
    .replace(/NET BANKING\s*/i, '')
    .trim()
  
  const [day, month, year] = txn.date.split('-')
  const formattedDate = `${year}-${month}-${day}`
  
  let category = 'Other'
  if (description.includes('UPI')) category = 'UPI Payment'
  else if (description.includes('EMI')) category = 'Loan EMI'
  else if (description.includes('SALARY')) category = 'Income'
  else if (description.includes('Flipkart')) category = 'Shopping'
  else if (description.includes('Spotify')) category = 'Entertainment'
  
  return {
    date: formattedDate,
    description,
    amount: txn.amount,
    balance: txn.balance,
    type: txn.amount > 0 ? 'CREDIT' : 'DEBIT',
    category
  }
}
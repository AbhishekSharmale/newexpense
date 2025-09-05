class ICICIParser {
  static parseTransactions(text) {
    const transactions = []
    const lines = text.split('\n')
    
    let currentTransaction = null
    let isInTransactionSection = false
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      // Start of transaction section
      if (line.includes('DATEMODEPARTICULARSDEPOSITSWITHDRAWALSBALANCE')) {
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
          transactions.push(this.processTransaction(currentTransaction))
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
      transactions.push(this.processTransaction(currentTransaction))
    }
    
    return transactions
  }
  
  static processTransaction(txn) {
    // Clean up description
    let description = txn.description
      .replace(/\s+/g, ' ')
      .replace(/CMS TRANSACTION\s*/i, '')
      .replace(/NET BANKING\s*/i, '')
      .trim()
    
    // Format date to YYYY-MM-DD
    const [day, month, year] = txn.date.split('-')
    const formattedDate = `${year}-${month}-${day}`
    
    return {
      date: formattedDate,
      description,
      amount: txn.amount,
      balance: txn.balance,
      type: txn.amount > 0 ? 'CREDIT' : 'DEBIT',
      raw: txn.rawLines.join(' ')
    }
  }
}

module.exports = ICICIParser
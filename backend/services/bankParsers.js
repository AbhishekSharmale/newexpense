class BankParsers {
  static SBI = {
    name: 'State Bank of India',
    patterns: {
      transaction: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(Dr|Cr)\s+([\d,]+\.\d{2})/g,
      upi: /UPI-(.+?)-(.+?)(?:-|$)/,
      imps: /IMPS-(.+?)-(.+?)(?:-|$)/,
      neft: /NEFT-(.+?)-(.+?)(?:-|$)/,
      balance: /Balance\s+([\d,]+\.\d{2})/
    },
    
    parseTransactions(text) {
      const transactions = []
      let match
      
      while ((match = this.patterns.transaction.exec(text)) !== null) {
        const [, date, description, type, amount] = match
        
        transactions.push({
          date: this.formatDate(date),
          description: description.trim(),
          amount: type === 'Dr' ? -parseFloat(amount.replace(/,/g, '')) : parseFloat(amount.replace(/,/g, '')),
          type: type === 'Dr' ? 'DEBIT' : 'CREDIT',
          raw: match[0]
        })
      }
      
      return transactions
    },
    
    formatDate(dateStr) {
      const [day, month, year] = dateStr.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  static HDFC = {
    name: 'HDFC Bank',
    patterns: {
      transaction: /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(Dr|Cr)/g,
      upi: /UPI\/(.+?)\/(.+?)\/(.+?)\//,
      imps: /IMPS\/(.+?)\/(.+?)\//
    },
    
    parseTransactions(text) {
      const transactions = []
      let match
      
      while ((match = this.patterns.transaction.exec(text)) !== null) {
        const [, date, description, amount, type] = match
        
        transactions.push({
          date: this.formatDate(date),
          description: description.trim(),
          amount: type === 'Dr' ? -parseFloat(amount.replace(/,/g, '')) : parseFloat(amount.replace(/,/g, '')),
          type: type === 'Dr' ? 'DEBIT' : 'CREDIT',
          raw: match[0]
        })
      }
      
      return transactions
    },
    
    formatDate(dateStr) {
      const [day, month, year] = dateStr.split('/')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  static ICICI = {
    name: 'ICICI Bank',
    patterns: {
      transaction: /(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/g,
      upi: /UPI-(.+?)-(.+?)$/
    },
    
    parseTransactions(text) {
      const transactions = []
      const lines = text.split('\n')
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        const match = line.match(/(\d{2}-\d{2}-\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+([\d,]+\.\d{2})/)
        
        if (match) {
          const [, date, description, debit, credit] = match
          const amount = debit !== '0.00' ? -parseFloat(debit.replace(/,/g, '')) : parseFloat(credit.replace(/,/g, ''))
          
          transactions.push({
            date: this.formatDate(date),
            description: description.trim(),
            amount,
            type: amount < 0 ? 'DEBIT' : 'CREDIT',
            raw: line
          })
        }
      }
      
      return transactions
    },
    
    formatDate(dateStr) {
      const [day, month, year] = dateStr.split('-')
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    }
  }

  static detectBank(text) {
    if (text.includes('STATE BANK OF INDIA') || text.includes('SBI')) return 'SBI'
    if (text.includes('HDFC BANK') || text.includes('HDFC')) return 'HDFC'
    if (text.includes('ICICI BANK') || text.includes('ICICI')) return 'ICICI'
    if (text.includes('AXIS BANK') || text.includes('AXIS')) return 'AXIS'
    if (text.includes('KOTAK MAHINDRA') || text.includes('KOTAK')) return 'KOTAK'
    return 'UNKNOWN'
  }

  static parse(text) {
    const bankType = this.detectBank(text)
    const parser = this[bankType]
    
    if (!parser) {
      throw new Error(`Unsupported bank: ${bankType}`)
    }
    
    return {
      bank: bankType,
      bankName: parser.name,
      transactions: parser.parseTransactions(text)
    }
  }
}

module.exports = BankParsers
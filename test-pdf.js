const fs = require('fs')
const pdfProcessor = require('./backend/services/pdfProcessor')

async function testPDF() {
  try {
    const pdfBuffer = fs.readFileSync('./Statement_2025MTH08_318582332.pdf')
    console.log('Processing ICICI statement...')
    
    const result = await pdfProcessor.extractTransactions(pdfBuffer)
    
    console.log('\n=== PROCESSING RESULTS ===')
    console.log(`Bank: ${result.bankName}`)
    console.log(`Total Transactions: ${result.transactions.length}`)
    console.log(`Total Spent: ₹${result.summary.totalSpent}`)
    console.log(`Total Income: ₹${result.summary.totalIncome}`)
    console.log(`Savings: ₹${result.summary.savings}`)
    
    console.log('\n=== SAMPLE TRANSACTIONS ===')
    result.transactions.slice(0, 5).forEach((txn, i) => {
      console.log(`${i+1}. ${txn.date} | ${txn.description} | ₹${txn.amount} | ${txn.category || 'Uncategorized'}`)
    })
    
    console.log('\n=== CATEGORIES ===')
    Object.entries(result.summary.categories).forEach(([cat, amount]) => {
      console.log(`${cat}: ₹${amount}`)
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testPDF()
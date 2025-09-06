const fs = require('fs')
const pdf = require('pdf-parse')
const ICICIParser = require('./services/iciciParser')

async function testICICI() {
  try {
    const pdfBuffer = fs.readFileSync('../Statement_2025MTH08_318582332.pdf')
    console.log('Extracting text from PDF...')
    
    const data = await pdf(pdfBuffer)
    const text = data.text
    
    console.log('First 500 characters of PDF text:')
    console.log(text.substring(0, 500))
    console.log('\n' + '='.repeat(50))
    
    console.log('Processing with ICICI parser...')
    const transactions = ICICIParser.parseTransactions(text)
    
    console.log(`\nFound ${transactions.length} transactions`)
    
    if (transactions.length > 0) {
      console.log('\nFirst 5 transactions:')
      transactions.slice(0, 5).forEach((txn, i) => {
        console.log(`${i+1}. ${txn.date} | ${txn.description} | ₹${txn.amount}`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testICICI()
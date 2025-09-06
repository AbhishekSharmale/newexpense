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

    // Mock response
    const mockTransactions = [
      { id: 1, date: '2024-01-15', description: 'UPI Payment', amount: -340, category: 'Food & Dining' },
      { id: 2, date: '2024-01-15', description: 'UPI Transfer', amount: -180, category: 'Transportation' },
      { id: 3, date: '2024-01-14', description: 'Salary Credit', amount: 75000, category: 'Income' }
    ]
    
    const summary = {
      totalTransactions: mockTransactions.length,
      totalSpent: 520,
      totalIncome: 75000,
      categories: {
        'Food & Dining': 340,
        'Transportation': 180,
        'Income': 75000
      }
    }

    return new Response(JSON.stringify({ 
      transactions: mockTransactions,
      summary,
      status: 'success',
      message: 'PDF processed successfully'
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
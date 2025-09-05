const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export class ApiClient {
  static async processStatement(file: File) {
    const formData = new FormData()
    formData.append('statement', file)

    const response = await fetch(`${API_URL}/api/process-statement`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to process statement')
    }

    return response.json()
  }

  static async getInsights(transactions: any[]) {
    const response = await fetch(`${API_URL}/api/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions })
    })

    if (!response.ok) {
      throw new Error('Failed to get insights')
    }

    return response.json()
  }
}
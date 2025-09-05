'use client'

import { useState } from 'react'

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  category: string
  subcategory?: string
  confidence: number
  needsReview: boolean
  merchant?: string
  notes?: string
}

interface TransactionReviewProps {
  transactions: Transaction[]
  onUpdateTransaction: (id: string, updates: Partial<Transaction>) => void
  onBulkUpdate: (ids: string[], updates: Partial<Transaction>) => void
}

const categories = [
  { name: 'Food & Dining', subcategories: ['Restaurants', 'Groceries', 'Food Delivery', 'Coffee & Tea'] },
  { name: 'Transportation', subcategories: ['Fuel', 'Public Transport', 'Taxi/Ride Share', 'Parking'] },
  { name: 'Shopping', subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Personal Care'] },
  { name: 'Entertainment', subcategories: ['Movies', 'Games', 'Sports', 'Hobbies'] },
  { name: 'Utilities', subcategories: ['Electricity', 'Internet', 'Mobile', 'Water'] },
  { name: 'Healthcare', subcategories: ['Doctor', 'Pharmacy', 'Insurance', 'Fitness'] },
  { name: 'Education', subcategories: ['Courses', 'Books', 'Supplies', 'Tuition'] },
  { name: 'Investment', subcategories: ['Stocks', 'Mutual Funds', 'SIP', 'Fixed Deposit'] }
]

export default function TransactionReview({ transactions, onUpdateTransaction, onBulkUpdate }: TransactionReviewProps) {
  const [filter, setFilter] = useState<'all' | 'needs-review' | 'low-confidence'>('needs-review')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)
  const [bulkEditMode, setBulkEditMode] = useState(false)

  const filteredTransactions = transactions.filter(transaction => {
    switch (filter) {
      case 'needs-review':
        return transaction.needsReview
      case 'low-confidence':
        return transaction.confidence < 70
      default:
        return true
    }
  })

  const handleTransactionSelect = (id: string) => {
    setSelectedTransactions(prev => 
      prev.includes(id) 
        ? prev.filter(t => t !== id)
        : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'category' | 'merchant', value: string) => {
    if (selectedTransactions.length === 0) return
    
    const updates = action === 'category' 
      ? { category: value, needsReview: false }
      : { merchant: value, needsReview: false }
    
    onBulkUpdate(selectedTransactions, updates)
    setSelectedTransactions([])
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400 bg-green-900/20'
    if (confidence >= 60) return 'text-yellow-400 bg-yellow-900/20'
    return 'text-red-400 bg-red-900/20'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High'
    if (confidence >= 60) return 'Medium'
    return 'Low'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Transaction Review</h2>
          <p className="text-gray-400">Review and correct AI categorization</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              bulkEditMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
          >
            {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-gray-800/50 rounded-lg p-1">
        {[
          { key: 'needs-review', label: 'Needs Review', count: transactions.filter(t => t.needsReview).length },
          { key: 'low-confidence', label: 'Low Confidence', count: transactions.filter(t => t.confidence < 70).length },
          { key: 'all', label: 'All Transactions', count: transactions.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors ${
              filter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
            <span className="bg-gray-600 text-xs px-2 py-1 rounded-full">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {bulkEditMode && selectedTransactions.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-300 font-medium">
              {selectedTransactions.length} transactions selected
            </span>
            <div className="flex items-center gap-3">
              <select
                onChange={(e) => e.target.value && handleBulkAction('category', e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white"
                defaultValue=""
              >
                <option value="">Set Category</option>
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <button
                onClick={() => setSelectedTransactions([])}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            isSelected={selectedTransactions.includes(transaction.id)}
            isEditing={editingTransaction === transaction.id}
            bulkEditMode={bulkEditMode}
            onSelect={() => handleTransactionSelect(transaction.id)}
            onEdit={() => setEditingTransaction(transaction.id)}
            onSave={(updates) => {
              onUpdateTransaction(transaction.id, updates)
              setEditingTransaction(null)
            }}
            onCancel={() => setEditingTransaction(null)}
            getConfidenceColor={getConfidenceColor}
            getConfidenceLabel={getConfidenceLabel}
            categories={categories}
          />
        ))}

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No transactions need review at the moment</p>
          </div>
        )}
      </div>

      {/* Learning Stats */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">AI Learning Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">94%</div>
            <div className="text-sm text-gray-400">Current Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">+12%</div>
            <div className="text-sm text-gray-400">Improvement This Month</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">156</div>
            <div className="text-sm text-gray-400">Corrections Made</div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface TransactionCardProps {
  transaction: Transaction
  isSelected: boolean
  isEditing: boolean
  bulkEditMode: boolean
  onSelect: () => void
  onEdit: () => void
  onSave: (updates: Partial<Transaction>) => void
  onCancel: () => void
  getConfidenceColor: (confidence: number) => string
  getConfidenceLabel: (confidence: number) => string
  categories: Array<{ name: string; subcategories: string[] }>
}

function TransactionCard({
  transaction,
  isSelected,
  isEditing,
  bulkEditMode,
  onSelect,
  onEdit,
  onSave,
  onCancel,
  getConfidenceColor,
  getConfidenceLabel,
  categories
}: TransactionCardProps) {
  const [editData, setEditData] = useState({
    category: transaction.category,
    subcategory: transaction.subcategory || '',
    merchant: transaction.merchant || '',
    notes: transaction.notes || ''
  })

  const selectedCategory = categories.find(cat => cat.name === editData.category)

  if (isEditing) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-6 border-2 border-blue-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction Info */}
          <div>
            <h4 className="font-semibold mb-2">Transaction Details</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Date:</span> {transaction.date}</div>
              <div><span className="text-gray-400">Amount:</span> ₹{Math.abs(transaction.amount).toLocaleString()}</div>
              <div><span className="text-gray-400">Description:</span> {transaction.description}</div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value, subcategory: '' })}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium mb-2">Subcategory</label>
                <select
                  value={editData.subcategory}
                  onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">Select subcategory</option>
                  {selectedCategory.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Merchant Name</label>
              <input
                type="text"
                value={editData.merchant}
                onChange={(e) => setEditData({ ...editData, merchant: e.target.value })}
                placeholder="What merchant was this?"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <input
                type="text"
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                placeholder="Add context..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onSave({ ...editData, needsReview: false })}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
              >
                Save & Learn
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-800/50 rounded-xl p-4 border transition-all ${
      isSelected ? 'border-blue-600 bg-blue-600/10' : 'border-gray-700 hover:border-gray-600'
    }`}>
      <div className="flex items-center gap-4">
        {bulkEditMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Transaction Info */}
          <div>
            <div className="font-medium">{transaction.description}</div>
            <div className="text-sm text-gray-400">{transaction.date}</div>
          </div>

          {/* Amount */}
          <div className="text-right md:text-left">
            <div className={`font-semibold ${transaction.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
              ₹{Math.abs(transaction.amount).toLocaleString()}
            </div>
          </div>

          {/* AI Classification */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{transaction.category}</span>
              <span className={`px-2 py-1 rounded text-xs ${getConfidenceColor(transaction.confidence)}`}>
                {getConfidenceLabel(transaction.confidence)}
              </span>
            </div>
            {transaction.subcategory && (
              <div className="text-xs text-gray-400">{transaction.subcategory}</div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Review
            </button>
            <button
              onClick={() => onSave({ needsReview: false })}
              className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
            >
              Correct
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
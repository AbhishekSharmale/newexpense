'use client'

import { useState } from 'react'

interface Goal {
  id: string
  type: 'savings' | 'purchase' | 'debt' | 'budget' | 'investment'
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  priority: 'high' | 'medium' | 'low'
  monthlyContribution: number
  category?: string
}

interface GoalSettingProps {
  goals: Goal[]
  onCreateGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void
  onUpdateGoal: (goalId: string, updates: Partial<Goal>) => void
}

export default function GoalSetting({ goals, onCreateGoal, onUpdateGoal }: GoalSettingProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newGoal, setNewGoal] = useState({
    type: 'savings' as const,
    name: '',
    targetAmount: 0,
    targetDate: '',
    priority: 'medium' as const,
    monthlyContribution: 0,
    category: ''
  })

  const goalTypes = [
    { 
      type: 'savings', 
      icon: '💰', 
      title: 'Savings Goal', 
      description: 'Save money for future needs',
      examples: ['Emergency fund', 'Vacation', 'Wedding']
    },
    { 
      type: 'purchase', 
      icon: '🛍️', 
      title: 'Purchase Goal', 
      description: 'Buy something specific',
      examples: ['New bike', 'Laptop', 'Home appliances']
    },
    { 
      type: 'debt', 
      icon: '💳', 
      title: 'Debt Payoff', 
      description: 'Clear existing debts',
      examples: ['Credit card', 'Personal loan', 'EMI']
    },
    { 
      type: 'budget', 
      icon: '📊', 
      title: 'Budget Goal', 
      description: 'Reduce spending in categories',
      examples: ['Food delivery', 'Entertainment', 'Shopping']
    },
    { 
      type: 'investment', 
      icon: '📈', 
      title: 'Investment Goal', 
      description: 'Start or increase investments',
      examples: ['SIP', 'Fixed deposit', 'Stocks']
    }
  ]

  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
  }

  const calculateTimeToGoal = (goal: Goal) => {
    const remaining = goal.targetAmount - goal.currentAmount
    const months = Math.ceil(remaining / goal.monthlyContribution)
    return months
  }

  const handleCreateGoal = () => {
    onCreateGoal(newGoal)
    setShowCreateModal(false)
    setCurrentStep(1)
    setNewGoal({
      type: 'savings',
      name: '',
      targetAmount: 0,
      targetDate: '',
      priority: 'medium',
      monthlyContribution: 0,
      category: ''
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-600'
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600'
      case 'low': return 'text-green-400 bg-green-900/20 border-green-600'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <p className="text-gray-400">Set and track your financial objectives</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + Create Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <div key={goal.id} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{goal.name}</h3>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                  {goal.priority} priority
                </div>
              </div>
              <div className="text-2xl">
                {goalTypes.find(t => t.type === goal.type)?.icon}
              </div>
            </div>

            {/* Progress Ring */}
            <div className="relative w-24 h-24 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#3b82f6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${calculateProgress(goal) * 2.51} 251`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(calculateProgress(goal))}%</span>
              </div>
            </div>

            {/* Goal Details */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Current</span>
                <span className="font-medium">₹{goal.currentAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Target</span>
                <span className="font-medium">₹{goal.targetAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Monthly</span>
                <span className="font-medium">₹{goal.monthlyContribution.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Time to goal</span>
                <span className="font-medium">{calculateTimeToGoal(goal)} months</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${calculateProgress(goal)}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors">
                Edit
              </button>
              <button className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                Add Money
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-gray-400 mb-4">Create your first financial goal to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Create New Goal</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 h-2 rounded ${
                      step <= currentStep ? 'bg-blue-600' : 'bg-gray-700'
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {currentStep === 1 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Choose Goal Type</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {goalTypes.map((type) => (
                      <div
                        key={type.type}
                        onClick={() => setNewGoal({ ...newGoal, type: type.type as any })}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          newGoal.type === type.type
                            ? 'border-blue-600 bg-blue-600/10'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-3xl mb-2">{type.icon}</div>
                        <h5 className="font-semibold mb-1">{type.title}</h5>
                        <p className="text-sm text-gray-400 mb-2">{type.description}</p>
                        <div className="text-xs text-gray-500">
                          Examples: {type.examples.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Goal Details</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Goal Name</label>
                      <input
                        type="text"
                        value={newGoal.name}
                        onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                        placeholder="e.g., Emergency Fund, New Bike"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Amount</label>
                      <input
                        type="number"
                        value={newGoal.targetAmount || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number(e.target.value) })}
                        placeholder="50000"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Date</label>
                      <input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority Level</label>
                      <select
                        value={newGoal.priority}
                        onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Funding Strategy</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Monthly Contribution</label>
                      <input
                        type="number"
                        value={newGoal.monthlyContribution || ''}
                        onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: Number(e.target.value) })}
                        placeholder="5000"
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    {newGoal.targetAmount > 0 && newGoal.monthlyContribution > 0 && (
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
                        <h5 className="font-semibold text-blue-300 mb-2">Goal Timeline</h5>
                        <p className="text-sm text-blue-200">
                          At ₹{newGoal.monthlyContribution.toLocaleString()}/month, you'll reach your goal of ₹{newGoal.targetAmount.toLocaleString()} in{' '}
                          <strong>{Math.ceil(newGoal.targetAmount / newGoal.monthlyContribution)} months</strong>
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium mb-2">Reduce Spending From</label>
                      <select
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select category (optional)</option>
                        <option value="food">Food & Dining</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="shopping">Shopping</option>
                        <option value="transportation">Transportation</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Review & Create</h4>
                  <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-4">
                      <h5 className="font-semibold mb-3">{newGoal.name}</h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Type:</span>
                          <span className="ml-2 capitalize">{newGoal.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Target:</span>
                          <span className="ml-2">₹{newGoal.targetAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Monthly:</span>
                          <span className="ml-2">₹{newGoal.monthlyContribution.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Priority:</span>
                          <span className="ml-2 capitalize">{newGoal.priority}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              
              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && !newGoal.type) ||
                    (currentStep === 2 && (!newGoal.name || !newGoal.targetAmount)) ||
                    (currentStep === 3 && !newGoal.monthlyContribution)
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateGoal}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Create Goal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
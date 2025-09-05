'use client'

import { useState } from 'react'

interface ChartData {
  name: string
  value: number
  color?: string
  percentage?: number
}

interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

interface InteractiveChartsProps {
  categoryData: ChartData[]
  monthlyData: MonthlyData[]
  dailyData: ChartData[]
}

export default function InteractiveCharts({ categoryData, monthlyData, dailyData }: InteractiveChartsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6M')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<'trends' | 'categories' | 'daily'>('categories')

  const timeRanges = ['1M', '3M', '6M', '1Y']
  
  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName)
  }

  const exportChart = (format: 'PNG' | 'PDF' | 'CSV') => {
    alert(`Exporting chart as ${format}...`)
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-700 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          
          <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white">
            <option>All Categories</option>
            {categoryData.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportChart('PNG')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
          >
            📊 Export
          </button>
        </div>
      </div>

      {/* Chart Navigation */}
      <div className="flex bg-gray-800/50 rounded-lg p-1">
        {[
          { key: 'categories', label: 'Categories', icon: '🥧' },
          { key: 'trends', label: 'Trends', icon: '📈' },
          { key: 'daily', label: 'Daily', icon: '📊' }
        ].map((chart) => (
          <button
            key={chart.key}
            onClick={() => setActiveChart(chart.key as any)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded transition-colors ${
              activeChart === chart.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <span>{chart.icon}</span>
            {chart.label}
          </button>
        ))}
      </div>

      {/* Chart Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          {activeChart === 'categories' && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-6">Spending by Category</h3>
              
              {/* Interactive Pie Chart Simulation */}
              <div className="relative">
                <div className="w-80 h-80 mx-auto relative">
                  {/* Pie Chart Segments */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                    {categoryData.map((category, index) => {
                      const total = categoryData.reduce((sum, cat) => sum + cat.value, 0)
                      const percentage = (category.value / total) * 100
                      const angle = (percentage / 100) * 360
                      const startAngle = categoryData.slice(0, index).reduce((sum, cat) => sum + (cat.value / total) * 360, 0)
                      
                      const isSelected = selectedCategory === category.name
                      const radius = isSelected ? 85 : 80
                      
                      return (
                        <g key={category.name}>
                          <path
                            d={`M 100 100 L ${100 + radius * Math.cos((startAngle * Math.PI) / 180)} ${100 + radius * Math.sin((startAngle * Math.PI) / 180)} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${100 + radius * Math.cos(((startAngle + angle) * Math.PI) / 180)} ${100 + radius * Math.sin(((startAngle + angle) * Math.PI) / 180)} Z`}
                            fill={category.color || `hsl(${index * 60}, 70%, 50%)`}
                            className="cursor-pointer transition-all duration-300 hover:opacity-80"
                            onClick={() => handleCategoryClick(category.name)}
                          />
                        </g>
                      )
                    })}
                  </svg>
                  
                  {/* Center Info */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹{categoryData.reduce((sum, cat) => sum + cat.value, 0).toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Total Spent</div>
                    </div>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {categoryData.map((category, index) => (
                    <div
                      key={category.name}
                      onClick={() => handleCategoryClick(category.name)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedCategory === category.name
                          ? 'bg-blue-600/20 border border-blue-600'
                          : 'bg-gray-700/50 hover:bg-gray-700'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color || `hsl(${index * 60}, 70%, 50%)` }}
                      ></div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{category.name}</div>
                        <div className="text-xs text-gray-400">₹{category.value.toLocaleString()}</div>
                      </div>
                      <div className="text-sm font-medium">
                        {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeChart === 'trends' && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-6">Income vs Expenses Trend</h3>
              
              {/* Line Chart Simulation */}
              <div className="h-80 relative">
                <svg className="w-full h-full" viewBox="0 0 600 300">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <g key={i}>
                      <line
                        x1={i * 120 + 50}
                        y1={50}
                        x2={i * 120 + 50}
                        y2={250}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                      <line
                        x1={50}
                        y1={i * 40 + 50}
                        x2={550}
                        y2={i * 40 + 50}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    </g>
                  ))}
                  
                  {/* Income Area */}
                  <path
                    d="M 50 100 L 170 90 L 290 95 L 410 85 L 530 80 L 530 250 L 50 250 Z"
                    fill="rgba(34, 197, 94, 0.2)"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  
                  {/* Expense Area */}
                  <path
                    d="M 50 150 L 170 160 L 290 140 L 410 155 L 530 145 L 530 250 L 50 250 Z"
                    fill="rgba(239, 68, 68, 0.2)"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  
                  {/* Data Points */}
                  {monthlyData.map((data, index) => (
                    <g key={data.month}>
                      <circle
                        cx={index * 120 + 170}
                        cy={250 - (data.income / 1000)}
                        r="4"
                        fill="#22c55e"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                      <circle
                        cx={index * 120 + 170}
                        cy={250 - (data.expenses / 1000)}
                        r="4"
                        fill="#ef4444"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                    </g>
                  ))}
                  
                  {/* Labels */}
                  {monthlyData.map((data, index) => (
                    <text
                      key={data.month}
                      x={index * 120 + 170}
                      y={280}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                    >
                      {data.month}
                    </text>
                  ))}
                </svg>
                
                {/* Legend */}
                <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Expenses</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChart === 'daily' && (
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold mb-6">Daily Spending Pattern</h3>
              
              {/* Bar Chart Simulation */}
              <div className="h-80 relative">
                <svg className="w-full h-full" viewBox="0 0 700 300">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <line
                      key={i}
                      x1={50}
                      y1={i * 40 + 50}
                      x2={650}
                      y2={i * 40 + 50}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* Bars */}
                  {dailyData.slice(0, 7).map((day, index) => {
                    const barHeight = (day.value / Math.max(...dailyData.map(d => d.value))) * 180
                    return (
                      <g key={day.name}>
                        <rect
                          x={index * 80 + 80}
                          y={230 - barHeight}
                          width="60"
                          height={barHeight}
                          fill="#3b82f6"
                          className="cursor-pointer hover:fill-blue-400 transition-colors"
                          rx="4"
                        />
                        <text
                          x={index * 80 + 110}
                          y={250}
                          textAnchor="middle"
                          fill="white"
                          fontSize="12"
                        >
                          {day.name}
                        </text>
                        <text
                          x={index * 80 + 110}
                          y={225 - barHeight}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                        >
                          ₹{day.value}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Chart Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
            <div className="text-blue-300 text-sm font-medium">Highest Category</div>
            <div className="text-lg font-bold">
              {categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0])?.name}
            </div>
            <div className="text-sm text-gray-400">
              ₹{categoryData.reduce((max, cat) => cat.value > max.value ? cat : max, categoryData[0])?.value.toLocaleString()}
            </div>
          </div>
          
          <div className="p-4 bg-green-900/20 rounded-lg border border-green-600">
            <div className="text-green-300 text-sm font-medium">Avg Daily Spend</div>
            <div className="text-lg font-bold">
              ₹{Math.round(categoryData.reduce((sum, cat) => sum + cat.value, 0) / 30).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Last 30 days</div>
          </div>
          
          <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-600">
            <div className="text-yellow-300 text-sm font-medium">Spending Trend</div>
            <div className="text-lg font-bold">↗️ +12%</div>
            <div className="text-sm text-gray-400">vs last month</div>
          </div>
        </div>
      </div>
    </div>
  )
}
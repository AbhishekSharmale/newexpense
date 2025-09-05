'use client'

interface ChartData {
  name: string
  value: number
  color: string
}

interface SimpleChartProps {
  data: ChartData[]
  type: 'pie' | 'bar'
}

export default function SimpleChart({ data, type }: SimpleChartProps) {
  if (type === 'pie') {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm font-medium">₹{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'bar') {
    const maxValue = Math.max(...data.map(d => d.value))
    
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm">{item.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-700 rounded">
                <div 
                  className="h-2 bg-blue-500 rounded" 
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm">₹{item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
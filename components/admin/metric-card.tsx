'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'indigo'
  invertTrend?: boolean // For metrics where down is good (e.g., cart abandonment)
}

// V9.11.4: Metric Card Component
export default function MetricCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  invertTrend = false
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4" />
    if (trend === 'down') return <ArrowDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    const isPositive = invertTrend ? trend === 'down' : trend === 'up'
    const isNegative = invertTrend ? trend === 'up' : trend === 'down'
    
    if (isPositive) return 'text-green-600 bg-green-50'
    if (isNegative) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getIconColor = () => {
    const colors = {
      green: 'text-green-600 bg-green-100',
      blue: 'text-blue-600 bg-blue-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      red: 'text-red-600 bg-red-100',
      indigo: 'text-indigo-600 bg-indigo-100'
    }
    return colors[color]
  }

  const getSparklineData = () => {
    // Generate random sparkline data for visual effect
    return Array.from({ length: 7 }, () => Math.random() * 100)
  }

  const sparklineData = getSparklineData()
  const maxValue = Math.max(...sparklineData)

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${getIconColor()}`}>
            <Icon className="h-6 w-6" />
          </div>
          <Badge variant="secondary" className={`${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1">{Math.abs(change)}%</span>
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>

        {/* Sparkline */}
        <div className="mt-4 flex items-end space-x-1 h-12">
          {sparklineData.map((value, index) => {
            const height = (value / maxValue) * 100
            const isLast = index === sparklineData.length - 1
            return (
              <div
                key={index}
                className={`flex-1 rounded-sm transition-all ${
                  isLast ? 'bg-primary' : 'bg-primary/20'
                }`}
                style={{ height: `${height}%` }}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
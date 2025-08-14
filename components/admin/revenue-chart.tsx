'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'

interface RevenueChartProps {
  dateRange: { from: Date; to: Date }
}

// V9.11.4: Revenue Chart Component
export default function RevenueChart({ dateRange }: RevenueChartProps) {
  const [period, setPeriod] = useState('daily')
  const [metric, setMetric] = useState('revenue')

  // Generate mock data based on period
  const generateChartData = () => {
    const days = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24))
    const data = []
    
    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(dateRange.from)
      date.setDate(date.getDate() + i)
      
      data.push({
        date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        revenue: Math.floor(Math.random() * 500) + 200,
        orders: Math.floor(Math.random() * 10) + 5,
        visitors: Math.floor(Math.random() * 200) + 50
      })
    }
    
    return data
  }

  const chartData = generateChartData()
  const maxValue = Math.max(...chartData.map(d => d[metric as keyof typeof d] as number))

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Performance Trends</CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="visitors">Visitors</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{metric === 'revenue' ? '£' : ''}{maxValue}</span>
            <span>{metric === 'revenue' ? '£' : ''}{Math.floor(maxValue * 0.75)}</span>
            <span>{metric === 'revenue' ? '£' : ''}{Math.floor(maxValue * 0.5)}</span>
            <span>{metric === 'revenue' ? '£' : ''}{Math.floor(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
          
          {/* Chart area */}
          <div className="ml-16 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} className="border-t border-gray-100" />
              ))}
            </div>
            
            {/* Line chart */}
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${chartData.length * 30} 300`} preserveAspectRatio="none">
              {/* Area fill */}
              <path
                d={`
                  M 0,${300 - (chartData[0][metric as keyof typeof chartData[0]] as number / maxValue) * 300}
                  ${chartData.map((d, i) => 
                    `L ${i * 30},${300 - (d[metric as keyof typeof d] as number / maxValue) * 300}`
                  ).join(' ')}
                  L ${(chartData.length - 1) * 30},300
                  L 0,300
                  Z
                `}
                fill="url(#gradient)"
                opacity="0.1"
              />
              
              {/* Line */}
              <path
                d={`
                  M 0,${300 - (chartData[0][metric as keyof typeof chartData[0]] as number / maxValue) * 300}
                  ${chartData.map((d, i) => 
                    `L ${i * 30},${300 - (d[metric as keyof typeof d] as number / maxValue) * 300}`
                  ).join(' ')}
                `}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />
              
              {/* Data points */}
              {chartData.map((d, i) => (
                <circle
                  key={i}
                  cx={i * 30}
                  cy={300 - (d[metric as keyof typeof d] as number / maxValue) * 300}
                  r="4"
                  fill="hsl(var(--primary))"
                  className="hover:r-6 transition-all cursor-pointer"
                />
              ))}
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground mt-2">
              {chartData.filter((_, i) => i % Math.ceil(chartData.length / 6) === 0).map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
          <div>
            <p className="text-sm text-muted-foreground">Total {metric}</p>
            <p className="text-xl font-bold">
              {metric === 'revenue' ? '£' : ''}
              {chartData.reduce((sum, d) => sum + (d[metric as keyof typeof d] as number), 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average</p>
            <p className="text-xl font-bold">
              {metric === 'revenue' ? '£' : ''}
              {Math.floor(chartData.reduce((sum, d) => sum + (d[metric as keyof typeof d] as number), 0) / chartData.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Peak</p>
            <p className="text-xl font-bold">
              {metric === 'revenue' ? '£' : ''}
              {maxValue}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
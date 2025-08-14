'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

// V9.11.4: Peak Times Heatmap Component
export default function PeakTimesHeatmap() {
  // Generate mock data for heatmap
  const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    // Create realistic patterns
    // Higher activity: 8-10am, 12-2pm, 6-8pm
    // Peak days: Wed, Sat, Sun
    const data: any = {}
    
    days.forEach(day => {
      data[day] = {}
      hours.forEach(hour => {
        let intensity = Math.random() * 30 // Base random activity
        
        // Boost morning hours (8-10am)
        if (hour >= 8 && hour <= 10) {
          intensity += 40
        }
        // Boost lunch hours (12-2pm)
        else if (hour >= 12 && hour <= 14) {
          intensity += 30
        }
        // Boost evening hours (6-8pm)
        else if (hour >= 18 && hour <= 20) {
          intensity += 35
        }
        // Lower night hours
        else if (hour >= 23 || hour <= 5) {
          intensity = intensity / 2
        }
        
        // Boost peak days
        if (['Wed', 'Sat', 'Sun'].includes(day)) {
          intensity *= 1.3
        }
        
        // Reduce Monday/Tuesday
        if (['Mon', 'Tue'].includes(day)) {
          intensity *= 0.8
        }
        
        data[day][hour] = Math.min(100, Math.max(0, intensity))
      })
    })
    
    return data
  }

  const heatmapData = generateHeatmapData()
  const days = Object.keys(heatmapData)
  const hours = Array.from({ length: 24 }, (_, i) => i)

  // Find peak times
  let peakTime = { day: '', hour: 0, value: 0 }
  days.forEach(day => {
    hours.forEach(hour => {
      if (heatmapData[day][hour] > peakTime.value) {
        peakTime = { day, hour, value: heatmapData[day][hour] }
      }
    })
  })

  const getIntensityColor = (value: number) => {
    if (value > 80) return 'bg-red-600'
    if (value > 60) return 'bg-orange-500'
    if (value > 40) return 'bg-yellow-500'
    if (value > 20) return 'bg-green-500'
    return 'bg-gray-200'
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am'
    if (hour === 12) return '12pm'
    if (hour < 12) return `${hour}am`
    return `${hour - 12}pm`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Peak Activity Times</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Visitor activity patterns throughout the week
            </p>
          </div>
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Peak: {peakTime.day} {formatHour(peakTime.hour)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hour labels */}
          <div className="flex items-center space-x-1">
            <div className="w-12" /> {/* Spacer for day labels */}
            {hours.map(hour => (
              <div
                key={hour}
                className="flex-1 text-xs text-center text-muted-foreground"
              >
                {hour % 3 === 0 ? formatHour(hour) : ''}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map(day => (
            <div key={day} className="flex items-center space-x-1">
              <div className="w-12 text-sm font-medium text-right pr-2">
                {day}
              </div>
              {hours.map(hour => {
                const value = heatmapData[day][hour]
                const isPeak = day === peakTime.day && hour === peakTime.hour
                
                return (
                  <div
                    key={hour}
                    className={`
                      flex-1 h-8 rounded-sm transition-all cursor-pointer
                      ${getIntensityColor(value)}
                      ${isPeak ? 'ring-2 ring-primary ring-offset-1' : ''}
                      hover:opacity-80
                    `}
                    title={`${day} ${formatHour(hour)}: ${Math.round(value)}% activity`}
                  />
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Low</span>
              <div className="flex items-center space-x-1">
                {['bg-gray-200', 'bg-green-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-600'].map((color, i) => (
                  <div key={i} className={`w-6 h-6 rounded-sm ${color}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">High</span>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Peak Time Insights</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Highest traffic on {peakTime.day} at {formatHour(peakTime.hour)}</li>
                  <li>Morning rush: 8-10am across all days</li>
                  <li>Weekend surge: Saturday & Sunday show increased activity</li>
                  <li>Consider scheduling promotions during peak hours</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
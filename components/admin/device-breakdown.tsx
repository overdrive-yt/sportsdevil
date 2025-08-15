'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Smartphone, Monitor, Tablet } from 'lucide-react'

interface DeviceBreakdownProps {
  data: {
    mobile: number
    desktop: number
    tablet: number
  }
}

// V9.11.4: Device Breakdown Component
export default function DeviceBreakdown({ data }: DeviceBreakdownProps) {
  const total = data.mobile + data.desktop + data.tablet
  
  const devices = [
    {
      name: 'Mobile',
      value: data.mobile,
      percentage: (data.mobile / total) * 100,
      icon: Smartphone,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-700'
    },
    {
      name: 'Desktop',
      value: data.desktop,
      percentage: (data.desktop / total) * 100,
      icon: Monitor,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-700'
    },
    {
      name: 'Tablet',
      value: data.tablet,
      percentage: (data.tablet / total) * 100,
      icon: Tablet,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-700'
    }
  ]

  // Calculate angles for donut chart
  let currentAngle = -90 // Start from top
  const segments = devices.map(device => {
    const angle = (device.percentage / 100) * 360
    const segment = {
      ...device,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    }
    currentAngle += angle
    return segment
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Device Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Donut Chart */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
            {segments.map((segment, index) => {
              const radius = 40
              const innerRadius = 25
              const x1 = 50 + radius * Math.cos(segment.startAngle * Math.PI / 180)
              const y1 = 50 + radius * Math.sin(segment.startAngle * Math.PI / 180)
              const x2 = 50 + radius * Math.cos(segment.endAngle * Math.PI / 180)
              const y2 = 50 + radius * Math.sin(segment.endAngle * Math.PI / 180)
              const x3 = 50 + innerRadius * Math.cos(segment.endAngle * Math.PI / 180)
              const y3 = 50 + innerRadius * Math.sin(segment.endAngle * Math.PI / 180)
              const x4 = 50 + innerRadius * Math.cos(segment.startAngle * Math.PI / 180)
              const y4 = 50 + innerRadius * Math.sin(segment.startAngle * Math.PI / 180)
              
              const largeArcFlag = segment.percentage > 50 ? 1 : 0
              
              return (
                <path
                  key={index}
                  d={`
                    M ${x1} ${y1}
                    A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
                    L ${x3} ${y3}
                    A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
                    Z
                  `}
                  fill={segment.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              )
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold">{total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </div>

        {/* Device list */}
        <div className="space-y-3">
          {devices.map((device, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${device.lightColor}`}>
                  <device.icon className={`h-4 w-4 ${device.textColor}`} />
                </div>
                <div>
                  <p className="font-medium">{device.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {device.value.toLocaleString()} visitors
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className={device.lightColor}>
                <span className={device.textColor}>
                  {device.percentage.toFixed(1)}%
                </span>
              </Badge>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="mt-6 pt-6 border-t">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Mobile First:</strong> {data.mobile}% of your traffic comes from mobile devices. 
              Ensure your mobile experience is optimized for conversions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
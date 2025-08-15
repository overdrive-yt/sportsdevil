'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Activity, ShoppingCart, Users, Eye } from 'lucide-react'

// V9.11.4: Real-Time Stats Component
export default function RealTimeStats() {
  const [stats, setStats] = useState({
    activeUsers: 24,
    activeCarts: 7,
    recentOrders: 2,
    pageViews: 156
  })

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeUsers: Math.max(0, prev.activeUsers + Math.floor(Math.random() * 5 - 2)),
        activeCarts: Math.max(0, prev.activeCarts + Math.floor(Math.random() * 3 - 1)),
        recentOrders: Math.max(0, prev.recentOrders + (Math.random() > 0.8 ? 1 : 0)),
        pageViews: prev.pageViews + Math.floor(Math.random() * 3)
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const statItems = [
    {
      label: 'Active Users',
      value: stats.activeUsers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Active Carts',
      value: stats.activeCarts,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Orders (Last Hour)',
      value: stats.recentOrders,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Page Views (Last Hour)',
      value: stats.pageViews,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Real-Time Activity</h3>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2" />
            Live
          </Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50"
            >
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
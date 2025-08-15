'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Progress } from '../ui/progress'
import { cn } from '../../lib/utils'
import { format } from 'date-fns'
import { 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Percent,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  BarChart3,
  Download,
  Loader2
} from 'lucide-react'
import { formatPriceSimple } from '../../lib/utils'

// V9.11.2: Coupon Analytics Dashboard
export function CouponAnalytics() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  })
  const [selectedCoupon, setSelectedCoupon] = useState<string>('all')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, selectedCoupon])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      })
      
      if (selectedCoupon !== 'all') {
        params.append('couponId', selectedCoupon)
      }

      const response = await fetch(`/api/admin/coupons/analytics?${params}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // TODO: Implement export functionality
    console.log('Exporting report...')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />
      case 'desktop':
        return <Monitor className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coupon Performance Analytics</h2>
          <p className="text-muted-foreground">
            Track usage patterns and revenue impact
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dateRange.from, "PPP")} - {format(dateRange.to, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range: any) => range?.from && setDateRange(range)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalUsage}</div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.overview.activeCoupons} active coupons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPriceSimple(Number(analytics.overview.totalRevenue))}
            </div>
            <p className="text-xs text-muted-foreground">
              From coupon orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discount</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPriceSimple(Number(analytics.overview.totalDiscount))}
            </div>
            <p className="text-xs text-muted-foreground">
              Given in discounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPriceSimple(Number(analytics.overview.averageOrderValue))}
            </div>
            <p className="text-xs text-muted-foreground">
              With coupon applied
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Coupons */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Coupons</CardTitle>
            <CardDescription>Most used coupons in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topCoupons.map((coupon: any, index: number) => (
                <div key={coupon.id} className="flex items-center">
                  <div className="flex items-center flex-1 space-x-4">
                    <div className="text-sm font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{coupon.code}</div>
                      {coupon.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{coupon.uses} uses</div>
                    <div className="text-sm text-muted-foreground">
                      {((coupon.uses / analytics.overview.totalUsage) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              {analytics.topCoupons.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No coupon usage in selected period
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Device Usage</CardTitle>
            <CardDescription>Where coupons are being used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.deviceBreakdown.map((device: any) => {
                const percentage = (device.count / analytics.overview.totalUsage) * 100
                return (
                  <div key={device.device} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device.device)}
                        <span className="font-medium capitalize">{device.device}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {device.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
              {analytics.deviceBreakdown.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No device data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Times</CardTitle>
            <CardDescription>When coupons are most used</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Hourly Usage */}
              <div>
                <h4 className="text-sm font-medium mb-3">Peak Hours</h4>
                <div className="space-y-2">
                  {analytics.timePatterns.hourly
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 3)
                    .map((hour: any) => {
                      const maxCount = Math.max(...analytics.timePatterns.hourly.map((h: any) => h.count))
                      const percentage = (hour.count / maxCount) * 100
                      return (
                        <div key={hour.hour} className="flex items-center space-x-3">
                          <div className="w-12 text-sm font-medium">
                            {parseInt(hour.hour)}:00
                          </div>
                          <div className="flex-1">
                            <Progress value={percentage} className="h-2" />
                          </div>
                          <div className="w-12 text-sm text-muted-foreground text-right">
                            {hour.count}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Day of Week Usage */}
              <div>
                <h4 className="text-sm font-medium mb-3">Popular Days</h4>
                <div className="grid grid-cols-7 gap-2">
                  {analytics.timePatterns.dayOfWeek.map((day: any) => {
                    const maxCount = Math.max(...analytics.timePatterns.dayOfWeek.map((d: any) => d.count))
                    const percentage = (day.count / maxCount) * 100
                    const isTopDay = percentage >= 80
                    
                    return (
                      <div key={day.dayOfWeek} className="text-center">
                        <div className={cn(
                          "text-xs font-medium mb-1",
                          isTopDay && "text-primary"
                        )}>
                          {day.dayOfWeek.slice(0, 3)}
                        </div>
                        <div className={cn(
                          "h-16 w-full rounded-md flex items-end justify-center pb-1",
                          isTopDay ? "bg-primary/20" : "bg-muted"
                        )}>
                          <div
                            className={cn(
                              "w-full rounded-t transition-all",
                              isTopDay ? "bg-primary" : "bg-primary/60"
                            )}
                            style={{ height: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {day.count}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>Actionable recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Peak Times Insight */}
              {analytics.timePatterns.hourly.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Peak Usage Times</p>
                    <p className="text-sm text-muted-foreground">
                      Most coupons are used at {
                        analytics.timePatterns.hourly
                          .sort((a: any, b: any) => b.count - a.count)[0].hour
                      }:00. Consider scheduling campaigns around this time.
                    </p>
                  </div>
                </div>
              )}

              {/* Device Preference */}
              {analytics.deviceBreakdown.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Device Preference</p>
                    <p className="text-sm text-muted-foreground">
                      {analytics.deviceBreakdown[0].device} accounts for{' '}
                      {((analytics.deviceBreakdown[0].count / analytics.overview.totalUsage) * 100).toFixed(0)}% 
                      of usage. Ensure coupon experience is optimized for {analytics.deviceBreakdown[0].device}.
                    </p>
                  </div>
                </div>
              )}

              {/* Conversion Rate */}
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Conversion Impact</p>
                  <p className="text-sm text-muted-foreground">
                    Coupons have generated {formatPriceSimple(Number(analytics.overview.totalRevenue))} in revenue
                    with an average order value of {formatPriceSimple(Number(analytics.overview.averageOrderValue))}.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { 
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface InsightsPanelProps {
  metrics: any
}

// V9.11.4: AI-Powered Insights Panel
export default function InsightsPanel({ metrics }: InsightsPanelProps) {
  // Generate insights based on metrics
  const generateInsights = () => {
    const insights = []

    // Revenue insights
    if (metrics.revenue.change > 10) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Revenue Growth Opportunity',
        description: `Revenue is up ${metrics.revenue.change}% - consider increasing inventory for top products to capitalize on demand.`,
        action: 'View Top Products',
        priority: 'high'
      })
    }

    // Mobile optimization
    if (metrics.deviceBreakdown.mobile > 60) {
      insights.push({
        type: 'info',
        icon: Zap,
        title: 'Mobile-First Strategy',
        description: `${metrics.deviceBreakdown.mobile}% of traffic is mobile. Ensure checkout is optimized for mobile conversions.`,
        action: 'Test Mobile Checkout',
        priority: 'medium'
      })
    }

    // Cart abandonment
    if (metrics.cartAbandonment.current > 65) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'High Cart Abandonment',
        description: `Cart abandonment at ${metrics.cartAbandonment.current}% - implement recovery emails or checkout improvements.`,
        action: 'Setup Recovery Emails',
        priority: 'high'
      })
    }

    // Peak time promotion
    insights.push({
      type: 'info',
      icon: Target,
      title: 'Peak Time Promotion',
      description: 'Your peak traffic is Wednesday 8-10am. Schedule promotions during these times for maximum impact.',
      action: 'Create Campaign',
      priority: 'medium'
    })

    // Conversion rate
    if (metrics.conversionRate.trend === 'up') {
      insights.push({
        type: 'success',
        icon: CheckCircle,
        title: 'Conversion Rate Improving',
        description: `Conversion rate increased by ${metrics.conversionRate.change}% - analyze what changed and replicate success.`,
        action: 'View Changes',
        priority: 'low'
      })
    }

    return insights
  }

  const insights = generateInsights()

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>
      default:
        return <Badge variant="outline">Low Priority</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <CardTitle>AI-Powered Insights</CardTitle>
          </div>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {insights.length} Recommendations
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  insight.type === 'success' ? 'bg-green-100' :
                  insight.type === 'warning' ? 'bg-orange-100' :
                  insight.type === 'error' ? 'bg-red-100' :
                  'bg-blue-100'
                }`}>
                  <insight.icon className={`h-5 w-5 ${
                    insight.type === 'success' ? 'text-green-600' :
                    insight.type === 'warning' ? 'text-orange-600' :
                    insight.type === 'error' ? 'text-red-600' :
                    'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    {getPriorityBadge(insight.priority)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {insight.description}
                  </p>
                  <Button size="sm" variant="outline">
                    {insight.action}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.type === 'success').length}
              </p>
              <p className="text-xs text-muted-foreground">Opportunities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {insights.filter(i => i.type === 'warning').length}
              </p>
              <p className="text-xs text-muted-foreground">Warnings</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.type === 'info').length}
              </p>
              <p className="text-xs text-muted-foreground">Tips</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
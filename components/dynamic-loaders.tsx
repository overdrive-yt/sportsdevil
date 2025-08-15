'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from './ui/skeleton'
import { Card } from './ui/card'

// Loading components for better UX
const AdminLoadingFallback = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16 mb-4" />
          <Skeleton className="h-20 w-full" />
        </Card>
      ))}
    </div>
  </div>
)

const IntegrationLoadingFallback = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-12 w-12 mb-3" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </Card>
      ))}
    </div>
  </div>
)

const ChartLoadingFallback = () => (
  <Card className="p-6">
    <Skeleton className="h-6 w-32 mb-4" />
    <Skeleton className="h-64 w-full" />
  </Card>
)

// Dynamic imports for heavy admin components
export const DynamicAdminDashboard = dynamic(
  () => import('./admin/simple-dashboard').then(mod => ({ default: mod.SimpleDashboard })),
  {
    loading: AdminLoadingFallback,
    ssr: false, // Disable SSR for admin components
  }
)

export const DynamicAdvancedAnalytics = dynamic(
  () => import('./admin/advanced-analytics-dashboard').then(mod => ({ default: mod.AdvancedAnalyticsDashboard })),
  {
    loading: AdminLoadingFallback,
    ssr: false,
  }
)

export const DynamicIntegrationsDashboard = dynamic(
  () => import('./admin/integrations-dashboard'),
  {
    loading: IntegrationLoadingFallback,
    ssr: false,
  }
)

export const DynamicRevenueChart = dynamic(
  () => import('./admin/revenue-chart'),
  {
    loading: ChartLoadingFallback,
    ssr: false,
  }
)

export const DynamicSystemHealthMonitor = dynamic(
  () => import('./admin/system-health-monitor').then(mod => ({ default: mod.SystemHealthMonitor })),
  {
    loading: () => <Skeleton className="h-32 w-full" />,
    ssr: false,
  }
)

// Dynamic imports for heavy payment components
export const DynamicStripePaymentForm = dynamic(
  () => import('./checkout/stripe-payment-form').then(mod => ({ default: mod.StripePaymentForm })),
  {
    loading: () => (
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      </Card>
    ),
    ssr: false,
  }
)

// Dynamic imports for charts and analytics
export const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.LineChart })),
  {
    loading: ChartLoadingFallback,
    ssr: false,
  }
)

export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => ({ default: mod.BarChart })),
  {
    loading: ChartLoadingFallback,
    ssr: false,
  }
)

// Dynamic import for notification system
export const DynamicNotificationsCenter = dynamic(
  () => import('./admin/notifications-center').then(mod => ({ default: mod.NotificationsCenter })),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
)

// Dynamic import for product wizard (heavy form component)
export const DynamicProductWizard = dynamic(
  () => import('./admin/product-wizard').then(mod => ({ default: mod.ProductWizard })),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: false,
  }
)

// Dynamic import for social media manager (with external API calls)
export const DynamicSocialMediaManager = dynamic(
  () => import('./admin/social-media-manager').then(mod => ({ default: mod.SocialMediaManager })),
  {
    loading: () => <Skeleton className="h-64 w-full" />,
    ssr: false,
  }
)
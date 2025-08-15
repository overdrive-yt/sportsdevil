'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Skeleton } from '../ui/skeleton'
import { Alert, AlertDescription } from '../ui/alert'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CreditCard, 
  TrendingUp, 
  DollarSign, 
  Users, 
  RefreshCw,
  Download,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { formatAmountForDisplay } from '../../lib/stripe'
import Link from 'next/link'

interface StripePayment {
  stripePaymentIntentId: string
  amount: number
  currency: string
  status: string
  paymentMethod?: string
  customerEmail: string
  customerName?: string
  receiptUrl?: string
  description?: string
  createdAt: string
  metadata?: any
}

interface StripeAnalytics {
  balance: {
    available: Array<{ amount: number; currency: string }>
    pending: Array<{ amount: number; currency: string }>
  }
  revenue: {
    total: number
    thisMonth: number
  }
  transactionCount: number
}

export function StripeDashboard() {
  const [payments, setPayments] = useState<StripePayment[]>([])
  const [analytics, setAnalytics] = useState<StripeAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchPaymentHistory()
  }, [])

  const fetchPaymentHistory = async (sync = false) => {
    try {
      if (sync) setSyncing(true)
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/stripe/payment-history?limit=100&sync=${sync}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment history')
      }

      setPayments(data.data.payments || [])
      setAnalytics(data.data.analytics)
      
      if (sync && data.data.sync) {
        console.log(`✅ Synced ${data.data.sync.syncedCount} payments to database`)
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Payment history fetch error:', err)
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }

  const syncFromStripe = () => {
    fetchPaymentHistory(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'succeeded':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status.toLowerCase() === 'succeeded' ? 'default' : 
                   status.toLowerCase() === 'failed' ? 'destructive' : 'secondary'
    return <Badge variant={variant}>{status}</Badge>
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.stripePaymentIntentId.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || 
      payment.status.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  if (loading && !payments.length) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Stripe Payment Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and view all Stripe payment history and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchPaymentHistory(false)} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={syncFromStripe} disabled={syncing}>
            {syncing && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {syncing ? 'Syncing...' : 'Sync from Stripe'}
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/admin/stripe-test">
              <CreditCard className="h-4 w-4 mr-2" />
              Test Integration
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.balance.available.length > 0 
                  ? formatAmountForDisplay(analytics.balance.available[0].amount * 100, analytics.balance.available[0].currency)
                  : '£0.00'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Ready for payout
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.balance.pending.length > 0 
                  ? formatAmountForDisplay(analytics.balance.pending[0].amount * 100, analytics.balance.pending[0].currency)
                  : '£0.00'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Processing payments
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmountForDisplay(analytics.revenue.total * 100, 'gbp')}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time earnings
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatAmountForDisplay(analytics.revenue.thisMonth * 100, 'gbp')}
              </div>
              <p className="text-xs text-muted-foreground">
                Current month revenue
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View and manage all Stripe payment transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by email, name, or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
              >
                <option value="all">All Status</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="processing">Processing</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {payments.length === 0 ? 'No payment history found' : 'No payments match your filters'}
              </div>
            ) : (
              filteredPayments.map((payment) => (
                <div key={payment.stripePaymentIntentId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(payment.status)}
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {payment.customerName || payment.customerEmail}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {payment.customerEmail} • {payment.stripePaymentIntentId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.createdAt).toLocaleDateString()} at{' '}
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatAmountForDisplay(payment.amount * 100, payment.currency)}
                    </p>
                    {payment.paymentMethod && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {payment.paymentMethod}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {payment.receiptUrl && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer">
                          Receipt
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
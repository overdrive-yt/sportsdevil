'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  BarChart3,
  Calendar,
  Clock,
  Users,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCurrentUser } from '@/hooks/use-auth-store'
import { useToast } from '@/hooks/use-toast'
import { formatPriceSimple } from '@/lib/utils'
import { CouponForm } from '@/components/admin/coupon-form'
import { CouponAnalytics } from '@/components/admin/coupon-analytics'

// V9.11.2: Advanced Coupon Management Interface
export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
  const router = useRouter()
  const { toast } = useToast()

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  // Fetch coupons
  useEffect(() => {
    fetchCoupons()
  }, [statusFilter])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/admin/coupons?${params}`)
      if (!response.ok) throw new Error('Failed to fetch coupons')
      
      const data = await response.json()
      setCoupons(data.coupons)
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCoupons()
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(coupons.map(c => c.id))
    } else {
      setSelectedCoupons([])
    }
  }

  const handleSelectCoupon = (couponId: string, checked: boolean) => {
    if (checked) {
      setSelectedCoupons([...selectedCoupons, couponId])
    } else {
      setSelectedCoupons(selectedCoupons.filter(id => id !== couponId))
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedCoupons.length === 0) {
      toast({
        title: 'No coupons selected',
        description: 'Please select coupons to perform bulk actions',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/admin/coupons/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: action,
          couponIds: selectedCoupons
        })
      })

      if (!response.ok) throw new Error('Bulk operation failed')

      toast({
        title: 'Success',
        description: `Bulk ${action} completed successfully`
      })

      setSelectedCoupons([])
      fetchCoupons()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast({
        title: 'Error',
        description: 'Failed to perform bulk action',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || 'Failed to delete coupon')
      }

      toast({
        title: 'Success',
        description: 'Coupon deleted successfully'
      })

      fetchCoupons()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete coupon',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (coupon: any) => {
    const now = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)

    if (!coupon.isActive) {
      return <Badge variant="secondary">Inactive</Badge>
    }
    if (validFrom > now) {
      return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
    }
    if (validUntil < now) {
      return <Badge variant="destructive">Expired</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  const getUsageDisplay = (coupon: any) => {
    if (coupon.usageLimit === null) {
      return `${coupon.usageStats.used} / ∞`
    }
    return `${coupon.usageStats.used} / ${coupon.usageLimit}`
  }

  if (authLoading || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Coupon Management</h1>
                <p className="text-muted-foreground">
                  Advanced coupon system with usage controls and analytics
                </p>
              </div>
              <Button onClick={() => {
                setSelectedCoupon(null)
                setShowForm(true)
                setActiveTab('create')
              }}>
                <Plus className="h-4 w-4 mr-2" />
                New Coupon
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="list">
                <Users className="h-4 w-4 mr-2" />
                All Coupons
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Coupons List Tab */}
            <TabsContent value="list" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <form onSubmit={handleSearch} className="flex items-center space-x-2">
                        <Input
                          placeholder="Search coupons..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="max-w-sm"
                        />
                        <Button type="submit" size="icon" variant="ghost">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedCoupons.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {selectedCoupons.length} selected
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Bulk Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleBulkAction('delete')}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedCoupons.length === coupons.length && coupons.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Usage</TableHead>
                        <TableHead>Valid Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {coupons.map((coupon) => (
                        <TableRow key={coupon.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedCoupons.includes(coupon.id)}
                              onCheckedChange={(checked) => handleSelectCoupon(coupon.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-mono">{coupon.code}</div>
                              {coupon.description && (
                                <div className="text-xs text-muted-foreground">{coupon.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {coupon.discountType === 'PERCENTAGE' && 'Percentage'}
                            {coupon.discountType === 'FIXED_AMOUNT' && 'Fixed Amount'}
                            {coupon.discountType === 'FREE_SHIPPING' && 'Free Shipping'}
                            {coupon.discountType === 'BUY_X_GET_Y' && 'Buy X Get Y'}
                          </TableCell>
                          <TableCell>
                            {coupon.discountType === 'PERCENTAGE' 
                              ? `${coupon.discountValue}%`
                              : coupon.discountType === 'FIXED_AMOUNT'
                              ? formatPriceSimple(Number(coupon.discountValue))
                              : coupon.discountType === 'BUY_X_GET_Y'
                              ? `Buy ${coupon.buyXQuantity} Get ${coupon.getYQuantity}`
                              : 'Free'}
                          </TableCell>
                          <TableCell>{getUsageDisplay(coupon)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>{new Date(coupon.validFrom).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">
                                to {new Date(coupon.validUntil).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(coupon)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setSelectedCoupon(coupon)
                                  setShowForm(true)
                                  setActiveTab('create')
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  navigator.clipboard.writeText(coupon.code)
                                  toast({
                                    title: 'Copied',
                                    description: 'Coupon code copied to clipboard'
                                  })
                                }}>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push(`/admin/coupons/${coupon.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteCoupon(coupon.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {coupons.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No coupons found</h3>
                      <p className="text-muted-foreground mb-4">
                        {statusFilter !== 'all' || searchTerm 
                          ? 'Try adjusting your filters'
                          : 'Create your first coupon to get started'}
                      </p>
                      {statusFilter === 'all' && !searchTerm && (
                        <Button onClick={() => setActiveTab('create')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Coupon
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Create/Edit Tab */}
            <TabsContent value="create">
              <CouponForm 
                coupon={selectedCoupon}
                onSuccess={() => {
                  setShowForm(false)
                  setSelectedCoupon(null)
                  setActiveTab('list')
                  fetchCoupons()
                }}
                onCancel={() => {
                  setShowForm(false)
                  setSelectedCoupon(null)
                  setActiveTab('list')
                }}
              />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <CouponAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
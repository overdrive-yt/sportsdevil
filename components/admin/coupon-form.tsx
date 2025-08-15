'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { cn } from '../../lib/utils'
import { format } from 'date-fns'
import { 
  Calendar as CalendarIcon,
  Info,
  Shuffle,
  Save,
  X,
  AlertCircle,
  Clock,
  Users,
  Package,
  Loader2
} from 'lucide-react'
import { useToast } from '../../hooks/use-toast'

interface CouponFormProps {
  coupon?: any
  onSuccess: () => void
  onCancel: () => void
}

// V9.11.2: Smart Coupon Form with Advanced Controls
export function CouponForm({ coupon, onSuccess, onCancel }: CouponFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minimumAmount: 0,
    maximumDiscount: null as number | null,
    usageLimit: null as number | null,
    maxUsesPerUser: 1,
    isActive: true,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    
    // V9.11.2 Enhanced fields
    requiresAccount: true,
    stackable: false,
    priority: 0,
    targetSegment: { type: 'all' },
    timeRestrictions: null as any,
    scheduleStart: null as Date | null,
    scheduleEnd: null as Date | null,
    buyXQuantity: null as number | null,
    getYQuantity: null as number | null,
    applicableProducts: [] as string[],
    applicableCategories: [] as string[]
  })

  const { toast } = useToast()

  // Load coupon data if editing
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : 0,
        maximumDiscount: coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null,
        usageLimit: coupon.usageLimit,
        maxUsesPerUser: coupon.maxUsesPerUser || 1,
        isActive: coupon.isActive,
        validFrom: new Date(coupon.validFrom),
        validUntil: new Date(coupon.validUntil),
        requiresAccount: coupon.requiresAccount,
        stackable: coupon.stackable,
        priority: coupon.priority,
        targetSegment: coupon.targetSegment || { type: 'all' },
        timeRestrictions: coupon.timeRestrictions,
        scheduleStart: coupon.scheduleStart ? new Date(coupon.scheduleStart) : null,
        scheduleEnd: coupon.scheduleEnd ? new Date(coupon.scheduleEnd) : null,
        buyXQuantity: coupon.buyXQuantity,
        getYQuantity: coupon.getYQuantity,
        applicableProducts: coupon.applicableProducts || [],
        applicableCategories: coupon.applicableCategories || []
      })
    }
  }, [coupon])

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.code) {
      toast({
        title: 'Validation Error',
        description: 'Coupon code is required',
        variant: 'destructive'
      })
      return
    }

    if (formData.discountValue <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Discount value must be greater than 0',
        variant: 'destructive'
      })
      return
    }

    if (formData.discountType === 'BUY_X_GET_Y' && (!formData.buyXQuantity || !formData.getYQuantity)) {
      toast({
        title: 'Validation Error',
        description: 'Buy X and Get Y quantities are required for this discount type',
        variant: 'destructive'
      })
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        ...formData,
        validFrom: formData.validFrom.toISOString(),
        validUntil: formData.validUntil.toISOString(),
        scheduleStart: formData.scheduleStart?.toISOString() || null,
        scheduleEnd: formData.scheduleEnd?.toISOString() || null,
        targetSegment: formData.targetSegment.type !== 'all' ? formData.targetSegment : null,
        timeRestrictions: formData.timeRestrictions || null
      }

      const response = await fetch(
        coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons',
        {
          method: coupon ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save coupon')
      }

      toast({
        title: 'Success',
        description: `Coupon ${coupon ? 'updated' : 'created'} successfully`
      })

      onSuccess()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save coupon',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Set up the core coupon details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Coupon Code*</Label>
              <div className="flex space-x-2">
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SUMMER20"
                  required
                  disabled={!!coupon}
                />
                {!coupon && (
                  <Button type="button" variant="outline" onClick={generateCode}>
                    <Shuffle className="h-4 w-4 mr-2" />
                    Generate
                  </Button>
                )}
              </div>
              {coupon && (
                <p className="text-xs text-muted-foreground">
                  Coupon codes cannot be changed after creation
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Summer sale - 20% off all cricket equipment"
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select 
                value={formData.discountType} 
                onValueChange={(value) => setFormData({ ...formData, discountType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                  <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                  <SelectItem value="BUY_X_GET_Y">Buy X Get Y</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.discountType !== 'FREE_SHIPPING' && formData.discountType !== 'BUY_X_GET_Y' && (
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  Discount Value* {formData.discountType === 'PERCENTAGE' ? '(%)' : '(£)'}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step={formData.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            )}

            {formData.discountType === 'BUY_X_GET_Y' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buyX">Buy Quantity</Label>
                  <Input
                    id="buyX"
                    type="number"
                    min="1"
                    value={formData.buyXQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, buyXQuantity: parseInt(e.target.value) || null })}
                    placeholder="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="getY">Get Quantity</Label>
                  <Input
                    id="getY"
                    type="number"
                    min="1"
                    value={formData.getYQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, getYQuantity: parseInt(e.target.value) || null })}
                    placeholder="1"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minimumAmount">Minimum Order (£)</Label>
                <Input
                  id="minimumAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minimumAmount}
                  onChange={(e) => setFormData({ ...formData, minimumAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              {formData.discountType === 'PERCENTAGE' && (
                <div className="space-y-2">
                  <Label htmlFor="maximumDiscount">Max Discount (£)</Label>
                  <Input
                    id="maximumDiscount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.maximumDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maximumDiscount: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="Optional"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Controls</CardTitle>
            <CardDescription>Set limits and restrictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Coupon can be used by customers
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="usageLimit">Total Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                min="1"
                value={formData.usageLimit || ''}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null })}
                placeholder="Unlimited"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for unlimited uses
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsesPerUser">Uses Per Customer</Label>
              <Input
                id="maxUsesPerUser"
                type="number"
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Requires Account</Label>
                <p className="text-sm text-muted-foreground">
                  Customer must be logged in
                </p>
              </div>
              <Switch
                checked={formData.requiresAccount}
                onCheckedChange={(checked) => setFormData({ ...formData, requiresAccount: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Stackable</Label>
                <p className="text-sm text-muted-foreground">
                  Can be used with other coupons
                </p>
              </div>
              <Switch
                checked={formData.stackable}
                onCheckedChange={(checked) => setFormData({ ...formData, stackable: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                Higher priority coupons are applied first
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
            <CardDescription>When the coupon can be used</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.validFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validFrom ? format(formData.validFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validFrom}
                      onSelect={(date) => date && setFormData({ ...formData, validFrom: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Valid Until*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.validUntil && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.validUntil ? format(formData.validUntil, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.validUntil}
                      onSelect={(date) => date && setFormData({ ...formData, validUntil: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <Label className="text-blue-900">Schedule Activation (Optional)</Label>
              </div>
              <p className="text-sm text-blue-700">
                Set a future date to automatically activate/deactivate this coupon
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-xs">Schedule Start</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduleStart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {formData.scheduleStart ? format(formData.scheduleStart, "PP") : "Not set"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduleStart || undefined}
                        onSelect={(date) => setFormData({ ...formData, scheduleStart: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Schedule End</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.scheduleEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        {formData.scheduleEnd ? format(formData.scheduleEnd, "PP") : "Not set"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.scheduleEnd || undefined}
                        onSelect={(date) => setFormData({ ...formData, scheduleEnd: date || null })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Targeting */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Targeting</CardTitle>
            <CardDescription>Who can use this coupon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Target Segment</Label>
              <Select 
                value={formData.targetSegment.type} 
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  targetSegment: { type: value as any }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="new">New Customers Only</SelectItem>
                  <SelectItem value="returning">Returning Customers</SelectItem>
                  <SelectItem value="vip">VIP Customers</SelectItem>
                  <SelectItem value="location">Location Based</SelectItem>
                  <SelectItem value="purchase_history">Purchase History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetSegment.type === 'new' && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-900 font-medium">New Customer Validation</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  This coupon will only work for customers who have never placed an order
                </p>
              </div>
            )}

            {formData.targetSegment.type === 'vip' && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <p className="text-sm text-purple-900 font-medium">VIP Customer Criteria</p>
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  Available to customers with £100+ total spending
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
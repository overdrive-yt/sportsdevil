// V9.16: Real-time Notifications Center
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  X,
  ShoppingCart,
  Users,
  Package,
  CreditCard,
  Ticket
} from 'lucide-react'
import { EnhancedCard } from '../ui/enhanced-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ScrollArea } from '../ui/scroll-area'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  category: 'orders' | 'products' | 'customers' | 'system' | 'coupons'
  actionUrl?: string
}

interface NotificationsCenterProps {
  className?: string
}

export function NotificationsCenter({ className }: NotificationsCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchNotifications = async () => {
    try {
      // Simulate API call - in production this would fetch from /api/notifications
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'New Order Received',
          message: 'Order #ORD-2024-089 for £125.99 from James Wilson',
          timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
          read: false,
          category: 'orders',
          actionUrl: '/admin/orders/ORD-2024-089'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Low Stock Alert',
          message: 'Gray-Nicolls Kaboom Pro has only 3 units remaining',
          timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
          read: false,
          category: 'products',
          actionUrl: '/admin/products/gray-nicolls-kaboom-pro'
        },
        {
          id: '3',
          type: 'info',
          title: 'Customer Registration',
          message: 'Sarah Thompson created a new account',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: true,
          category: 'customers'
        },
        {
          id: '4',
          type: 'success',
          title: 'Coupon Usage',
          message: 'FIRST7 coupon used by new customer Mike Davis',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          read: true,
          category: 'coupons'
        },
        {
          id: '5',
          type: 'error',
          title: 'Payment Failed',
          message: 'Order #ORD-2024-087 payment processing failed',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          read: false,
          category: 'orders',
          actionUrl: '/admin/orders/ORD-2024-087'
        },
        {
          id: '6',
          type: 'info',
          title: 'System Update',
          message: 'Dashboard analytics updated successfully',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: true,
          category: 'system'
        }
      ]
      
      setNotifications(mockNotifications)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchNotifications()
    setIsRefreshing(false)
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const clearNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    )
  }

  const getIcon = (type: string, category: string) => {
    if (type === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />
    if (type === 'warning') return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    if (type === 'error') return <XCircle className="h-4 w-4 text-red-600" />
    
    // Category-specific icons for info type
    switch (category) {
      case 'orders': return <ShoppingCart className="h-4 w-4 text-blue-600" />
      case 'products': return <Package className="h-4 w-4 text-purple-600" />
      case 'customers': return <Users className="h-4 w-4 text-green-600" />
      case 'coupons': return <Ticket className="h-4 w-4 text-orange-600" />
      default: return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const filteredNotifications = showOnlyUnread 
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  if (isLoading) {
    return (
      <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </EnhancedCard>
    )
  }

  return (
    <EnhancedCard className={`p-6 bg-white border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-700" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Notifications
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            size="sm"
            variant="ghost"
            className="gap-2"
          >
            {showOnlyUnread ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showOnlyUnread ? 'All' : 'Unread'}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            size="sm"
            variant="ghost"
            className="p-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </span>
          <Button onClick={markAllAsRead} size="sm" variant="ghost" className="text-xs">
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="h-96">
        <div className="space-y-3">
          <AnimatePresence>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">
                  {showOnlyUnread ? 'No unread notifications' : 'No notifications'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200 opacity-75' 
                      : getBgColor(notification.type)
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type, notification.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {getRelativeTime(notification.timestamp)}
                          </span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {!notification.read && (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          title="Mark as read"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {notification.actionUrl && (
                        <Button
                          onClick={() => window.open(notification.actionUrl, '_blank')}
                          size="sm"
                          variant="ghost"
                          className="p-1 h-6 w-6"
                          title="View details"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        onClick={() => clearNotification(notification.id)}
                        size="sm"
                        variant="ghost"
                        className="p-1 h-6 w-6 text-gray-400 hover:text-red-600"
                        title="Dismiss"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </EnhancedCard>
  )
}
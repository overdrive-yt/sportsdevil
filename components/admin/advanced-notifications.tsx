// V9.13.2: Advanced Notification System with Action Buttons
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, 
  Check, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Clock,
  Trash2,
  MessageCircle,
  Archive,
  Settings,
  Filter,
  Search,
  MoreVertical,
  ExternalLink,
  Copy,
  Download,
  Share
} from 'lucide-react'
import { EnhancedCard } from '../ui/enhanced-card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Switch } from '../ui/switch'
import { Separator } from '../ui/separator'

interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'system' | 'order' | 'inventory' | 'integration' | 'security'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  isArchived: boolean
  priority: 'low' | 'medium' | 'high' | 'critical'
  actions?: {
    id: string
    label: string
    variant: 'default' | 'destructive' | 'outline' | 'ghost'
    action: () => void
  }[]
  metadata?: {
    orderId?: string
    productId?: string
    integrationId?: string
    errorCode?: string
    link?: string
  }
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  desktopNotifications: boolean
  categories: {
    system: boolean
    order: boolean
    inventory: boolean
    integration: boolean
    security: boolean
  }
}

export function AdvancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    categories: {
      system: true,
      order: true,
      inventory: true,
      integration: true,
      security: true
    }
  })

  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'error',
        category: 'integration',
        title: 'eBay Integration Error',
        message: 'Failed to sync product inventory. Authentication token may have expired.',
        timestamp: '2 minutes ago',
        isRead: false,
        isArchived: false,
        priority: 'high',
        actions: [
          {
            id: 'retry',
            label: 'Retry Sync',
            variant: 'default',
            action: () => console.log('Retrying sync...')
          },
          {
            id: 'configure',
            label: 'Configure',
            variant: 'outline',
            action: () => console.log('Opening configuration...')
          }
        ],
        metadata: {
          integrationId: 'ebay-1',
          errorCode: 'AUTH_TOKEN_EXPIRED'
        }
      },
      {
        id: '2',
        type: 'warning',
        category: 'inventory',
        title: 'Low Stock Alert',
        message: 'Professional Cricket Bat (SKU: BAT-PROF-001) is running low in stock (5 remaining).',
        timestamp: '15 minutes ago',
        isRead: false,
        isArchived: false,
        priority: 'medium',
        actions: [
          {
            id: 'reorder',
            label: 'Reorder Stock',
            variant: 'default',
            action: () => console.log('Creating reorder...')
          },
          {
            id: 'view-product',
            label: 'View Product',
            variant: 'outline',
            action: () => console.log('Opening product...')
          }
        ],
        metadata: {
          productId: 'bat-prof-001'
        }
      },
      {
        id: '3',
        type: 'success',
        category: 'order',
        title: 'Order Completed',
        message: 'Order #ORD-2024-001 has been successfully completed and delivered.',
        timestamp: '1 hour ago',
        isRead: true,
        isArchived: false,
        priority: 'low',
        actions: [
          {
            id: 'view-order',
            label: 'View Order',
            variant: 'outline',
            action: () => console.log('Opening order...')
          }
        ],
        metadata: {
          orderId: 'ORD-2024-001'
        }
      },
      {
        id: '4',
        type: 'info',
        category: 'system',
        title: 'System Maintenance',
        message: 'Scheduled maintenance window will begin at 2:00 AM GMT tomorrow.',
        timestamp: '3 hours ago',
        isRead: false,
        isArchived: false,
        priority: 'medium',
        actions: [
          {
            id: 'schedule',
            label: 'View Schedule',
            variant: 'outline',
            action: () => console.log('Opening schedule...')
          }
        ]
      },
      {
        id: '5',
        type: 'warning',
        category: 'security',
        title: 'Unusual Login Activity',
        message: 'Multiple failed login attempts detected from IP 192.168.1.100.',
        timestamp: '6 hours ago',
        isRead: true,
        isArchived: false,
        priority: 'high',
        actions: [
          {
            id: 'block-ip',
            label: 'Block IP',
            variant: 'destructive',
            action: () => console.log('Blocking IP...')
          },
          {
            id: 'security-log',
            label: 'View Security Log',
            variant: 'outline',
            action: () => console.log('Opening security log...')
          }
        ]
      }
    ]

    setNotifications(mockNotifications)
  }, [])

  useEffect(() => {
    let filtered = notifications

    // Filter by tab
    if (selectedTab !== 'all') {
      if (selectedTab === 'unread') {
        filtered = filtered.filter(n => !n.isRead)
      } else if (selectedTab === 'archived') {
        filtered = filtered.filter(n => n.isArchived)
      } else {
        filtered = filtered.filter(n => n.category === selectedTab)
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Show non-archived by default unless viewing archived tab
    if (selectedTab !== 'archived') {
      filtered = filtered.filter(n => !n.isArchived)
    }

    setFilteredNotifications(filtered)
  }, [notifications, selectedTab, searchQuery])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
      default: return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const archiveNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isArchived: true } : n
    ))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell className="h-8 w-8 text-primary" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">
              {unreadCount} unread messages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="gap-2"
          >
            <Check className="h-4 w-4" />
            Mark All Read
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="p-3">
                <h4 className="font-medium mb-3">Notification Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Notifications</span>
                    <Switch
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Push Notifications</span>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Desktop Notifications</span>
                    <Switch
                      checked={settings.desktopNotifications}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, desktopNotifications: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread" className="relative">
            Unread
            {unreadCount > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="order">Orders</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-4">
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No notifications</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No notifications match your search.' : 'You\'re all caught up!'}
                  </p>
                </motion.div>
              ) : (
                filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`relative ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <EnhancedCard className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className={`font-medium ${!notification.isRead ? 'font-semibold' : ''}`}>
                                  {notification.title}
                                </h4>
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {notification.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.timestamp}
                              </p>
                            </div>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.isRead && (
                                  <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copy Message
                                </DropdownMenuItem>
                                {notification.metadata?.link && (
                                  <DropdownMenuItem>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open Link
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteNotification(notification.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Action Buttons */}
                          {notification.actions && notification.actions.length > 0 && (
                            <div className="flex items-center gap-2 pt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={action.variant}
                                  onClick={action.action}
                                  className="text-xs"
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {!notification.isRead && (
                          <div className="flex-shrink-0">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </EnhancedCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
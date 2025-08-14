'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Globe, 
  Instagram, 
  MapPin, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Home,
  Users,
  Tag,
  TrendingUp,
  MessageSquare,
  Star,
  Shield,
  Moon,
  Sun,
  Monitor,
  Search,
  Command
} from 'lucide-react'
import { useTheme } from 'next-themes'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  className?: string
}

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    title: 'Analytics Hub',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: 'NEW',
    children: [
      { title: 'Overview', href: '/admin/analytics', icon: TrendingUp },
      { title: 'Revenue', href: '/admin/analytics/revenue', icon: TrendingUp },
      { title: 'Performance', href: '/admin/analytics/performance', icon: BarChart3 },
    ]
  },
  {
    title: 'E-commerce',
    href: '/admin/products',
    icon: Package,
    children: [
      { title: 'Products', href: '/admin/products', icon: Package },
      { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { title: 'Inventory', href: '/admin/inventory', icon: Package },
      { title: 'Coupons', href: '/admin/coupons', icon: Tag },
    ]
  },
  {
    title: 'Platform Integrations',
    href: '/admin/integrations',
    icon: Globe,
    badge: 'V9.11.5',
    children: [
      { title: 'TikTok Shop', href: '/admin/integrations/tiktok', icon: Globe },
      { title: 'Xepos POS', href: '/admin/integrations/xepos', icon: Globe },
      { title: 'eBay Store', href: '/admin/integrations/ebay', icon: Globe },
    ]
  },
  {
    title: 'Social Media',
    href: '/admin/social',
    icon: Instagram,
    badge: 'COMING',
    children: [
      { title: 'Instagram', href: '/admin/social/instagram', icon: Instagram },
      { title: 'Facebook', href: '/admin/social/facebook', icon: MessageSquare },
      { title: 'Content Manager', href: '/admin/social/content', icon: MessageSquare },
    ]
  },
  {
    title: 'Local Business',
    href: '/admin/local',
    icon: MapPin,
    badge: 'COMING',
    children: [
      { title: 'Google My Business', href: '/admin/local/google', icon: MapPin },
      { title: 'Reviews', href: '/admin/local/reviews', icon: Star },
      { title: 'Store Location', href: '/admin/local/location', icon: MapPin },
    ]
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'System',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdvancedSidebar({ isCollapsed, onToggle, className }: SidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleExpanded = (title: string) => {
    if (isCollapsed) return
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const isItemExpanded = (title: string) => {
    return expandedItems.includes(title) || navItems.some(item => 
      item.title === title && item.children?.some(child => isItemActive(child.href))
    )
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'NEW':
        return 'bg-green-500 text-white'
      case 'COMING':
        return 'bg-orange-500 text-white'
      case 'V9.11.5':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  const contentVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  }

  return (
    <motion.div
      initial="expanded"
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative h-screen bg-white border-r border-gray-200 flex flex-col",
        "dark:bg-gray-900 dark:border-gray-800",
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                transition={{ duration: 0.2 }}
                className="flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Sports Devil
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Admin Dashboard
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <Search className="w-4 h-4 mr-2" />
            <span>Search...</span>
            <kbd className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
              <Command className="w-3 h-3 inline mr-1" />K
            </kbd>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-2 py-2">
          {navItems.map((item) => (
            <div key={item.title}>
              <div className="relative">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    isItemActive(item.href) 
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" 
                      : "text-gray-700 dark:text-gray-300"
                  )}
                  onClick={() => item.children && toggleExpanded(item.title)}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isItemActive(item.href) ? "text-blue-600 dark:text-blue-400" : ""
                  )} />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        variants={contentVariants}
                        initial="collapsed"
                        animate="expanded"
                        exit="collapsed"
                        transition={{ duration: 0.2 }}
                        className="flex items-center justify-between w-full"
                      >
                        <span className="font-medium">{item.title}</span>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs px-1.5 py-0.5", getBadgeColor(item.badge))}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {item.children && (
                            <ChevronRight 
                              className={cn(
                                "w-4 h-4 transition-transform duration-200",
                                isItemExpanded(item.title) ? "rotate-90" : ""
                              )} 
                            />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Link>
              </div>

              {/* Sub-navigation */}
              <AnimatePresence>
                {!isCollapsed && item.children && isItemExpanded(item.title) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        href={child.href}
                        className={cn(
                          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                          "hover:bg-gray-100 dark:hover:bg-gray-800",
                          isItemActive(child.href)
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            : "text-gray-600 dark:text-gray-400"
                        )}
                      >
                        <child.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </span>
                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('light')}
                    className={cn(
                      "p-1.5",
                      theme === 'light' ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                    )}
                  >
                    <Sun className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('dark')}
                    className={cn(
                      "p-1.5",
                      theme === 'dark' ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                    )}
                  >
                    <Moon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme('system')}
                    className={cn(
                      "p-1.5",
                      theme === 'system' ? "bg-white dark:bg-gray-700 shadow-sm" : ""
                    )}
                  >
                    <Monitor className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Version Info */}
              <div className="text-center">
                <Badge variant="outline" className="text-xs">
                  V9.13.1 Advanced
                </Badge>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center space-y-2"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2"
              >
                {mounted && theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
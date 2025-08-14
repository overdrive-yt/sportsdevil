'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Command,
  ArrowRight,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Globe,
  Settings,
  Instagram,
  MapPin,
  Tag,
  Eye,
  Plus,
  TrendingUp,
  Star,
  MessageSquare
} from 'lucide-react'

interface SearchItem {
  id: string
  title: string
  description: string
  href: string
  category: string
  icon: React.ElementType
  keywords: string[]
  badge?: string
}

const searchItems: SearchItem[] = [
  // Dashboard & Analytics
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description: 'Main admin dashboard with system overview',
    href: '/admin',
    category: 'Dashboard',
    icon: BarChart3,
    keywords: ['dashboard', 'overview', 'main', 'home', 'admin']
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Performance metrics and business insights',
    href: '/admin/analytics',
    category: 'Analytics',
    icon: TrendingUp,
    keywords: ['analytics', 'metrics', 'performance', 'insights', 'reports', 'data']
  },
  
  // E-commerce Management
  {
    id: 'products',
    title: 'Product Management',
    description: 'Manage your sports equipment catalog',
    href: '/admin/products',
    category: 'E-commerce',
    icon: Package,
    keywords: ['products', 'catalog', 'inventory', 'equipment', 'sports', 'items']
  },
  {
    id: 'product-add',
    title: 'Add New Product',
    description: 'Smart product upload with category-adaptive forms',
    href: '/admin/products/new',
    category: 'E-commerce',
    icon: Plus,
    keywords: ['add', 'new', 'product', 'upload', 'create', 'smart', 'form'],
    badge: 'Quick Action'
  },
  {
    id: 'orders',
    title: 'Order Management',
    description: 'View and manage customer orders',
    href: '/admin/orders',
    category: 'E-commerce',
    icon: ShoppingCart,
    keywords: ['orders', 'sales', 'purchases', 'customers', 'fulfillment']
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    description: 'Track stock levels and inventory',
    href: '/admin/inventory',
    category: 'E-commerce',
    icon: Package,
    keywords: ['inventory', 'stock', 'levels', 'warehouse', 'tracking']
  },
  {
    id: 'coupons',
    title: 'Coupon Management',
    description: 'Create and manage discount codes',
    href: '/admin/coupons',
    category: 'E-commerce',
    icon: Tag,
    keywords: ['coupons', 'discounts', 'codes', 'promotions', 'offers'],
    badge: 'Complete'
  },

  // Platform Integrations
  {
    id: 'integrations',
    title: 'Platform Integrations',
    description: 'Manage TikTok Shop, Xepos, eBay connections',
    href: '/admin/integrations',
    category: 'Integrations',
    icon: Globe,
    keywords: ['integrations', 'platforms', 'tiktok', 'xepos', 'ebay', 'sync'],
    badge: 'V9.11.5'
  },
  {
    id: 'tiktok-integration',
    title: 'TikTok Shop',
    description: 'Social commerce integration',
    href: '/admin/integrations/tiktok',
    category: 'Integrations',
    icon: Globe,
    keywords: ['tiktok', 'shop', 'social', 'commerce', 'viral', 'marketing']
  },
  {
    id: 'xepos-integration',
    title: 'Xepos POS',
    description: 'Point of sale system integration',
    href: '/admin/integrations/xepos',
    category: 'Integrations',
    icon: Globe,
    keywords: ['xepos', 'pos', 'point', 'sale', 'store', 'birmingham']
  },
  {
    id: 'ebay-integration',
    title: 'eBay Marketplace',
    description: 'Online marketplace integration',
    href: '/admin/integrations/ebay',
    category: 'Integrations',
    icon: Globe,
    keywords: ['ebay', 'marketplace', 'auction', 'listing', 'selling']
  },

  // Social Media (Coming Soon)
  {
    id: 'social-media',
    title: 'Social Media Management',
    description: 'Manage Instagram, Facebook, TikTok content',
    href: '/admin/social',
    category: 'Social Media',
    icon: Instagram,
    keywords: ['social', 'media', 'instagram', 'facebook', 'content', 'posting'],
    badge: 'Coming Soon'
  },

  // Local Business (Coming Soon)
  {
    id: 'local-business',
    title: 'Local Business',
    description: 'Google My Business and local SEO',
    href: '/admin/local',
    category: 'Local Business',
    icon: MapPin,
    keywords: ['local', 'business', 'google', 'maps', 'reviews', 'seo'],
    badge: 'Coming Soon'
  },

  // Customers
  {
    id: 'customers',
    title: 'Customer Management',
    description: 'View and manage customer accounts',
    href: '/admin/customers',
    category: 'Customers',
    icon: Users,
    keywords: ['customers', 'users', 'accounts', 'profiles', 'management']
  },

  // Settings
  {
    id: 'settings',
    title: 'System Settings',
    description: 'Configure admin dashboard and store settings',
    href: '/admin/settings',
    category: 'Settings',
    icon: Settings,
    keywords: ['settings', 'configuration', 'system', 'admin', 'preferences']
  }
]

interface FuzzySearchProps {
  isOpen: boolean
  onClose: () => void
}

export function FuzzySearch({ isOpen, onClose }: FuzzySearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  // Simple fuzzy search implementation
  const filteredItems = useMemo(() => {
    if (!query.trim()) return searchItems.slice(0, 8) // Show top 8 items when no query
    
    const searchTerm = query.toLowerCase()
    
    return searchItems
      .map(item => {
        let score = 0
        
        // Title exact match (highest priority)
        if (item.title.toLowerCase().includes(searchTerm)) {
          score += 10
        }
        
        // Description match
        if (item.description.toLowerCase().includes(searchTerm)) {
          score += 5
        }
        
        // Keywords match
        const keywordMatches = item.keywords.filter(keyword => 
          keyword.includes(searchTerm)
        ).length
        score += keywordMatches * 3
        
        // Category match
        if (item.category.toLowerCase().includes(searchTerm)) {
          score += 2
        }
        
        return { ...item, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Show top 10 results
  }, [query])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < filteredItems.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredItems.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (filteredItems[selectedIndex]) {
            handleItemSelect(filteredItems[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex, onClose])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  const handleItemSelect = useCallback((item: SearchItem) => {
    router.push(item.href)
    onClose()
  }, [router, onClose])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Dashboard':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Analytics':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'E-commerce':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Integrations':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'Social Media':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
      case 'Local Business':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Customers':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      case 'Settings':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Header */}
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground mr-3" />
            <Input
              placeholder="Search admin dashboard..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 text-base"
              autoFocus
            />
            <div className="flex items-center space-x-1 text-xs text-muted-foreground ml-3">
              <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                <Command className="w-3 h-3 inline" />
              </kbd>
              <kbd className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                K
              </kbd>
            </div>
          </div>

          {/* Search Results */}
          <ScrollArea className="max-h-96">
            <div className="p-2">
              {filteredItems.length === 0 ? (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                  <p className="text-xs mt-1">Try searching for products, orders, or settings</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`
                        flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                        ${index === selectedIndex 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                      onClick={() => handleItemSelect(item)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className={`
                          p-2 rounded-md
                          ${index === selectedIndex 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-gray-100 dark:bg-gray-800'
                          }
                        `}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{item.title}</h4>
                            {item.badge && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-3">
                        <Badge className={`${getCategoryColor(item.category)} border-0 text-xs`}>
                          {item.category}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>

          {/* Search Footer */}
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
              <span>{filteredItems.length} result{filteredItems.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing search modal
export function useFuzzySearch() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }
}
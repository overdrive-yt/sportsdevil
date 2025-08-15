'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items
  ]

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground mb-6', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          const isHome = index === 0

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/60" />
              )}
              
              {isLast ? (
                <span 
                  className="font-medium text-foreground truncate max-w-[200px]" 
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href || '#'}
                  className="hover:text-foreground transition-colors flex items-center"
                >
                  {isHome && <Home className="h-4 w-4 mr-1" />}
                  <span className={isHome ? 'sr-only' : ''}>{item.label}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

// Helper function to generate breadcrumbs based on current page
export function generateBreadcrumbs(pathname: string, params?: { [key: string]: string }) {
  const items: BreadcrumbItem[] = []
  
  // Remove leading slash and split path
  const pathSegments = pathname.replace(/^\//, '').split('/').filter(Boolean)
  
  pathSegments.forEach((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/')
    
    // Convert segment to readable label
    let label = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
    
    // Special handling for common routes
    if (segment === 'products') {
      label = 'Products'
      
      // Add category breadcrumb if available
      if (params?.category) {
        items.push({ label, href })
        label = params.category
        // Don't add href for category as it's handled by query params
        items.push({ label })
        return
      }
    } else if (segment === 'dashboard') {
      label = 'My Account'
    } else if (segment === 'wishlist') {
      label = 'Wishlist'
    }
    
    // Add the item
    items.push({ label, href: index === pathSegments.length - 1 ? undefined : href })
  })
  
  return items
}

// Specific breadcrumb components for common pages
interface ProductBreadcrumbProps {
  productName: string
  categoryName?: string
  categorySlug?: string
}

export function ProductBreadcrumb({ productName, categoryName, categorySlug }: ProductBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Products', href: '/products' }
  ]
  
  if (categoryName && categorySlug) {
    items.push({ 
      label: categoryName, 
      href: `/products?category=${encodeURIComponent(categoryName)}` 
    })
  }
  
  items.push({ label: productName })
  
  return <Breadcrumb items={items} />
}

interface CategoryBreadcrumbProps {
  categoryName: string
}

export function CategoryBreadcrumb({ categoryName }: CategoryBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Products', href: '/products' },
    { label: categoryName }
  ]
  
  return <Breadcrumb items={items} />
}

interface SearchBreadcrumbProps {
  searchQuery: string
}

export function SearchBreadcrumb({ searchQuery }: SearchBreadcrumbProps) {
  const items: BreadcrumbItem[] = [
    { label: 'Products', href: '/products' },
    { label: `Search: ${searchQuery}` }
  ]
  
  return <Breadcrumb items={items} />
}
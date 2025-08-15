"use client"

import React, { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronRight, 
  Home, 
  Package, 
  Search, 
  ShoppingCart, 
  User,
  Heart,
  Folder,
  Shield,
  Circle,
  Dumbbell
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { 
  BreadcrumbGenerator,
  type BreadcrumbItem,
  type BreadcrumbConfig
} from '../../lib/navigation/breadcrumbs'

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[]
  config?: BreadcrumbConfig
  className?: string
  showSchema?: boolean // Add structured data for SEO
  variant?: 'default' | 'compact' | 'pills'
}

export function BreadcrumbNav({
  items,
  config = {},
  className = '',
  showSchema = true,
  variant = 'default'
}: BreadcrumbNavProps) {
  const pathname = usePathname()
  
  // Generate breadcrumbs from current path if items not provided
  const breadcrumbs = items || BreadcrumbGenerator.generateBreadcrumbs(pathname, config)

  if (breadcrumbs.length === 0) {
    return null
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return null

    const iconMap: Record<string, React.ReactElement> = {
      'home': <Home className="h-4 w-4" />,
      'package': <Package className="h-4 w-4" />,
      'search': <Search className="h-4 w-4" />,
      'shopping-cart': <ShoppingCart className="h-4 w-4" />,
      'user': <User className="h-4 w-4" />,
      'heart': <Heart className="h-4 w-4" />,
      'folder': <Folder className="h-4 w-4" />,
      'shield': <Shield className="h-4 w-4" />,
      'circle': <Circle className="h-4 w-4" />,
      'dumbbell': <Dumbbell className="h-4 w-4" />
    }

    return iconMap[iconName] || null
  }

  const renderSeparator = () => {
    switch (variant) {
      case 'compact':
        return <ChevronRight className="h-3 w-3 text-gray-400" />
      case 'pills':
        return <span className="text-gray-400 px-1">•</span>
      default:
        return <ChevronRight className="h-4 w-4 text-gray-500" />
    }
  }

  const getItemStyles = (item: BreadcrumbItem, index: number) => {
    const baseStyles = "flex items-center gap-1 transition-colors"
    
    switch (variant) {
      case 'compact':
        return cn(
          baseStyles,
          "text-xs",
          item.isCurrent 
            ? "text-gray-900 font-medium" 
            : "text-gray-600 hover:text-gray-900"
        )
      case 'pills':
        return cn(
          baseStyles,
          "px-2 py-1 rounded-full text-sm",
          item.isCurrent
            ? "bg-blue-100 text-blue-900 font-medium"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )
      default:
        return cn(
          baseStyles,
          "text-sm",
          item.isCurrent 
            ? "text-gray-900 font-semibold" 
            : "text-gray-600 hover:text-gray-900"
        )
    }
  }

  const getContainerStyles = () => {
    switch (variant) {
      case 'compact':
        return "flex items-center gap-1 text-xs"
      case 'pills':
        return "flex items-center flex-wrap gap-1"
      default:
        return "flex items-center gap-2"
    }
  }

  // Generate structured data for SEO
  const generateStructuredData = () => {
    if (!showSchema) return null

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        ...(item.href !== '#' && !item.isCurrent && { "item": item.href })
      }))
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    )
  }

  return (
    <>
      {generateStructuredData()}
      <nav 
        className={cn(getContainerStyles(), className)}
        aria-label="Breadcrumb"
        role="navigation"
      >
        <ol className={cn(
          "flex items-center",
          variant === 'pills' ? "flex-wrap gap-1" : "gap-2"
        )}>
          {breadcrumbs.map((item, index) => (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {/* Separator (except for first item) */}
              {index > 0 && (
                <span className={cn(
                  "flex items-center",
                  variant === 'compact' ? "mx-1" : "mx-2"
                )} aria-hidden="true">
                  {renderSeparator()}
                </span>
              )}

              {/* Breadcrumb Item */}
              {item.isCurrent || item.href === '#' ? (
                <span 
                  className={getItemStyles(item, index)}
                  aria-current={item.isCurrent ? "page" : undefined}
                >
                  {config.showIcons && item.icon && (
                    <span className="flex-shrink-0">
                      {getIcon(item.icon)}
                    </span>
                  )}
                  <span className={cn(
                    item.label === '...' ? "px-1" : "",
                    variant === 'compact' ? "max-w-[120px] truncate" : "max-w-[200px] truncate"
                  )}>
                    {item.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={getItemStyles(item, index)}
                  title={item.label}
                >
                  {config.showIcons && item.icon && (
                    <span className="flex-shrink-0">
                      {getIcon(item.icon)}
                    </span>
                  )}
                  <span className={cn(
                    variant === 'compact' ? "max-w-[120px] truncate" : "max-w-[200px] truncate"
                  )}>
                    {item.label}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Specialized breadcrumb components for different contexts
export function CategoryBreadcrumbs({ 
  categorySlug, 
  config,
  className,
  variant = 'default'
}: {
  categorySlug: string
  config?: BreadcrumbConfig
  className?: string
  variant?: 'default' | 'compact' | 'pills'
}) {
  const items = BreadcrumbGenerator.generateCategoryBreadcrumbs(categorySlug, config)
  
  return (
    <BreadcrumbNav 
      items={items} 
      config={config} 
      className={className}
      variant={variant}
    />
  )
}

export function ProductBreadcrumbs({
  productSlug,
  productName,
  categorySlug,
  config,
  className,
  variant = 'default'
}: {
  productSlug: string
  productName: string
  categorySlug?: string
  config?: BreadcrumbConfig
  className?: string
  variant?: 'default' | 'compact' | 'pills'
}) {
  const items = BreadcrumbGenerator.generateProductBreadcrumbs(
    productSlug,
    productName,
    categorySlug,
    config
  )
  
  return (
    <BreadcrumbNav 
      items={items} 
      config={config} 
      className={className}
      variant={variant}
    />
  )
}

export function SearchBreadcrumbs({
  searchTerm,
  categorySlug,
  config,
  className,
  variant = 'default'
}: {
  searchTerm: string
  categorySlug?: string
  config?: BreadcrumbConfig
  className?: string
  variant?: 'default' | 'compact' | 'pills'
}) {
  const items = BreadcrumbGenerator.generateSearchBreadcrumbs(
    searchTerm,
    categorySlug,
    config
  )
  
  return (
    <BreadcrumbNav 
      items={items} 
      config={config} 
      className={className}
      variant={variant}
    />
  )
}
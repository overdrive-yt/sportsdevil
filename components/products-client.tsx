'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from './product-card'
import { ProductFilters } from './product-filters'
import { ProductSorting } from './product-sorting'
import { Pagination } from './pagination'
import { Skeleton } from './ui/skeleton'
import { Button } from './ui/button'
import { useProducts } from '../hooks/use-products'
import { useProductsContext, useCricketCategories } from '../contexts/products-context'
import { Filter, SlidersHorizontal, Search, ChevronRight, Home, Zap } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { AdvancedSearch } from './advanced-search'
import { CategoryBreadcrumb, SearchBreadcrumb } from './seo/breadcrumb'
import Link from 'next/link'

export function ProductsClient() {
  const searchParams = useSearchParams()
  const [currentPage, setCurrentPage] = useState(() => {
    const urlPage = searchParams.get('page')
    return urlPage ? parseInt(urlPage) : 1
  })
  const [pageSize, setPageSize] = useState(12)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [isPrefiltered, setIsPrefiltered] = useState(searchParams.get('prefilter') === 'true')
  const [categoryBreadcrumb, setCategoryBreadcrumb] = useState('')
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    ageCategory: searchParams.get('ageCategory') || '',
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    featured: searchParams.get('featured') === 'true' ? true : undefined,
    new: searchParams.get('new') === 'true' ? true : undefined,
    inStock: searchParams.get('inStock') === 'true' ? true : undefined,
    sort: searchParams.get('sort') || 'newest',
  })

  // Get context data for instant cricket category access
  const { filterProducts, getProductsByCategory } = useProductsContext()
  const cricketCategories = useCricketCategories()

  // DISABLE instant data - Use API for all requests for now
  const canUseInstantData = useMemo(() => {
    console.log('🚫 ProductsClient: INSTANT DATA TEMPORARILY DISABLED')
    console.log('🔧 ProductsClient: Using API for all requests to fix filtering issue')
    console.log('📊 ProductsClient: Category filter:', filters.category)
    
    // Force API usage for all requests until we fix the data mismatch
    return false
  }, [filters])

  // Get instant context data when available
  const instantData = useMemo(() => {
    if (!canUseInstantData) {
      console.log('⏭️ ProductsClient: Skipping instant data, using API instead')
      return null
    }

    console.log('⚡ ProductsClient: Processing instant data for category:', filters.category)

    let products: any[] = []
    if (filters.category === 'Wicket Keeping Gloves') {
      products = cricketCategories.wicketKeepingGloves
      console.log('🥅 ProductsClient: Using pre-filtered WK Gloves:', products.length)
    } else if (filters.category === 'Wicket Keeping Pads') {
      products = cricketCategories.wicketKeepingPads
      console.log('🥅 ProductsClient: Using pre-filtered WK Pads:', products.length)
    } else if (filters.category) {
      products = getProductsByCategory(filters.category)
      console.log('🏷️ ProductsClient: Using category filter for:', filters.category, 'found:', products.length)
    }

    // Apply sorting if needed
    if (filters.sort && products.length > 0) {
      console.log('🔄 ProductsClient: Applying additional filtering/sorting...')
      products = filterProducts(products, filters)
      console.log('🔄 ProductsClient: After filtering:', products.length)
    }

    // Apply smart stock-based sorting: in-stock first, then alphabetical within groups
    if (products.length > 0) {
      console.log('📦 ProductsClient: Applying smart stock-based sorting...')
      products = products.sort((a, b) => {
        // First priority: stock status (in-stock first)
        const aInStock = a.stockQuantity && a.stockQuantity > 0
        const bInStock = b.stockQuantity && b.stockQuantity > 0
        
        if (aInStock && !bInStock) return -1  // a is in-stock, b is out-of-stock
        if (!aInStock && bInStock) return 1   // a is out-of-stock, b is in-stock
        
        // Second priority: alphabetical within same stock status
        return a.name.localeCompare(b.name)
      })
      console.log('✅ ProductsClient: Smart sorting applied - in-stock first, then alphabetical')
    }

    // Pagination for instant data
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProducts = products.slice(startIndex, endIndex)

    const result = {
      data: paginatedProducts,
      pagination: {
        page: currentPage,
        limit: pageSize,
        total: products.length,
        totalPages: Math.ceil(products.length / pageSize),
        hasNext: endIndex < products.length,
        hasPrev: currentPage > 1,
      }
    }

    console.log('📄 ProductsClient: Instant data pagination:', {
      page: currentPage,
      pageSize: pageSize,
      total: products.length,
      showing: paginatedProducts.length
    })

    return result
  }, [canUseInstantData, filters, currentPage, pageSize, cricketCategories, getProductsByCategory, filterProducts])

  // Stabilize categories array to prevent infinite re-renders
  const stableCategories = useMemo(() => {
    return filters.categories.sort().join(',')
  }, [filters.categories])

  // Build API query parameters, handling both single and multiple categories
  const apiQueryParams = useMemo(() => {
    // Use a stable object structure to prevent unnecessary re-renders
    const baseParams = {
      search: filters.search || undefined,
      category: filters.category || undefined,
      ageCategory: filters.ageCategory || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      featured: filters.featured,
      new: filters.new,
      inStock: filters.inStock,
      sort: filters.sort || 'newest',
      page: currentPage,
      limit: pageSize,
    }
    
    // Handle multiple categories
    if (filters.categories && filters.categories.length > 0) {
      return {
        ...baseParams,
        category: undefined, // Remove single category when using multiple
        categories: stableCategories
      }
    }
    
    console.log('📡 ProductsClient: API Query Parameters:', baseParams)
    return baseParams
  }, [
    filters.search,
    filters.category, 
    filters.ageCategory,
    filters.minPrice,
    filters.maxPrice,
    filters.featured,
    filters.new,
    filters.inStock,
    filters.sort,
    stableCategories,
    currentPage,
    pageSize
  ])

  // Fall back to React Query for non-cricket categories or complex filters
  const { data: apiData, isLoading: apiLoading, error: apiError } = useProducts(apiQueryParams)

  // Log the API data response
  console.log('🌐 ProductsClient: API Hook Response:', {
    hasData: !!apiData,
    isLoading: apiLoading,
    hasError: !!apiError,
    dataLength: (apiData as any)?.data?.length || 0,
    filters,
    error: apiError?.message
  })

  // Use instant data when available, otherwise use API data
  const productsData = canUseInstantData ? instantData : apiData
  const productsLoading = canUseInstantData ? cricketCategories.isLoading : apiLoading
  const productsError = canUseInstantData ? cricketCategories.error : apiError

  // Log the final data selection with detailed breakdown
  console.log('📊 ProductsClient: Final data selection:', {
    usingInstantData: canUseInstantData,
    hasInstantData: !!instantData,
    hasApiData: !!apiData,
    finalDataCount: (productsData as any)?.data?.length || 0,
    isLoading: productsLoading,
    hasError: !!productsError,
    apiDataStructure: apiData ? {
      success: (apiData as any).success,
      dataLength: (apiData as any).data?.length,
      hasMessage: !!(apiData as any).message,
      hasPagination: !!(apiData as any).pagination
    } : 'No API data'
  })
  
  // Log the actual products data structure
  if ((apiData as any)?.data && (apiData as any).data.length > 0) {
    console.log('🎯 ProductsClient: API returned products:', (apiData as any).data.length, 'items')
    console.log('📦 ProductsClient: Sample product:', {
      name: (apiData as any).data[0].name,
      categories: (apiData as any).data[0].categories?.map((c: any) => c.name) || 'No categories',
      id: (apiData as any).data[0].id
    })
  } else if (apiData) {
    console.log('❌ ProductsClient: API returned no products, full response:', apiData)
  }
  
  // Log what's actually being passed to the UI
  if (productsData) {
    console.log('🖼️ ProductsClient: Final data passed to UI:', {
      dataLength: (productsData as any).data?.length || 0,
      isArray: Array.isArray((productsData as any).data),
      firstItem: (productsData as any).data?.[0]?.name || 'No first item'
    })
  }

  // Deep equality comparison function for arrays
  const deepEqual = useCallback((a: any[], b: any[]): boolean => {
    if (a.length !== b.length) return false
    return a.every((val, idx) => val === b[idx])
  }, [])

  // Deep equality comparison function for filter objects
  const filtersEqual = useCallback((a: typeof filters, b: typeof filters): boolean => {
    return (
      a.search === b.search &&
      a.category === b.category &&
      a.ageCategory === b.ageCategory &&
      a.minPrice === b.minPrice &&
      a.maxPrice === b.maxPrice &&
      a.featured === b.featured &&
      a.new === b.new &&
      a.inStock === b.inStock &&
      a.sort === b.sort &&
      deepEqual(a.categories, b.categories)
    )
  }, [deepEqual])

  // Memoized URL filters to prevent constant recreation
  const urlFilters = useMemo(() => {
    console.log('🔗 ProductsClient: URL changed, parsing search params...')
    
    // Create stable arrays for categories to prevent infinite renders
    const categoriesParam = searchParams.get('categories')
    const categoriesArray = categoriesParam ? categoriesParam.split(',').filter(Boolean).sort() : []
    
    const parsed = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      categories: categoriesArray,
      ageCategory: searchParams.get('ageCategory') || '',
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      new: searchParams.get('new') === 'true' ? true : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      sort: searchParams.get('sort') || 'newest',
    }
    
    console.log('🔍 ProductsClient: Parsed URL filters:', parsed)
    return parsed
  }, [searchParams.toString()])

  // Comprehensive URL parameter synchronization effect
  useEffect(() => {
    const prefilter = searchParams.get('prefilter') === 'true'
    const urlPage = searchParams.get('page')
    const newPage = urlPage ? parseInt(urlPage) : 1
    
    // Deep equality check to prevent unnecessary updates
    const filtersChanged = (
      filters.search !== urlFilters.search ||
      filters.category !== urlFilters.category ||
      filters.ageCategory !== urlFilters.ageCategory ||
      filters.sort !== urlFilters.sort ||
      filters.minPrice !== urlFilters.minPrice ||
      filters.maxPrice !== urlFilters.maxPrice ||
      filters.featured !== urlFilters.featured ||
      filters.new !== urlFilters.new ||
      filters.inStock !== urlFilters.inStock ||
      JSON.stringify(filters.categories?.sort() || []) !== JSON.stringify(urlFilters.categories?.sort() || [])
    )
    
    if (filtersChanged) {
      console.log('🔄 ProductsClient: Filters changed, updating state')
      setFilters({ ...urlFilters })
      setSearchQuery(urlFilters.search)
      setCurrentPage(1)
    } else if (currentPage !== newPage) {
      console.log('📄 ProductsClient: Page changed, updating page')
      setCurrentPage(newPage)
    }
    
    console.log('✅ ProductsClient: State sync complete - filters changed:', filtersChanged, 'page:', filtersChanged ? 1 : newPage)
    
    // Handle prefiltered navigation from header links
    if (prefilter) {
      setIsPrefiltered(true)
      
      // Set up breadcrumb based on navigation context with age category support
      let breadcrumbParts = []
      
      if (urlFilters.ageCategory) {
        const ageLabel = urlFilters.ageCategory === 'MENS' ? 'Mens' : urlFilters.ageCategory === 'JUNIOR' ? 'Junior' : urlFilters.ageCategory
        breadcrumbParts.push(ageLabel)
      }
      
      if (urlFilters.category) {
        breadcrumbParts.push(urlFilters.category)
      }
      
      if (urlFilters.search) {
        breadcrumbParts.push(urlFilters.search)
      }
      
      if (breadcrumbParts.length === 0 && (urlFilters.ageCategory || urlFilters.category || urlFilters.search)) {
        if (urlFilters.ageCategory) {
          const ageLabel = urlFilters.ageCategory === 'MENS' ? 'Mens Cricket' : urlFilters.ageCategory === 'JUNIOR' ? 'Junior Cricket' : `${urlFilters.ageCategory} Cricket`
          setCategoryBreadcrumb(ageLabel)
        } else if (urlFilters.search) {
          setCategoryBreadcrumb(`Search: ${urlFilters.search}`)
        }
      } else {
        setCategoryBreadcrumb(breadcrumbParts.join(' > '))
      }
    } else {
      setIsPrefiltered(false)
      setCategoryBreadcrumb('')
    }
  }, [searchParams])

  useEffect(() => {
    // Only reset to page 1 when pageSize changes, not when filters change
    // (filters are handled in the URL sync effect above)
    setCurrentPage(1)
  }, [pageSize])

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleSortChange = useCallback((sortValue: string) => {
    setFilters(prev => ({ 
      ...prev, 
      sort: sortValue
    }))
  }, [])


  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      categories: [],
      ageCategory: '',
      minPrice: undefined,
      maxPrice: undefined,
      featured: undefined,
      new: undefined,
      inStock: undefined,
      sort: 'newest',
    })
    setSearchQuery('')
    // Reset prefiltered state and breadcrumb when clearing filters
    setIsPrefiltered(false)
    setCategoryBreadcrumb('')
  }, [])

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value)
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const getResultsText = () => {
    if (productsLoading) return 'Loading products...'
    if (productsError) return 'Error loading products'
    if (!(productsData as any)?.data) return 'No products found'
    
    const { data: products, pagination } = productsData as any
    const { total, page, limit } = pagination || { total: 0, page: 1, limit: 12 }
    const start = (page - 1) * limit + 1
    const end = Math.min(page * limit, total)
    
    const baseText = `Showing ${start}-${end} of ${total} products`
    
    if (isPrefiltered && categoryBreadcrumb) {
      return `${baseText} in ${categoryBreadcrumb}`
    }
    
    return baseText
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.category || 
           filters.categories.length > 0 ||
           filters.minPrice || 
           filters.maxPrice || 
           filters.featured || 
           filters.new || 
           filters.inStock
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        {/* SEO-Optimized Breadcrumb Navigation */}
        {filters.search && (
          <SearchBreadcrumb searchQuery={filters.search} />
        )}
        {!filters.search && (isPrefiltered && categoryBreadcrumb || filters.category) && (
          <CategoryBreadcrumb categoryName={categoryBreadcrumb || filters.category} />
        )}
        
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-3xl font-bold">
            {isPrefiltered && categoryBreadcrumb ? categoryBreadcrumb : 'Our Products'}
          </h1>
          {isPrefiltered && (
            <Badge variant="secondary" className="text-xs">
              Filtered from navigation
            </Badge>
          )}
        </div>
        
        {/* Advanced Search Bar */}
        <div className="mb-6">
          <AdvancedSearch
            placeholder={isPrefiltered ? `Search within ${categoryBreadcrumb}...` : "Search products..."}
            onSearch={(query) => {
              setSearchQuery(query)
              setFilters(prev => ({ ...prev, search: query }))
            }}
            className="max-w-md"
            showHistory={true}
            contextCategories={filters.categories}
          />
        </div>

        {/* Results Info & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">{getResultsText()}</p>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {hasActiveFilters() && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            
            <ProductSorting onSortChange={handleSortChange} />
            
            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="sm:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-xs">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ProductFilters onFiltersChange={handleFilterChange} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block">
          <ProductFilters onFiltersChange={handleFilterChange} />
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {(() => {
            console.log('🎨 ProductsClient: UI Render Decision:', {
              productsLoading,
              productsError: !!productsError,
              hasProductsData: !!(productsData as any)?.data,
              dataLength: (productsData as any)?.data?.length || 0,
              isArray: Array.isArray((productsData as any)?.data)
            })
            return null
          })()}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Sorry, we couldn't load the products. Please try again.
              </p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          ) : (productsData as any)?.data?.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold mb-2">
                {isPrefiltered && categoryBreadcrumb 
                  ? `No products found in ${categoryBreadcrumb}` 
                  : 'No products found'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                {isPrefiltered && categoryBreadcrumb
                  ? `We don't have any products matching your criteria in ${categoryBreadcrumb}. Try browsing other categories or adjusting your search.`
                  : 'Try adjusting your search criteria or filters'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {hasActiveFilters() && (
                  <Button onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                )}
                {isPrefiltered && (
                  <Button variant="outline" asChild>
                    <Link href="/products">Browse All Products</Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <>
              {(() => {
                console.log('✅ ProductsClient: Rendering products grid with', (productsData as any)?.data?.length || 0, 'products')
                if ((productsData as any)?.data?.length > 0) {
                  console.log('📦 ProductsClient: First product being rendered:', (productsData as any).data[0].name)
                }
                return null
              })()}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {(productsData as any)?.data?.map((product: any) => {
                  console.log('🎯 ProductsClient: Mapping product for render:', product.name)
                  return <ProductCard key={product.id} product={product} />
                })}
              </div>

              {/* Pagination */}
              {(productsData as any)?.pagination && (productsData as any).pagination.totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={(productsData as any).pagination.page}
                    totalPages={(productsData as any).pagination.totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { X, Filter, Search, ChevronDown, ChevronUp, Star, Package, Tag } from 'lucide-react'
import { useCategories } from '@/hooks/use-categories'
import { formatPriceSimple } from '@/lib/utils'

interface ProductFiltersProps {
  onFiltersChange?: (filters: any) => void
  totalProducts?: number
  loading?: boolean
  showMobileSheet?: boolean
}

export function ProductFilters({ 
  onFiltersChange, 
  totalProducts = 0, 
  loading = false,
  showMobileSheet = true 
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Enhanced state management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]) // New
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [inStock, setInStock] = useState(false)
  const [featured, setFeatured] = useState(false)
  const [newArrivals, setNewArrivals] = useState(false)
  const [onSale, setOnSale] = useState(false) // New
  const [minRating, setMinRating] = useState(0)
  const [isUpdatingFromURL, setIsUpdatingFromURL] = useState(false) // New
  const [expandedSections, setExpandedSections] = useState<string[]>(['categories', 'price'])

  const { data: categoriesData } = useCategories()

  useEffect(() => {
    // Initialize filters from URL params
    setIsUpdatingFromURL(true)
    
    const search = searchParams.get('search') || ''
    const categories = searchParams.get('categories')?.split(',').filter(Boolean) || []
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || []
    const minPrice = parseInt(searchParams.get('priceMin') || '0')
    const maxPrice = parseInt(searchParams.get('priceMax') || '1000')
    const stockFilter = searchParams.get('inStock') === 'true'
    const featuredFilter = searchParams.get('featured') === 'true'
    const newFilter = searchParams.get('new') === 'true'
    const saleFilter = searchParams.get('onSale') === 'true'
    const rating = parseInt(searchParams.get('rating') || '0')

    setSearchTerm(search)
    setSelectedCategories(categories)
    setSelectedBrands(brands)
    setPriceRange([minPrice, maxPrice])
    setInStock(stockFilter)
    setFeatured(featuredFilter)
    setNewArrivals(newFilter)
    setOnSale(saleFilter)
    setMinRating(rating)
    
    // Reset flag after state updates
    setTimeout(() => setIsUpdatingFromURL(false), 50)
  }, [searchParams])

  // Debounced URL update
  const updateURL = useCallback((filters: Record<string, any>) => {
    const params = new URLSearchParams()
    
    // Only add non-empty/non-default values to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && 
          (Array.isArray(value) ? value.length > 0 : value !== false)) {
        if (Array.isArray(value)) {
          params.set(key, value.join(','))
        } else if (key === 'priceMin' && value !== 0) {
          params.set(key, value.toString())
        } else if (key === 'priceMax' && value !== 1000) {
          params.set(key, value.toString())
        } else if (key === 'rating' && value > 0) {
          params.set(key, value.toString())
        } else if (typeof value === 'boolean' && value) {
          params.set(key, 'true')
        } else if (typeof value === 'string') {
          params.set(key, value)
        }
      }
    })

    const newURL = `${pathname}?${params.toString()}`
    router.push(newURL, { scroll: false })
  }, [pathname, router])

  // Memoized filter object to prevent constant recreation
  const currentFilters = useMemo(() => ({
    search: searchTerm,
    categories: selectedCategories,
    brands: selectedBrands,
    priceMin: priceRange[0],
    priceMax: priceRange[1],
    inStock,
    featured,
    new: newArrivals,
    onSale,
    rating: minRating
  }), [searchTerm, selectedCategories, selectedBrands, priceRange, inStock, featured, newArrivals, onSale, minRating])

  // Debounced filter application - skip if updating from URL
  useEffect(() => {
    if (isUpdatingFromURL) {
      console.log('🚫 Skipping URL update - currently syncing from URL')
      return
    }
    
    const timeoutId = setTimeout(() => {
      console.log('🔄 Updating URL with filters:', currentFilters)
      updateURL(currentFilters)
      onFiltersChange?.(currentFilters)
    }, 500) // Increased debounce time to prevent rapid updates

    return () => clearTimeout(timeoutId)
  }, [currentFilters, updateURL, onFiltersChange, isUpdatingFromURL])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedBrands([])
    setPriceRange([0, 1000])
    setInStock(false)
    setFeatured(false)
    setNewArrivals(false)
    setOnSale(false)
    setMinRating(0)
  }, [])

  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }, [])

  const toggleBrand = useCallback((brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    )
  }, [])

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }, [])

  const getActiveFiltersCount = useCallback(() => {
    let count = 0
    if (searchTerm) count++
    if (selectedCategories.length > 0) count++
    if (selectedBrands.length > 0) count++
    if (priceRange[0] > 0 || priceRange[1] < 1000) count++
    if (inStock) count++
    if (featured) count++
    if (newArrivals) count++
    if (onSale) count++
    if (minRating > 0) count++
    return count
  }, [searchTerm, selectedCategories, selectedBrands, priceRange, inStock, featured, newArrivals, onSale, minRating])

  // Mock brands data - in real app this would come from API
  const mockBrands = [
    { id: 'gray-nicolls', name: 'Gray-Nicolls', count: 15 },
    { id: 'gunn-moore', name: 'Gunn & Moore', count: 12 },
    { id: 'kookaburra', name: 'Kookaburra', count: 8 },
    { id: 'new-balance', name: 'New Balance', count: 6 },
    { id: 'adidas', name: 'Adidas', count: 5 }
  ]

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="text-xs">
              {getActiveFiltersCount()} active
            </Badge>
          )}
        </div>
        
        {getActiveFiltersCount() > 0 && (
          <div className="w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-red-600 hover:text-red-700 w-full justify-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {loading ? (
          <div className="animate-pulse">Searching...</div>
        ) : (
          <div>{totalProducts} product{totalProducts !== 1 ? 's' : ''} found</div>
        )}
      </div>

      {/* Search */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search Products
        </h4>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <Collapsible
        open={expandedSections.includes('categories')}
        onOpenChange={() => toggleSection('categories')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-gray-900">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Categories
            </div>
            {expandedSections.includes('categories') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 mt-3">
          {(categoriesData as any)?.data && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(categoriesData as any).data.map((category: any) => {
                const totalProducts = category._count?.productCategories || 0
                
                return (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label 
                      htmlFor={`category-${category.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        <span className="text-xs text-gray-500">({totalProducts})</span>
                      </div>
                    </Label>
                  </div>
                )
              })}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Brands */}
      <Collapsible
        open={expandedSections.includes('brands')}
        onOpenChange={() => toggleSection('brands')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-gray-900">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Brands
            </div>
            {expandedSections.includes('brands') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-2 mt-3">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockBrands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand.id}`}
                  checked={selectedBrands.includes(brand.id)}
                  onCheckedChange={() => toggleBrand(brand.id)}
                />
                <Label 
                  htmlFor={`brand-${brand.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span>{brand.name}</span>
                    <span className="text-xs text-gray-500">({brand.count})</span>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Price Range */}
      <Collapsible
        open={expandedSections.includes('price')}
        onOpenChange={() => toggleSection('price')}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto font-medium text-gray-900">
            <span>Price Range</span>
            {expandedSections.includes('price') ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-3">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatPriceSimple(priceRange[0])}</span>
            <span>{formatPriceSimple(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Rating Filter */}
      <div>
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Star className="h-4 w-4" />
          Minimum Rating
        </h4>
        <div className="space-y-2">
          {[0, 1, 2, 3, 4, 5].reverse().map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm ml-2">
                  {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                </span>
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick Filters */}
      <div>
        <h4 className="font-medium mb-3">Quick Filters</h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={inStock}
              onCheckedChange={(checked) => setInStock(checked === true)}
            />
            <Label htmlFor="in-stock" className="text-sm cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={onSale}
              onCheckedChange={(checked) => setOnSale(checked === true)}
            />
            <Label htmlFor="on-sale" className="text-sm cursor-pointer">
              On Sale
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={featured}
              onCheckedChange={(checked) => setFeatured(checked === true)}
            />
            <Label htmlFor="featured" className="text-sm cursor-pointer">
              Featured Products
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="new-arrivals"
              checked={newArrivals}
              onCheckedChange={(checked) => setNewArrivals(checked === true)}
            />
            <Label htmlFor="new-arrivals" className="text-sm cursor-pointer">
              New Arrivals
            </Label>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar Filters */}
      <div className="hidden lg:block">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <FiltersContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Sheet */}
      {showMobileSheet && (
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
                <SheetDescription>
                  Narrow down your search with these filters
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <FiltersContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </>
  )
}
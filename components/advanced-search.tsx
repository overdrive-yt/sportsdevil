'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Clock, Tag, Package, Star, TrendingUp } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { SearchService, SearchSuggestion } from '../lib/services/search.service'
import { cn } from '../lib/utils'

interface AdvancedSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
  showHistory?: boolean
  contextCategories?: string[]
}

export function AdvancedSearch({
  onSearch,
  placeholder = "Search products...",
  className,
  showHistory = true,
  contextCategories = []
}: AdvancedSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionRefs = useRef<(HTMLButtonElement | null)[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Initialize with URL search parameter
  useEffect(() => {
    const urlQuery = searchParams.get('search') || ''
    setQuery(urlQuery)
  }, [searchParams])
  
  // Load search history on mount
  useEffect(() => {
    if (showHistory) {
      setHistory(SearchService.getSearchHistory())
    }
  }, [showHistory])
  
  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }
      
      setIsLoading(true)
      try {
        const results = await SearchService.getSearchSuggestionsClient({
          query: searchQuery,
          limit: 8,
          includeCategories: true,
          includeBrands: true
        })
        setSuggestions(results)
      } catch (error) {
        console.error('Search suggestions error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }, 300),
    []
  )
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    
    if (value.length >= 2) {
      setIsOpen(true)
      debouncedGetSuggestions(value)
    } else {
      setIsOpen(false)
      setSuggestions([])
    }
  }
  
  // Handle search submission
  const handleSearch = async (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return
    
    // Save to history
    await SearchService.saveSearchHistory(finalQuery)
    setHistory(SearchService.getSearchHistory())
    
    // Close dropdown
    setIsOpen(false)
    setSelectedIndex(-1)
    
    // Execute search
    if (onSearch) {
      onSearch(finalQuery)
    } else {
      // Navigate to products page with search
      const params = new URLSearchParams(searchParams)
      params.set('search', finalQuery)
      params.delete('page') // Reset to first page
      router.push(`/products?${params.toString()}`)
    }
  }
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'category' || suggestion.type === 'brand') {
      // For categories/brands, navigate with category filter
      const params = new URLSearchParams()
      params.set('category', suggestion.text)
      params.set('prefilter', 'true')
      router.push(`/products?${params.toString()}`)
    } else {
      // For products and history, perform text search
      setQuery(suggestion.text)
      handleSearch(suggestion.text)
    }
  }
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return
    
    const totalItems = (showHistory && query.length < 2 ? history.length : 0) + suggestions.length
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          const historyLength = showHistory && query.length < 2 ? history.length : 0
          if (selectedIndex < historyLength) {
            handleSearch(history[selectedIndex])
          } else {
            const suggestionIndex = selectedIndex - historyLength
            handleSuggestionClick(suggestions[suggestionIndex])
          }
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Show suggestions or history
  const shouldShowDropdown = isOpen && (
    (query.length >= 2 && (suggestions.length > 0 || isLoading)) ||
    (query.length < 2 && showHistory && history.length > 0)
  )
  
  const getIconForType = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'product':
        return <Package className="h-4 w-4" />
      case 'category':
        return <Tag className="h-4 w-4" />
      case 'brand':
        return <Star className="h-4 w-4" />
      case 'history':
        return <Clock className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }
  
  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch() }} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 || (showHistory && history.length > 0) ? setIsOpen(true) : null}
          className="pl-10 pr-4"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            ×
          </Button>
        )}
      </form>
      
      {shouldShowDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80">
          <ScrollArea className="max-h-80">
            {/* Search History */}
            {query.length < 2 && showHistory && history.length > 0 && (
              <div className="p-2">
                <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Recent Searches
                </div>
                {history.map((item, index) => (
                  <button
                    key={`history-${index}`}
                    ref={el => { suggestionRefs.current[index] = el }}
                    onClick={() => handleSearch(item)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm flex items-center gap-3",
                      selectedIndex === index && "bg-gray-100"
                    )}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Loading State */}
            {isLoading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            )}
            
            {/* Search Suggestions */}
            {query.length >= 2 && suggestions.length > 0 && (
              <div className="p-2">
                {!isLoading && (
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Suggestions
                  </div>
                )}
                {suggestions.map((suggestion, index) => {
                  const adjustedIndex = (showHistory && query.length < 2 ? history.length : 0) + index
                  return (
                    <button
                      key={suggestion.id}
                      ref={el => { suggestionRefs.current[adjustedIndex] = el }}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-sm",
                        selectedIndex === adjustedIndex && "bg-gray-100"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                          {getIconForType(suggestion.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{suggestion.text}</div>
                          {suggestion.metadata && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              {suggestion.metadata.price && (
                                <Badge variant="secondary" className="text-xs">
                                  {suggestion.metadata.price}
                                </Badge>
                              )}
                              {suggestion.metadata.productCount !== undefined && (
                                <span>{suggestion.metadata.productCount} products</span>
                              )}
                              {suggestion.metadata.stock !== undefined && (
                                <span>
                                  {suggestion.metadata.stock > 0 
                                    ? `${suggestion.metadata.stock} in stock` 
                                    : 'Out of stock'
                                  }
                                </span>
                              )}
                              {suggestion.metadata.categoryName && (
                                <span>in {suggestion.metadata.categoryName}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.type}
                        </Badge>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
            
            {/* No Results */}
            {query.length >= 2 && !isLoading && suggestions.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No suggestions found for "{query}"
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
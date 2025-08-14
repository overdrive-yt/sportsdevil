import { create } from 'zustand'

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

interface SearchStore {
  query: string
  filters: SearchFilters
  recentSearches: string[]
  suggestions: string[]
  isLoading: boolean
  
  // Actions
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  updateFilter: (key: keyof SearchFilters, value: any) => void
  clearFilters: () => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
  setSuggestions: (suggestions: string[]) => void
  setLoading: (loading: boolean) => void
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  filters: {},
  recentSearches: [],
  suggestions: [],
  isLoading: false,

  setQuery: (query) => {
    set({ query })
  },

  setFilters: (filters) => {
    set({ filters })
  },

  updateFilter: (key, value) => {
    const currentFilters = get().filters
    
    if (value === undefined || value === null || value === '') {
      // Remove filter if value is empty
      const { [key]: removed, ...rest } = currentFilters
      set({ filters: rest })
    } else {
      set({
        filters: {
          ...currentFilters,
          [key]: value,
        },
      })
    }
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  addRecentSearch: (query) => {
    if (!query.trim()) return
    
    const recentSearches = get().recentSearches
    const filteredSearches = recentSearches.filter(s => s !== query)
    
    set({
      recentSearches: [query, ...filteredSearches].slice(0, 10), // Keep only 10 recent searches
    })
  },

  clearRecentSearches: () => {
    set({ recentSearches: [] })
  },

  setSuggestions: (suggestions) => {
    set({ suggestions })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },
}))
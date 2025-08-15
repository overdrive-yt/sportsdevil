'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Label } from './ui/label'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'featured', label: 'Featured' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating', label: 'Highest Rated' },
]

interface ProductSortingProps {
  onSortChange?: (sortValue: string) => void
}

export function ProductSorting({ onSortChange }: ProductSortingProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const currentSort = searchParams.get('sort') || 'newest'

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (value === 'newest') {
      params.delete('sort') // Newest is now the default
    } else {
      params.set('sort', value)
    }

    router.push(`/products?${params.toString()}`)
    
    if (onSortChange) {
      onSortChange(value)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Label htmlFor="sort-select" className="text-sm font-medium whitespace-nowrap">
        Sort by:
      </Label>
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger id="sort-select" className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
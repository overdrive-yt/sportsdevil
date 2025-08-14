'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Target,
  Shield,
  Shirt,
  HardHat,
  ShoppingBag,
  Package,
  Search,
  Check
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: any
}

interface CategorySelectorProps {
  selectedCategory: Category | null
  onSelect: (category: Category) => void
}

// V9.11.3: Visual Category Selector with Cricket Icons
export default function CategorySelector({ selectedCategory, onSelect }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Mock categories for now - will be fetched from API
  const mockCategories = [
    {
      id: '1',
      name: 'Cricket Bats',
      slug: 'cricket-bats',
      description: 'Professional and amateur cricket bats',
      icon: Target
    },
    {
      id: '2',
      name: 'Protection',
      slug: 'protection',
      description: 'Helmets, pads, guards, and safety gear',
      icon: Shield
    },
    {
      id: '3',
      name: 'Clothing',
      slug: 'clothing',
      description: 'Cricket whites, jerseys, and apparel',
      icon: Shirt
    },
    {
      id: '4',
      name: 'Wicket Keeping',
      slug: 'wicket-keeping',
      description: 'Gloves, pads, and keeper equipment',
      icon: HardHat
    },
    {
      id: '5',
      name: 'Bags & Accessories',
      slug: 'bags-accessories',
      description: 'Cricket bags, grips, and accessories',
      icon: ShoppingBag
    },
    {
      id: '6',
      name: 'Other Equipment',
      slug: 'other',
      description: 'Balls, stumps, and training equipment',
      icon: Package
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCategories(mockCategories)
      setLoading(false)
    }, 500)
  }, [])

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search categories..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredCategories.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory?.id === category.id

          return (
            <Card
              key={category.id}
              className={`relative cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(category)}
            >
              <div className="p-6 text-center space-y-3">
                <div className={`inline-flex p-3 rounded-full ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}>
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Selected
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No categories found</p>
        </div>
      )}
    </div>
  )
}
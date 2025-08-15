'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { useSearchStore } from '../stores/search-store'

export function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()
  const { setQuery: setGlobalSearchTerm } = useSearchStore()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      setGlobalSearchTerm(searchTerm.trim())
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2 max-w-md">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <Button type="submit" size="sm" variant="secondary">
        Search
      </Button>
    </form>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCurrentUser } from '@/hooks/use-auth-store'
import Link from 'next/link'

export function WishlistHeaderButton() {
  const { user, isAuthenticated } = useCurrentUser()
  const [wishlistCount, setWishlistCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchWishlistCount() {
      if (!isAuthenticated) {
        setWishlistCount(0)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch('/api/wishlist?action=count')
        const data = await response.json()
        setWishlistCount(data.count || 0)
      } catch (error) {
        console.error('Error fetching wishlist count:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlistCount()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200"
        asChild
      >
        <Link href="/login">
          <Heart className="h-5 w-5" />
        </Link>
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200 relative"
      asChild
    >
      <Link href="/dashboard/wishlist">
        <Heart className="h-5 w-5" />
        {wishlistCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
            {wishlistCount}
          </Badge>
        )}
      </Link>
    </Button>
  )
}
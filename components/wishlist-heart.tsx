'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/use-auth-store'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface WishlistHeartProps {
  productId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  variant?: 'default' | 'ghost' | 'outline'
}

export function WishlistHeart({ 
  productId, 
  className, 
  size = 'md', 
  showText = false,
  variant = 'ghost'
}: WishlistHeartProps) {
  const { user, isAuthenticated } = useCurrentUser()
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingWishlist, setIsCheckingWishlist] = useState(true)

  // Check if product is in wishlist on mount
  useEffect(() => {
    async function checkWishlistStatus() {
      if (!isAuthenticated || !productId) {
        setIsCheckingWishlist(false)
        return
      }

      try {
        const response = await fetch(`/api/wishlist?action=check&productId=${productId}`)
        const data = await response.json()
        setIsInWishlist(data.isInWishlist || false)
      } catch (error) {
        console.error('Error checking wishlist status:', error)
      } finally {
        setIsCheckingWishlist(false)
      }
    }

    checkWishlistStatus()
  }, [isAuthenticated, productId])

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your wishlist', {
        description: 'Create an account to save your favorite products',
        action: {
          label: 'Sign In',
          onClick: () => {
            // Redirect to login page
            window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
          }
        }
      })
      return
    }

    if (isLoading) return

    setIsLoading(true)

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ productId }),
        })

        if (response.ok) {
          setIsInWishlist(false)
          toast.success('Removed from wishlist', {
            description: 'Product has been removed from your wishlist'
          })
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to remove from wishlist')
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            productId,
            notifyWhenAvailable: false 
          }),
        })

        if (response.ok) {
          setIsInWishlist(true)
          toast.success('Added to wishlist', {
            description: 'Product has been saved to your wishlist',
            action: {
              label: 'View Wishlist',
              onClick: () => {
                window.location.href = '/dashboard/wishlist'
              }
            }
          })
        } else {
          const error = await response.json()
          throw new Error(error.error || 'Failed to add to wishlist')
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error)
      toast.error('Something went wrong', {
        description: error instanceof Error ? error.message : 'Please try again later'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'lg':
        return 'h-6 w-6'
      default:
        return 'h-5 w-5'
    }
  }

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return 'sm'
      case 'lg':
        return 'default'
      default:
        return 'sm'
    }
  }

  // Show loading state while checking wishlist status
  if (isCheckingWishlist) {
    return (
      <Button
        variant={variant}
        size={getButtonSize()}
        disabled
        className={cn("relative", className)}
      >
        <Heart className={cn("animate-pulse", getSizeClasses())} />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={getButtonSize()}
      onClick={handleWishlistToggle}
      disabled={isLoading}
      className={cn(
        "relative group transition-all duration-200",
        isInWishlist 
          ? "text-red-500 hover:text-red-600" 
          : "text-gray-400 hover:text-red-500",
        isLoading && "opacity-50",
        className
      )}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart 
        className={cn(
          "transition-all duration-200",
          getSizeClasses(),
          isInWishlist 
            ? "fill-current text-red-500" 
            : "group-hover:scale-110",
          isLoading && "animate-pulse"
        )} 
      />
      {showText && (
        <span className="ml-2">
          {isLoading 
            ? (isInWishlist ? 'Removing...' : 'Adding...') 
            : (isInWishlist ? 'Saved' : 'Save')
          }
        </span>
      )}
      
      {/* Subtle animation on add */}
      {isInWishlist && !isLoading && (
        <div className="absolute inset-0 pointer-events-none">
          <Heart 
            className={cn(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "text-red-500 animate-ping",
              getSizeClasses()
            )}
            style={{ animationDuration: '0.6s', animationIterationCount: '1' }}
          />
        </div>
      )}
    </Button>
  )
}

export function WishlistHeartCompact({ productId, className }: { productId: string, className?: string }) {
  return (
    <WishlistHeart
      productId={productId}
      size="sm"
      variant="ghost"
      className={cn("absolute top-2 right-2 z-10", className)}
    />
  )
}

export function WishlistHeartWithText({ productId, className }: { productId: string, className?: string }) {
  return (
    <WishlistHeart
      productId={productId}
      size="md"
      variant="outline"
      showText
      className={className}
    />
  )
}
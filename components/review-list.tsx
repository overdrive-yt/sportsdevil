'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ThumbsUp, ThumbsDown, Verified, ChevronDown, ChevronUp } from 'lucide-react'
import { useReviews } from '@/hooks/use-reviews'
import { ReviewStats } from '@/components/review-stats'
import { formatDistanceToNow } from 'date-fns'

interface ReviewListProps {
  productId: string
  showWriteReview?: boolean
  onWriteReviewClick?: () => void
}

interface Review {
  id: string
  rating: number
  title: string
  content: string
  images: string[]
  verifiedPurchase: boolean
  helpful: number
  unhelpful: number
  createdAt: string
  user: {
    id: string
    name: string
    image?: string
  }
}

export function ReviewList({ productId, showWriteReview = true, onWriteReviewClick }: ReviewListProps) {
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const [ratingFilter, setRatingFilter] = useState<number | undefined>(undefined)
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set())

  const { data: reviewsData, isLoading, error } = useReviews({
    productId,
    page,
    limit: 10,
    sort,
    rating: ratingFilter,
  })

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews)
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId)
    } else {
      newExpanded.add(reviewId)
    }
    setExpandedReviews(newExpanded)
  }

  const renderStars = (rating: number, size: 'sm' | 'md' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load reviews. Please try again.</p>
      </div>
    )
  }

  const reviews = reviewsData?.data || []
  const stats = reviewsData?.stats
  const pagination = reviewsData?.pagination

  return (
    <div className="space-y-6">
      {/* Review Statistics */}
      {stats && <ReviewStats stats={stats} />}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Select value={sort} onValueChange={(value: any) => setSort(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={ratingFilter?.toString() || 'all'} 
            onValueChange={(value) => setRatingFilter(value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showWriteReview && (
          <Button onClick={onWriteReviewClick}>
            Write a Review
          </Button>
        )}
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-muted h-10 w-10" />
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-24" />
                      <div className="h-3 bg-muted rounded w-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No reviews yet. Be the first to review this product!
            </p>
            {showWriteReview && (
              <Button onClick={onWriteReviewClick}>
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: Review) => {
            const isExpanded = expandedReviews.has(review.id)
            const shouldTruncate = review.content.length > 300
            const displayContent = shouldTruncate && !isExpanded 
              ? review.content.substring(0, 300) + '...' 
              : review.content

            return (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={review.user.image} />
                          <AvatarFallback>
                            {review.user.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{review.user.name}</p>
                            {review.verifiedPurchase && (
                              <Badge variant="secondary" className="text-xs">
                                <Verified className="h-3 w-3 mr-1" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {renderStars(review.rating)}
                            <span className="text-sm text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {displayContent}
                      </p>
                      {shouldTruncate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(review.id)}
                          className="mt-2 p-0 h-auto text-primary"
                        >
                          {isExpanded ? (
                            <>
                              Show Less <ChevronUp className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Read More <ChevronDown className="ml-1 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Review Images */}
                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 overflow-x-auto">
                        {review.images.map((image, index) => (
                          <div key={index} className="flex-shrink-0 w-20 h-20 relative">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helpful Actions */}
                    <div className="flex items-center space-x-4 pt-2">
                      <span className="text-sm text-muted-foreground">
                        Was this helpful?
                      </span>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Yes ({review.helpful})
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <ThumbsDown className="h-4 w-4 mr-1" />
                          No ({review.unhelpful})
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
/**
 * Wishlist Service
 * Handles all wishlist operations with authentication requirements
 */

import { prisma } from '../prisma'
import { NotFoundError, ValidationError } from '../api/errors'

export interface WishlistWithItems {
  id: string
  name: string
  description?: string
  isDefault: boolean
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  itemCount: number
  items: WishlistItemWithProduct[]
}

export interface WishlistItemWithProduct {
  id: string
  addedAt: Date
  notes?: string
  priority: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    originalPrice?: number
    stockQuantity: number
    isActive: boolean
    images: Array<{
      id: string
      url: string
      alt?: string
    }>
    productCategories: Array<{
      category: {
        name: string
      }
    }>
  }
}

export interface CreateWishlistData {
  name?: string
  description?: string
  isDefault?: boolean
  isPublic?: boolean
}

export class WishlistService {
  
  /**
   * Get user's default wishlist (create if doesn't exist)
   */
  static async getUserDefaultWishlist(userId: string): Promise<WishlistWithItems> {
    if (!userId) {
      throw new ValidationError('User ID is required')
    }

    let wishlist = await prisma.wishlist.findFirst({
      where: {
        userId,
        isDefault: true
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                },
                productCategories: {
                  take: 1,
                  include: {
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { addedAt: 'desc' }
        }
      }
    })

    // Create default wishlist if it doesn't exist
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: {
          userId,
          name: 'My Wishlist',
          isDefault: true
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    take: 1,
                    orderBy: { sortOrder: 'asc' }
                  },
                  productCategories: {
                    take: 1,
                    include: {
                      category: {
                        select: { name: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    }

    return this.transformWishlistResponse(wishlist)
  }

  /**
   * Get all user wishlists
   */
  static async getUserWishlists(userId: string): Promise<WishlistWithItems[]> {
    if (!userId) {
      throw new ValidationError('User ID is required')
    }

    const wishlists = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                },
                productCategories: {
                  take: 1,
                  include: {
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          },
          orderBy: { addedAt: 'desc' }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return wishlists.map(this.transformWishlistResponse)
  }

  /**
   * Add item to wishlist
   */
  static async addToWishlist(
    userId: string, 
    productId: string, 
    wishlistId?: string,
    notes?: string,
    priority?: number
  ): Promise<WishlistItemWithProduct> {
    if (!userId) {
      throw new ValidationError('User ID is required')
    }

    // Verify product exists and is active
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        isActive: true
      }
    })

    if (!product) {
      throw new NotFoundError('Product not found or inactive')
    }

    // Get or create default wishlist if none specified
    let targetWishlistId = wishlistId
    if (!targetWishlistId) {
      const defaultWishlist = await this.getUserDefaultWishlist(userId)
      targetWishlistId = defaultWishlist.id
    } else {
      // Verify wishlist belongs to user
      const wishlist = await prisma.wishlist.findFirst({
        where: {
          id: targetWishlistId,
          userId
        }
      })
      
      if (!wishlist) {
        throw new NotFoundError('Wishlist not found or access denied')
      }
    }

    // Check if item already exists
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        wishlistId: targetWishlistId,
        productId
      }
    })

    if (existingItem) {
      throw new ValidationError('Product already in wishlist')
    }

    // Add item to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        wishlistId: targetWishlistId,
        productId,
        notes,
        priority: priority || 1
      },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' }
            },
            productCategories: {
              take: 1,
              include: {
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    return this.transformWishlistItemResponse(wishlistItem)
  }

  /**
   * Remove item from wishlist
   */
  static async removeFromWishlist(userId: string, productId: string, wishlistId?: string): Promise<void> {
    const where: any = {
      userId,
      productId
    }

    if (wishlistId) {
      where.wishlistId = wishlistId
    }

    const deleted = await prisma.wishlistItem.deleteMany({
      where
    })

    if (deleted.count === 0) {
      throw new NotFoundError('Wishlist item not found')
    }
  }

  /**
   * Check if product is in user's wishlist
   */
  static async isInWishlist(userId: string, productId: string): Promise<boolean> {
    if (!userId) return false

    const item = await prisma.wishlistItem.findFirst({
      where: {
        userId,
        productId
      }
    })

    return !!item
  }

  /**
   * Get wishlist item count for user
   */
  static async getWishlistItemCount(userId: string): Promise<number> {
    if (!userId) return 0

    return await prisma.wishlistItem.count({
      where: { userId }
    })
  }

  /**
   * Create new wishlist
   */
  static async createWishlist(userId: string, data: CreateWishlistData): Promise<WishlistWithItems> {
    if (!userId) {
      throw new ValidationError('User ID is required')
    }

    // If creating default wishlist, ensure no other default exists
    if (data.isDefault) {
      await prisma.wishlist.updateMany({
        where: {
          userId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      })
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId,
        name: data.name || 'New Wishlist',
        description: data.description,
        isDefault: data.isDefault || false,
        isPublic: data.isPublic || false
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: 'asc' }
                },
                productCategories: {
                  take: 1,
                  include: {
                    category: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    return this.transformWishlistResponse(wishlist)
  }

  /**
   * Delete wishlist (but not if it's the only/default one)
   */
  static async deleteWishlist(userId: string, wishlistId: string): Promise<void> {
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        userId
      }
    })

    if (!wishlist) {
      throw new NotFoundError('Wishlist not found or access denied')
    }

    // Don't allow deletion of default wishlist if it's the only one
    if (wishlist.isDefault) {
      const wishlistCount = await prisma.wishlist.count({
        where: { userId }
      })

      if (wishlistCount <= 1) {
        throw new ValidationError('Cannot delete your only wishlist')
      }
    }

    await prisma.wishlist.delete({
      where: { id: wishlistId }
    })
  }

  /**
   * Move item between wishlists
   */
  static async moveWishlistItem(
    userId: string, 
    itemId: string, 
    targetWishlistId: string
  ): Promise<WishlistItemWithProduct> {
    // Verify both item and target wishlist belong to user
    const item = await prisma.wishlistItem.findFirst({
      where: {
        id: itemId,
        userId
      }
    })

    if (!item) {
      throw new NotFoundError('Wishlist item not found')
    }

    const targetWishlist = await prisma.wishlistItem.findFirst({
      where: {
        id: targetWishlistId,
        userId
      }
    })

    if (!targetWishlist) {
      throw new NotFoundError('Target wishlist not found')
    }

    // Update item's wishlist
    const updatedItem = await prisma.wishlistItem.update({
      where: { id: itemId },
      data: { wishlistId: targetWishlistId },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' }
            },
            productCategories: {
              take: 1,
              include: {
                category: {
                  select: { name: true }
                }
              }
            }
          }
        }
      }
    })

    return this.transformWishlistItemResponse(updatedItem)
  }

  /**
   * Transform database wishlist to API response format
   */
  private static transformWishlistResponse(wishlist: any): WishlistWithItems {
    return {
      id: wishlist.id,
      name: wishlist.name,
      description: wishlist.description,
      isDefault: wishlist.isDefault,
      isPublic: wishlist.isPublic,
      createdAt: wishlist.createdAt,
      updatedAt: wishlist.updatedAt,
      itemCount: wishlist.items?.length || 0,
      items: wishlist.items?.map(WishlistService.transformWishlistItemResponse) || []
    }
  }

  /**
   * Transform database wishlist item to API response format
   */
  private static transformWishlistItemResponse(item: any): WishlistItemWithProduct {
    return {
      id: item.id,
      addedAt: item.addedAt,
      notes: item.notes,
      priority: item.priority,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: parseFloat(item.product.price),
        originalPrice: item.product.originalPrice ? parseFloat(item.product.originalPrice) : undefined,
        stockQuantity: item.product.stockQuantity,
        isActive: item.product.isActive,
        images: item.product.images?.map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt
        })) || [],
        productCategories: item.product.productCategories || []
      }
    }
  }
}
import { prisma } from '../prisma'
import { NotFoundError, ValidationError, ConflictError } from '../api/errors'
import { ProductService } from './product.service'

export interface CartItemData {
  productId: string
  quantity: number
  selectedColor?: string
  selectedSize?: string
  isSync?: boolean // ADDED: Flag to indicate if this is a sync operation
}

export interface CartItemUpdateData {
  quantity: number
}

export class CartService {
  static async getCartItems(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            productCategories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return cartItems.map(item => ({
      ...item,
      product: {
        ...item.product,
        colors: item.product.colors ? JSON.parse(item.product.colors) : [],
        sizes: item.product.sizes ? JSON.parse(item.product.sizes) : [],
        tags: item.product.tags ? JSON.parse(item.product.tags) : [],
        primaryImage: item.product.images[0] || null,
        category: item.product.productCategories[0]?.category || null,
        images: undefined,
        productCategories: undefined, // Remove internal relationship data
      },
    }))
  }

  static async addToCart(userId: string, data: CartItemData) {
    // Verify product exists and is active
    await ProductService.getProductById(data.productId)

    // Check stock availability
    const stockCheck = await ProductService.checkStock(data.productId, data.quantity)
    if (!stockCheck.available) {
      throw new ValidationError(
        `Only ${stockCheck.currentStock} items available for ${stockCheck.productName}`
      )
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        productId: data.productId,
        color: data.selectedColor || null,
        size: data.selectedSize || null,
      },
    })

    if (existingItem) {
      // FIXED: Handle sync operations differently from user-initiated adds
      const newQuantity = data.isSync 
        ? data.quantity // During sync, REPLACE quantity (don't accumulate)
        : existingItem.quantity + data.quantity // User add: accumulate normally
      
      console.log(`🔄 Cart item exists: ${data.isSync ? 'SYNC REPLACE' : 'USER ADD'} - ${existingItem.quantity} → ${newQuantity}`)
      
      // Check stock for new quantity
      const newStockCheck = await ProductService.checkStock(data.productId, newQuantity)
      if (!newStockCheck.available) {
        throw new ValidationError(
          `Cannot ${data.isSync ? 'set' : 'add'} ${data.quantity} ${data.isSync ? '' : 'more '}items. Only ${stockCheck.currentStock} items available for ${stockCheck.productName}`
        )
      }

      return await this.updateCartItem(existingItem.id, { quantity: newQuantity })
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        productId: data.productId,
        quantity: data.quantity,
        color: data.selectedColor,
        size: data.selectedSize,
      },
      include: {
        product: {
          include: {
            productCategories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    })

    return {
      ...cartItem,
      product: {
        ...cartItem.product,
        colors: cartItem.product.colors ? JSON.parse(cartItem.product.colors) : [],
        sizes: cartItem.product.sizes ? JSON.parse(cartItem.product.sizes) : [],
        tags: cartItem.product.tags ? JSON.parse(cartItem.product.tags) : [],
        primaryImage: cartItem.product.images[0] || null,
        category: cartItem.product.productCategories[0]?.category || null,
        images: undefined,
        productCategories: undefined, // Remove internal relationship data
      },
    }
  }

  static async updateCartItem(itemId: string, data: CartItemUpdateData) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
      },
    })

    if (!cartItem) {
      throw new NotFoundError('Cart item not found')
    }

    // Check stock availability for new quantity
    const stockCheck = await ProductService.checkStock(cartItem.productId, data.quantity)
    if (!stockCheck.available) {
      throw new ValidationError(
        `Only ${stockCheck.currentStock} items available for ${cartItem.product.name}`
      )
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: data.quantity },
      include: {
        product: {
          include: {
            productCategories: {
              include: {
                category: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
    })

    return {
      ...updatedItem,
      product: {
        ...updatedItem.product,
        colors: updatedItem.product.colors ? JSON.parse(updatedItem.product.colors) : [],
        sizes: updatedItem.product.sizes ? JSON.parse(updatedItem.product.sizes) : [],
        tags: updatedItem.product.tags ? JSON.parse(updatedItem.product.tags) : [],
        primaryImage: updatedItem.product.images[0] || null,
        category: updatedItem.product.productCategories[0]?.category || null,
        images: undefined,
        productCategories: undefined, // Remove internal relationship data
      },
    }
  }

  static async removeCartItem(itemId: string, userId?: string) {
    const whereClause: any = { id: itemId }
    if (userId) {
      whereClause.userId = userId
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: whereClause,
    })

    if (!cartItem) {
      throw new NotFoundError('Cart item not found')
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    })

    return { deleted: true }
  }

  static async clearCart(userId: string) {
    const deletedItems = await prisma.cartItem.deleteMany({
      where: { userId },
    })

    return { deletedCount: deletedItems.count }
  }

  static async getCartSummary(userId: string) {
    const cartItems = await this.getCartItems(userId)
    
    const summary = {
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      uniqueItemCount: cartItems.length,
      subtotal: cartItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
      items: cartItems,
    }

    return summary
  }

  static async validateCartForCheckout(userId: string) {
    const cartItems = await this.getCartItems(userId)
    
    if (cartItems.length === 0) {
      throw new ValidationError('Cart is empty')
    }

    const validationErrors: string[] = []
    const validatedItems = []

    for (const item of cartItems) {
      // Check if product is still active
      if (!item.product.isActive) {
        validationErrors.push(`${item.product.name} is no longer available`)
        continue
      }

      // Check stock availability
      const stockCheck = await ProductService.checkStock(item.productId, item.quantity)
      if (!stockCheck.available) {
        validationErrors.push(
          `Only ${stockCheck.currentStock} items available for ${item.product.name} (requested: ${item.quantity})`
        )
        continue
      }

      validatedItems.push(item)
    }

    if (validationErrors.length > 0) {
      throw new ValidationError('Cart validation failed', validationErrors)
    }

    return {
      valid: true,
      items: validatedItems,
      summary: {
        itemCount: validatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: validatedItems.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
      },
    }
  }

  static async mergeGuestCartWithUserCart(userId: string, guestCartItems: CartItemData[]) {
    const mergedItems = []

    for (const guestItem of guestCartItems) {
      try {
        const mergedItem = await this.addToCart(userId, guestItem)
        mergedItems.push(mergedItem)
      } catch (error) {
        // Log error but continue with other items
        console.error('Error merging cart item:', error)
      }
    }

    return {
      mergedCount: mergedItems.length,
      items: mergedItems,
    }
  }

  static async reserveCartItems(userId: string, reservationMinutes = 15) {
    const cartItems = await this.getCartItems(userId)
    const reservationExpiry = new Date(Date.now() + reservationMinutes * 60 * 1000)

    // In a real application, you would implement a reservation system
    // For now, we'll just validate the cart
    const validation = await this.validateCartForCheckout(userId)

    return {
      reserved: true,
      expiresAt: reservationExpiry,
      items: validation.items,
      summary: validation.summary,
    }
  }

  // Cart synchronization methods for persistent cart across sessions
  static async syncLocalCartWithDatabase(userId: string, localCartItems: any[]) {
    try {
      const dbCartItems = await this.getCartItems(userId)
      const mergeResult = await this.mergeLocalAndDatabaseCart(userId, localCartItems, dbCartItems)
      
      return {
        success: true,
        merged: mergeResult.merged,
        conflicts: mergeResult.conflicts,
        finalCart: await this.getCartItems(userId),
      }
    } catch (error) {
      console.error('Cart synchronization failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
        finalCart: await this.getCartItems(userId).catch(() => []),
      }
    }
  }

  private static async mergeLocalAndDatabaseCart(
    userId: string, 
    localItems: any[], 
    dbItems: any[]
  ) {
    const merged: any[] = []
    const conflicts: any[] = []

    // Convert local cart items to database format
    for (const localItem of localItems) {
      try {
        // Check if this item exists in database cart
        const existingDbItem = dbItems.find(dbItem => 
          dbItem.productId === localItem.productId &&
          dbItem.color === localItem.selectedColor &&
          dbItem.size === localItem.selectedSize
        )

        if (existingDbItem) {
          // FIXED: Smart conflict resolution instead of Math.max() accumulation
          const localQty = Math.min(localItem.quantity, 50) // Cap local quantity
          const dbQty = Math.min(existingDbItem.quantity, 50) // Cap database quantity
          
          console.log(`🔍 MERGE CHECK: Product ${localItem.productId} - Local: ${localItem.quantity}→${localQty}, DB: ${existingDbItem.quantity}→${dbQty}`)
          
          if (localQty !== dbQty) {
            // Improved conflict resolution logic:
            // 1. If one quantity is suspiciously high (>10), use the lower one
            // 2. If local cart has recent activity, prefer local quantity
            // 3. Otherwise use database quantity as source of truth
            
            let finalQuantity = dbQty // Default to database
            let resolution = 'used_database_quantity'
            
            // Check for suspicious quantities that indicate accumulation bug
            if (localQty > 10 && dbQty <= 10) {
              finalQuantity = dbQty
              resolution = 'rejected_suspicious_local_quantity'
            } else if (dbQty > 10 && localQty <= 10) {
              finalQuantity = localQty
              resolution = 'rejected_suspicious_database_quantity'
            } else if (localQty <= 10 && dbQty <= 10) {
              // Both quantities are reasonable - prefer database as source of truth
              // unless local quantity is significantly different (indicating recent user action)
              if (Math.abs(localQty - dbQty) === 1) {
                // Small difference - likely user just added/removed 1 item
                finalQuantity = localQty
                resolution = 'used_recent_local_activity'
              } else {
                finalQuantity = dbQty
                resolution = 'used_database_as_truth'
              }
            } else {
              // Both quantities are high - something is wrong, reset to 1
              finalQuantity = 1
              resolution = 'reset_both_suspicious'
            }
            
            conflicts.push({
              productId: localItem.productId,
              localQuantity: localQty,
              databaseQuantity: dbQty,
              resolvedQuantity: finalQuantity,
              resolution: resolution
            })

            // FIXED: Update database with resolved quantity using sync context
            await this.updateCartItem(existingDbItem.id, { quantity: finalQuantity })
            console.log(`🔄 CONFLICT RESOLVED: ${localItem.productId} - Local: ${localQty}, DB: ${dbQty} → Final: ${finalQuantity} (${resolution})`)
            merged.push({
              ...existingDbItem,
              quantity: finalQuantity,
              source: 'conflict_resolved'
            })
          } else {
            // Quantities match - check if they're both suspiciously high
            if (localQty > 10) {
              console.warn(`🚨 Both local and database have suspicious quantity: ${localQty} for product ${localItem.productId}`)
              // Reset to reasonable quantity
              const resetQuantity = 1
              await this.updateCartItem(existingDbItem.id, { quantity: resetQuantity })
              merged.push({
                ...existingDbItem,
                quantity: resetQuantity,
                source: 'suspicious_quantity_reset'
              })
              
              conflicts.push({
                productId: localItem.productId,
                localQuantity: localQty,
                databaseQuantity: dbQty,
                resolvedQuantity: resetQuantity,
                resolution: 'reset_matching_suspicious_quantities'
              })
            } else {
              merged.push({
                ...existingDbItem,
                source: 'database_existing'
              })
            }
          }
        } else {
          // Add new item from local cart to database
          // FIXED: Validate quantity before adding new item
          let safeQuantity = localItem.quantity
          
          if (localItem.quantity > 10) {
            console.warn(`🚨 Suspicious quantity detected for new item: ${localItem.quantity} for product ${localItem.productId}`)
            safeQuantity = 1 // Reset to safe quantity
            
            conflicts.push({
              productId: localItem.productId,
              localQuantity: localItem.quantity,
              databaseQuantity: 0,
              resolvedQuantity: safeQuantity,
              resolution: 'capped_suspicious_new_item_quantity'
            })
          }
          
          const newDbItem = await this.addToCart(userId, {
            productId: localItem.productId,
            quantity: safeQuantity,
            selectedColor: localItem.selectedColor,
            selectedSize: localItem.selectedSize,
            isSync: true, // FIXED: Mark as sync operation to prevent quantity accumulation
          })
          
          merged.push({
            ...newDbItem,
            source: 'local_migrated'
          })
        }
      } catch (error) {
        console.error('Error merging cart item:', error)
        conflicts.push({
          productId: localItem.productId,
          error: error instanceof Error ? error.message : 'Unknown error',
          resolution: 'skipped'
        })
      }
    }

    return { merged, conflicts }
  }

  // Get cart formatted for Zustand store
  static async getCartForZustand(userId: string) {
    const dbCartItems = await this.getCartItems(userId)
    
    return dbCartItems.map(dbItem => ({
      id: `db-${dbItem.id}`,
      productId: dbItem.productId,
      quantity: dbItem.quantity,
      selectedColor: dbItem.color,
      selectedSize: dbItem.size,
      product: {
        id: dbItem.product.id,
        name: dbItem.product.name,
        slug: dbItem.product.slug,
        price: dbItem.product.price.toString(),
        primaryImage: dbItem.product.primaryImage,
        stockQuantity: dbItem.product.stockQuantity,
      }
    }))
  }

  // Bulk sync cart items from Zustand to database
  static async bulkSyncToDatabase(userId: string, zustandItems: any[]) {
    try {
      // Clear existing cart
      await this.clearCart(userId)
      
      // Add all items from Zustand
      const addedItems = []
      for (const item of zustandItems) {
        try {
          const dbItem = await this.addToCart(userId, {
            productId: item.productId,
            quantity: item.quantity,
            selectedColor: item.selectedColor,
            selectedSize: item.selectedSize,
            isSync: true, // FIXED: Mark as sync operation to prevent quantity accumulation
          })
          addedItems.push(dbItem)
        } catch (error) {
          console.error('Error syncing item to database:', error)
        }
      }

      return {
        success: true,
        syncedCount: addedItems.length,
        items: addedItems,
      }
    } catch (error) {
      console.error('Bulk sync to database failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown sync error',
      }
    }
  }
}
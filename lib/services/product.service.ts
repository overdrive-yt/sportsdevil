import { prisma } from '../prisma'
import { NotFoundError, ConflictError, ValidationError } from '../api/errors'
import { buildProductFilters, buildSortOptions } from '../utils/search'
import { validatePagination } from '../utils/pagination'

export interface ProductFilters {
  search?: string
  categoryId?: string
  categoryIds?: string[] // Support multiple categories
  ageCategory?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  inStock?: boolean
  featured?: boolean
  new?: boolean
}

export interface ProductCreateData {
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  originalPrice?: number
  sku: string
  stockQuantity: number
  categoryIds: string[] // Multiple categories now
  attributes?: { [key: string]: string } // Product attributes
  isActive?: boolean
  isFeatured?: boolean
  isNew?: boolean
  colors?: string[]
  sizes?: string[]
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export interface ProductUpdateData extends Partial<ProductCreateData> {}

export class ProductService {
  static async getProducts(
    filters: ProductFilters = {},
    pagination = { page: 1, limit: 10 },
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    const { page, limit, skip } = validatePagination(pagination.page, pagination.limit)
    const where = buildProductFilters(filters)
    const orderBy = buildSortOptions(sortBy, sortOrder)

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
            ],
          },
          productAttributes: {
            include: {
              attribute: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  type: true,
                },
              },
            },
            orderBy: {
              attribute: {
                sortOrder: 'asc',
              },
            },
          },
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where }),
    ])

    // Parse JSON fields and process multi-category data for response
    const processedProducts = products.map(product => ({
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      categories: product.productCategories.map(pc => ({
        ...pc.category,
        isPrimary: pc.isPrimary,
        sortOrder: pc.sortOrder,
      })),
      primaryCategory: product.productCategories.find(pc => pc.isPrimary)?.category || product.productCategories[0]?.category || null,
      attributes: product.productAttributes.reduce((acc, pa) => {
        acc[pa.attribute.slug] = {
          name: pa.attribute.name,
          value: pa.value,
          type: pa.attribute.type,
        }
        return acc
      }, {} as Record<string, any>),
      primaryImage: product.images[0] || null,
      images: undefined, // Remove images array from response
      productCategories: undefined, // Remove raw relation data
      productAttributes: undefined, // Remove raw relation data
    }))

    return {
      products: processedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    }
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
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
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        productAttributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                options: true,
              },
            },
          },
          orderBy: {
            attribute: {
              sortOrder: 'asc',
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    return {
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      categories: product.productCategories.map(pc => ({
        ...pc.category,
        isPrimary: pc.isPrimary,
        sortOrder: pc.sortOrder,
      })),
      primaryCategory: product.productCategories.find(pc => pc.isPrimary)?.category || product.productCategories[0]?.category || null,
      attributes: product.productAttributes.reduce((acc, pa) => {
        acc[pa.attribute.slug] = {
          name: pa.attribute.name,
          value: pa.value,
          type: pa.attribute.type,
          options: pa.attribute.options ? JSON.parse(pa.attribute.options) : null,
        }
        return acc
      }, {} as Record<string, any>),
      productCategories: undefined,
      productAttributes: undefined,
    }
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
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
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        productAttributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
                options: true,
              },
            },
          },
          orderBy: {
            attribute: {
              sortOrder: 'asc',
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    return {
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      categories: product.productCategories.map(pc => ({
        ...pc.category,
        isPrimary: pc.isPrimary,
        sortOrder: pc.sortOrder,
      })),
      primaryCategory: product.productCategories.find(pc => pc.isPrimary)?.category || product.productCategories[0]?.category || null,
      attributes: product.productAttributes.reduce((acc, pa) => {
        acc[pa.attribute.slug] = {
          name: pa.attribute.name,
          value: pa.value,
          type: pa.attribute.type,
          options: pa.attribute.options ? JSON.parse(pa.attribute.options) : null,
        }
        return acc
      }, {} as Record<string, any>),
      productCategories: undefined,
      productAttributes: undefined,
    }
  }


  static async getNewProducts(limit = 8) {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isNew: true,
        stockQuantity: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
          ],
        },
        productAttributes: {
          include: {
            attribute: {
              select: {
                id: true,
                name: true,
                slug: true,
                type: true,
              },
            },
          },
          orderBy: {
            attribute: {
              sortOrder: 'asc',
            },
          },
        },
        images: {
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
    })

    return products.map(product => ({
      ...product,
      colors: product.colors ? JSON.parse(product.colors) : [],
      sizes: product.sizes ? JSON.parse(product.sizes) : [],
      tags: product.tags ? JSON.parse(product.tags) : [],
      categories: product.productCategories.map(pc => ({
        ...pc.category,
        isPrimary: pc.isPrimary,
        sortOrder: pc.sortOrder,
      })),
      primaryCategory: product.productCategories.find(pc => pc.isPrimary)?.category || product.productCategories[0]?.category || null,
      attributes: product.productAttributes.reduce((acc, pa) => {
        acc[pa.attribute.slug] = {
          name: pa.attribute.name,
          value: pa.value,
          type: pa.attribute.type,
        }
        return acc
      }, {} as Record<string, any>),
      primaryImage: product.images[0] || null,
      images: undefined,
      productCategories: undefined,
      productAttributes: undefined,
    }))
  }

  static async createProduct(data: ProductCreateData) {
    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: data.slug },
    })

    if (existingProduct) {
      throw new ConflictError('A product with this slug already exists')
    }

    // Check if SKU already exists
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    })

    if (existingSku) {
      throw new ConflictError('A product with this SKU already exists')
    }

    // Verify all categories exist
    const categories = await prisma.category.findMany({
      where: { id: { in: data.categoryIds } },
    })

    if (categories.length !== data.categoryIds.length) {
      throw new ValidationError('One or more invalid category IDs')
    }

    // Get attributes for validation
    const attributeSlugs = Object.keys(data.attributes || {})
    const attributes = await prisma.attribute.findMany({
      where: { slug: { in: attributeSlugs } },
    })

    if (attributes.length !== attributeSlugs.length) {
      throw new ValidationError('One or more invalid attribute slugs')
    }

    // Create product with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the product
      const product = await tx.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          price: data.price,
          originalPrice: data.originalPrice,
          sku: data.sku,
          stockQuantity: data.stockQuantity,
          isActive: data.isActive ?? true,
          isFeatured: data.isFeatured ?? false,
          isNew: data.isNew ?? false,
          colors: data.colors ? JSON.stringify(data.colors) : null,
          sizes: data.sizes ? JSON.stringify(data.sizes) : null,
          tags: data.tags ? JSON.stringify(data.tags) : null,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
        },
      })

      // Create category relationships
      const productCategories = data.categoryIds.map((categoryId, index) => ({
        productId: product.id,
        categoryId,
        isPrimary: index === 0, // First category is primary
        sortOrder: index,
      }))

      await tx.productCategory.createMany({
        data: productCategories,
      })

      // Create attribute relationships
      const productAttributes = attributes.map((attr) => ({
        productId: product.id,
        attributeId: attr.id,
        value: data.attributes?.[attr.slug] || '',
      }))

      if (productAttributes.length > 0) {
        await tx.productAttribute.createMany({
          data: productAttributes,
        })
      }

      return product
    })

    // Return the created product with full data
    return await this.getProductById(result.id)
  }

  static async updateProduct(id: string, data: ProductUpdateData) {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    })

    if (!existingProduct) {
      throw new NotFoundError('Product not found')
    }

    // Check slug uniqueness if it's being updated
    if (data.slug && data.slug !== existingProduct.slug) {
      const conflictProduct = await prisma.product.findUnique({
        where: { slug: data.slug },
      })

      if (conflictProduct) {
        throw new ConflictError('A product with this slug already exists')
      }
    }

    // Check SKU uniqueness if it's being updated
    if (data.sku && data.sku !== existingProduct.sku) {
      const conflictSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      })

      if (conflictSku) {
        throw new ConflictError('A product with this SKU already exists')
      }
    }

    // Verify categories exist if they're being updated
    if (data.categoryIds) {
      const categories = await prisma.category.findMany({
        where: { id: { in: data.categoryIds } },
      })

      if (categories.length !== data.categoryIds.length) {
        throw new ValidationError('One or more invalid category IDs')
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        colors: data.colors ? JSON.stringify(data.colors) : undefined,
        sizes: data.sizes ? JSON.stringify(data.sizes) : undefined,
        tags: data.tags ? JSON.stringify(data.tags) : undefined,
      },
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
      },
    })

    return {
      ...updatedProduct,
      colors: updatedProduct.colors ? JSON.parse(updatedProduct.colors) : [],
      sizes: updatedProduct.sizes ? JSON.parse(updatedProduct.sizes) : [],
      tags: updatedProduct.tags ? JSON.parse(updatedProduct.tags) : [],
    }
  }

  static async deleteProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    // Check if product is referenced in any cart items or orders
    const [cartItems, orderItems] = await Promise.all([
      prisma.cartItem.count({ where: { productId: id } }),
      prisma.orderItem.count({ where: { productId: id } }),
    ])

    if (cartItems > 0 || orderItems > 0) {
      // Soft delete by deactivating instead of hard delete
      return await this.updateProduct(id, { isActive: false })
    }

    // Hard delete if no references
    await prisma.product.delete({
      where: { id },
    })

    return { deleted: true }
  }

  static async updateStock(id: string, quantity: number) {
    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stockQuantity: Math.max(0, quantity) },
    })

    return updatedProduct
  }

  static async checkStock(id: string, requiredQuantity: number) {
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      select: { stockQuantity: true, name: true },
    })

    if (!product) {
      throw new NotFoundError('Product not found')
    }

    return {
      available: product.stockQuantity >= requiredQuantity,
      currentStock: product.stockQuantity,
      productName: product.name,
    }
  }
}
import { prisma } from '../prisma'
import { NotFoundError, ConflictError } from '../api/errors'

export interface CategoryCreateData {
  name: string
  slug: string
  description?: string
  parentId?: string
  isActive?: boolean
  sortOrder?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> {}

export class CategoryService {
  static async getCategories(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true }

    // Get categories with product counts and stock quantities
    const categories = await prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
            _count: {
              select: {
                productCategories: {
                  where: {
                    product: {
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            productCategories: {
              where: {
                product: {
                  isActive: true,
                },
              },
            },
          },
        },
        productCategories: {
          where: {
            product: {
              isActive: true,
            },
          },
          select: {
            product: {
              select: {
                stockQuantity: true,
              },
            },
          },
        },
      },
    })

    // Process categories to add stock information
    const processedCategories = categories.map(category => {
      const totalStock = category.productCategories.reduce((sum, pc) => sum + (pc.product.stockQuantity || 0), 0)
      const inStockCount = category.productCategories.filter(pc => (pc.product.stockQuantity || 0) > 0).length
      
      return {
        ...category,
        stockInfo: {
          totalProducts: category._count.productCategories,
          inStockProducts: inStockCount,
          totalStockQuantity: totalStock,
        },
        productCategories: undefined, // Remove raw data
      }
    })

    return processedCategories
  }

  static async getCategoryBySlug(slug: string, includProducts = false) {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
            _count: {
              select: {
                productCategories: {
                  where: {
                    product: {
                      isActive: true,
                    },
                  },
                },
              },
            },
          },
        },
        productCategories: includProducts ? {
          where: { 
            product: { isActive: true } 
          },
          orderBy: { 
            product: { createdAt: 'desc' } 
          },
          take: 20,
          include: {
            product: {
              include: {
                images: {
                  orderBy: { sortOrder: 'asc' },
                  take: 1,
                },
              },
            },
          },
        } : false,
        _count: {
          select: {
            productCategories: {
              where: {
                product: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return {
      ...category,
      products: (Array.isArray(category.productCategories) ? category.productCategories : []).map((pc: any) => ({
        ...pc.product,
        colors: pc.product.colors ? JSON.parse(pc.product.colors) : [],
        sizes: pc.product.sizes ? JSON.parse(pc.product.sizes) : [],
        tags: pc.product.tags ? JSON.parse(pc.product.tags) : [],
        primaryImage: pc.product.images?.[0] || null,
        images: undefined,
      })),
      productCategories: undefined, // Remove the raw relationship data
    }
  }

  static async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            sortOrder: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    return category
  }

  static async createCategory(data: CategoryCreateData) {
    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug },
    })

    if (existingCategory) {
      throw new ConflictError('A category with this slug already exists')
    }

    // Verify parent category exists if provided
    if (data.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      })

      if (!parent) {
        throw new NotFoundError('Parent category not found')
      }
    }

    const category = await prisma.category.create({
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return category
  }

  static async updateCategory(id: string, data: CategoryUpdateData) {
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw new NotFoundError('Category not found')
    }

    // Check slug uniqueness if it's being updated
    if (data.slug && data.slug !== existingCategory.slug) {
      const conflictCategory = await prisma.category.findUnique({
        where: { slug: data.slug },
      })

      if (conflictCategory) {
        throw new ConflictError('A category with this slug already exists')
      }
    }

    // Verify parent category exists if it's being updated
    if (data.parentId && data.parentId !== existingCategory.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: data.parentId },
      })

      if (!parent) {
        throw new NotFoundError('Parent category not found')
      }

      // Prevent circular references
      if (data.parentId === id) {
        throw new ConflictError('A category cannot be its own parent')
      }

      // Check if the new parent is a descendant of this category
      const descendants = await this.getCategoryDescendants(id)
      if (descendants.some(desc => desc.id === data.parentId)) {
        throw new ConflictError('Cannot set a descendant category as parent')
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return updatedCategory
  }

  static async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        _count: {
          select: {
            productCategories: true,
          },
        },
      },
    })

    if (!category) {
      throw new NotFoundError('Category not found')
    }

    // Check if category has children or products
    if (category.children.length > 0) {
      throw new ConflictError('Cannot delete category that has subcategories')
    }

    if (category._count.productCategories > 0) {
      // Soft delete by deactivating
      return await this.updateCategory(id, { isActive: false })
    }

    // Hard delete if no references
    await prisma.category.delete({
      where: { id },
    })

    return { deleted: true }
  }

  static async getCategoryHierarchy() {
    const rootCategories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            children: {
              where: { isActive: true },
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                sortOrder: true,
                _count: {
                  select: {
                    productCategories: {
                      where: { 
                        product: { isActive: true } 
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                productCategories: {
                  where: { 
                    product: { isActive: true } 
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            productCategories: {
              where: { 
                product: { isActive: true } 
              },
            },
          },
        },
      },
    })

    return rootCategories
  }

  private static async getCategoryDescendants(categoryId: string): Promise<{ id: string }[]> {
    const children = await prisma.category.findMany({
      where: { parentId: categoryId },
      select: { id: true },
    })

    let descendants = [...children]

    for (const child of children) {
      const childDescendants = await this.getCategoryDescendants(child.id)
      descendants = [...descendants, ...childDescendants]
    }

    return descendants
  }

  static async getCategoryBreadcrumbs(categoryId: string) {
    const breadcrumbs = []
    let currentId = categoryId

    while (currentId) {
      const category = await prisma.category.findUnique({
        where: { id: currentId },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
        },
      })

      if (!category || !category.parentId) break

      breadcrumbs.unshift(category)
      currentId = category.parentId
    }

    return breadcrumbs
  }

  /**
   * Get featured cricket categories with random product images for Shop by Category section
   * Returns the specific categories in the requested order with featured images
   */
  static async getCategoriesWithFeaturedImages() {
    // Define the cricket categories in the requested order
    const cricketCategories = [
      { name: 'Cricket Bats', slug: 'bats', displayName: 'Cricket Bats' },
      { name: 'Batting Gloves', slug: 'gloves', displayName: 'Batting Gloves' },  
      { name: 'Batting Pads', slug: 'pads', displayName: 'Batting Pads' },
      { name: 'Thigh Pads', slug: 'protection', displayName: 'Thigh Pads' },
      { name: 'Helmets', slug: 'helmets', displayName: 'Helmets' },
      { name: 'Kit Bags', slug: 'kit-bags', displayName: 'Kit Bags' },
      { name: 'Wicket Keeping', slug: 'wicket-keeping', displayName: 'Wicket Keeping' },
      { name: 'Junior Stock', slug: 'junior', displayName: 'Junior Stock' },
    ]

    const results = []

    for (const category of cricketCategories) {
      try {
        // Find category by slug (case-insensitive search for SQLite)
        const dbCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: { contains: category.slug } },
              { name: { contains: category.name } },
            ],
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            productCategories: {
              where: {
                product: {
                  isActive: true,
                  images: {
                    some: {
                      isPrimary: true,
                    },
                  },
                },
              },
              take: 10, // Get multiple products to choose from
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    images: {
                      where: { isPrimary: true },
                      take: 1,
                      select: {
                        url: true,
                        alt: true,
                      },
                    },
                  },
                },
              },
            },
            _count: {
              select: {
                productCategories: {
                  where: {
                    product: { isActive: true },
                  },
                },
              },
            },
          },
        })

        if (dbCategory && dbCategory.productCategories.length > 0) {
          // Select a random product from the available products
          const randomIndex = Math.floor(Math.random() * dbCategory.productCategories.length)
          const randomProduct = dbCategory.productCategories[randomIndex]

          results.push({
            id: dbCategory.id,
            name: category.displayName,
            slug: dbCategory.slug,
            description: dbCategory.description,
            productCount: dbCategory._count.productCategories,
            featuredImage: randomProduct.product.images[0] || null,
            featuredProduct: {
              id: randomProduct.product.id,
              name: randomProduct.product.name,
              slug: randomProduct.product.slug,
            },
            // Generate proper filter URL for the products page
            filterUrl: `/products?categories=${dbCategory.id}`,
          })
        } else {
          // Fallback for categories without products
          results.push({
            id: `fallback-${category.slug}`,
            name: category.displayName,
            slug: category.slug,
            description: `Browse our ${category.displayName.toLowerCase()} collection`,
            productCount: 0,
            featuredImage: {
              url: "/placeholder.svg?height=300&width=400",
              alt: category.displayName,
            },
            featuredProduct: null,
            filterUrl: `/products?search=${encodeURIComponent(category.displayName)}`,
          })
        }
      } catch (error) {
        console.error(`Error fetching category ${category.name}:`, error)
        // Fallback entry on error
        results.push({
          id: `error-${category.slug}`,
          name: category.displayName,
          slug: category.slug,
          description: `Browse our ${category.displayName.toLowerCase()} collection`,
          productCount: 0,
          featuredImage: {
            url: "/placeholder.svg?height=300&width=400",
            alt: category.displayName,
          },
          featuredProduct: null,
          filterUrl: `/products?search=${encodeURIComponent(category.displayName)}`,
        })
      }
    }

    return results
  }
}
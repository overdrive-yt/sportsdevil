import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ultra-optimized Prisma configuration for maximum performance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Enhanced database connection configuration
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  
  // Performance optimizations
  log: process.env.NODE_ENV === 'development' ? [] : [], // Zero logging for maximum speed
  
  // Optimized transaction settings
  transactionOptions: {
    maxWait: 2000, // 2 seconds max wait
    timeout: 5000,  // 5 seconds timeout
  }
})

// Enhanced connection management
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // Connection optimization for development (fixed for Prisma 5.0+)
  process.on('beforeExit', async () => {
    console.log('🔌 Prisma client disconnecting...')
    await prisma.$disconnect()
  })
}

// Remove performance monitoring in development for speed
// Performance monitoring adds overhead during development
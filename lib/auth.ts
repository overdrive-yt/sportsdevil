import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AppleProvider from 'next-auth/providers/apple'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

// Ultra-fast performance cache for session data (extended duration + optimized cleanup)
const sessionCache = new Map<string, { data: any; timestamp: number }>()
const userCache = new Map<string, { data: any; timestamp: number }>() // Separate user data cache
const SESSION_CACHE_DURATION = 15 * 60 * 1000 // 15 minutes (longer for better performance)
const USER_CACHE_DURATION = 10 * 60 * 1000 // 10 minutes for user data

// Periodic cache cleanup (runs every 5 minutes)
setInterval(() => {
  const now = Date.now()
  
  // Clean expired session cache entries
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp > SESSION_CACHE_DURATION) {
      sessionCache.delete(key)
    }
  }
  
  // Clean expired user cache entries
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > USER_CACHE_DURATION) {
      userCache.delete(key)
    }
  }
}, 5 * 60 * 1000)

// Enhanced NextAuth configuration with social providers
// Hybrid approach: NextAuth for authentication + sessions, UI state in Zustand
export const authOptions: NextAuthOptions = {
  providers: [
    // Conditionally add social providers based on feature flags
    ...(process.env.ENABLE_GOOGLE_LOGIN === 'true' ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      })
    ] : []),
    ...(process.env.ENABLE_FACEBOOK_LOGIN === 'true' ? [
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID || '',
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      })
    ] : []),
    ...(process.env.ENABLE_APPLE_LOGIN === 'true' ? [
      AppleProvider({
        clientId: process.env.APPLE_ID || '',
        clientSecret: process.env.APPLE_SECRET || '',
      })
    ] : []),
    // Custom credentials provider for existing users (always enabled)
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const authStart = Date.now()
        
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          // Check user cache first for ultra-fast repeat authentication
          const cacheKey = `auth_${credentials.email}`
          const cached = userCache.get(cacheKey)
          
          if (cached && Date.now() - cached.timestamp < USER_CACHE_DURATION) {
            // Verify password against cached data
            const cachedUser = cached.data
            if (cachedUser.password) {
              const isPasswordValid = await bcrypt.compare(
                credentials.password,
                cachedUser.password
              )
              
              if (isPasswordValid) {
                const authTime = Date.now() - authStart
                return {
                  ...cachedUser,
                  authTime: `${authTime}ms (cached)`
                }
              }
            }
          }
          
          // Cache miss - perform database lookup with parallel execution
          const [admin, user] = await Promise.all([
            prisma.admin.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                isActive: true,
                level: true,
                department: true,
                permissions: true,
                image: true
              }
            }),
            prisma.user.findUnique({
              where: { email: credentials.email },
              select: {
                id: true,
                email: true,
                name: true,
                password: true,
                image: true,
                loyaltyPoints: true,
                totalSpent: true
              }
            })
          ])
          
          // Process admin first (faster path for admin users)
          if (admin && admin.password && admin.isActive) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              admin.password
            )
            
            if (isPasswordValid) {
              // Non-blocking login tracking update
              setImmediate(() => {
                prisma.admin.update({
                  where: { id: admin.id },
                  data: {
                    lastLoginAt: new Date(),
                    loginCount: { increment: 1 }
                  }
                }).catch(() => {}) // Silent fail for non-critical tracking
              })
              
              const authTime = Date.now() - authStart
              const userData = {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.level,
                image: admin.image,
                userType: 'ADMIN',
                adminLevel: admin.level,
                department: admin.department,
                permissions: admin.permissions ? JSON.parse(admin.permissions) : [],
                password: admin.password, // Cache password hash for future auth
                authTime: `${authTime}ms`
              }
              
              // Cache user data for ultra-fast future authentication
              userCache.set(cacheKey, {
                data: userData,
                timestamp: Date.now()
              })
              
              return userData
            }
          }
          
          // Process regular user
          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(
              credentials.password,
              user.password
            )
            
            if (isPasswordValid) {
              const authTime = Date.now() - authStart
              const userData = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: 'CUSTOMER',
                image: user.image,
                userType: 'CUSTOMER',
                loyaltyPoints: user.loyaltyPoints,
                totalSpent: user.totalSpent?.toString(),
                password: user.password, // Cache password hash for future auth
                authTime: `${authTime}ms`
              }
              
              // Cache user data for ultra-fast future authentication
              userCache.set(cacheKey, {
                data: userData,
                timestamp: Date.now()
              })
              
              return userData
            }
          }
          
          return null
        } catch (error) {
          return null
        }
      }
    })
  ],
  // Optimized session configuration
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 minutes
    updateAge: 5 * 60, // 5 minutes - faster updates for better UX
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  // Ultra-optimized callbacks with caching
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Cache token data for faster subsequent requests
        const cacheKey = `jwt_${user.id}`
        const cachedData = {
          id: user.id,
          role: (user as any).role,
          userType: (user as any).userType,
          adminLevel: (user as any).adminLevel,
          department: (user as any).department,
          permissions: (user as any).permissions,
          loyaltyPoints: (user as any).loyaltyPoints,
          totalSpent: (user as any).totalSpent,
          authTime: (user as any).authTime
        }
        
        sessionCache.set(cacheKey, {
          data: cachedData,
          timestamp: Date.now()
        })
        
        // Apply data to token
        Object.assign(token, cachedData)
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        const sessionStart = Date.now()
        
        // Ultra-fast session cache lookup (prioritize speed over freshness)
        const cacheKey = `session_${token.id}`
        const cached = sessionCache.get(cacheKey)
        
        if (cached && Date.now() - cached.timestamp < SESSION_CACHE_DURATION) {
          // Cache hit - ultra-fast response
          const cachedData = { ...cached.data }
          cachedData.sessionTime = `${Date.now() - sessionStart}ms (cached)`
          Object.assign(session.user, cachedData)
          return session
        }
        
        // Cache miss - build session data quickly
        const sessionData = {
          id: token.id as string,
          role: token.role as string,
          userType: token.userType as string,
          adminLevel: token.adminLevel as string,
          department: token.department as string,
          permissions: token.permissions as string[],
          loyaltyPoints: token.loyaltyPoints as number,
          totalSpent: token.totalSpent as string,
          sessionTime: `${Date.now() - sessionStart}ms`
        }
        
        Object.assign(session.user, sessionData)
        
        // Cache aggressively for maximum speed
        sessionCache.set(cacheKey, {
          data: sessionData,
          timestamp: Date.now()
        })
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false, // Always disabled for performance
  
  // Performance optimizations
  events: {
    async signIn(message) {
      // Clean up old cache entries on sign in
      const now = Date.now()
      for (const [key, value] of sessionCache.entries()) {
        if (now - value.timestamp > SESSION_CACHE_DURATION) {
          sessionCache.delete(key)
        }
      }
    },
  },
}
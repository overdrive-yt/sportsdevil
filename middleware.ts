import { withAuth } from 'next-auth/middleware'

export default withAuth(
  async function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // FORCE HTTP IN DEVELOPMENT - NO HTTPS ALLOWED
    if (process.env.NODE_ENV === 'development' && req.nextUrl.protocol === 'https:') {
      const httpUrl = new URL(req.nextUrl)
      httpUrl.protocol = 'http:'
      httpUrl.port = process.env.PORT || '3001'
      return Response.redirect(httpUrl.toString(), 301)
    }
    
    // FORCE HTTPS IN PRODUCTION - SECURITY
    if (process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'http:') {
      const httpsUrl = new URL(req.nextUrl)
      httpsUrl.protocol = 'https:'
      httpsUrl.port = '' // Remove port for production HTTPS
      return Response.redirect(httpsUrl.toString(), 301)
    }
    
    // Only handle API route protection - NO page redirects
    if (pathname.startsWith('/api/')) {
      // Admin API routes require admin role
      if (pathname.startsWith('/api/admin')) {
        if (!token || (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN')) {
          return new Response(
            JSON.stringify({ 
              error: 'Unauthorized', 
              message: 'Admin access required' 
            }),
            { 
              status: 403,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Protected user API routes require authentication
      if (pathname.startsWith('/api/user') || 
          pathname.startsWith('/api/orders')) {
        if (!token) {
          return new Response(
            JSON.stringify({ 
              error: 'Unauthorized', 
              message: 'Authentication required' 
            }),
            { 
              status: 401,
              headers: { 'Content-Type': 'application/json' }
            }
          )
        }
      }

      // Payment routes - only some require authentication
      if (pathname.startsWith('/api/payments')) {
        // Payment intent creation is public (users can start checkout before full auth)
        if (pathname === '/api/payments/create-intent') {
          // Allow public access to create payment intents
        } else {
          // Other payment operations require authentication
          if (!token) {
            return new Response(
              JSON.stringify({ 
                error: 'Unauthorized', 
                message: 'Authentication required for this payment operation' 
              }),
              { 
                status: 401,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }
        }
      }
    }

    // Allow all page requests - components will handle authentication UI
    return null // NextAuth middleware will handle the rest
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Always allow access to static files and auth routes
        if (pathname.startsWith('/_next') || 
            pathname.startsWith('/api/auth') ||
            pathname.includes('.') ||
            pathname === '/') {
          return true
        }
        
        // For API routes, check authentication requirements
        if (pathname.startsWith('/api/admin')) {
          return token?.role === 'ADMIN' || token?.role === 'SUPER_ADMIN'
        }
        
        if (pathname.startsWith('/api/user') ||
            pathname.startsWith('/api/orders')) {
          return !!token
        }
        
        // Cart and Payment APIs handle authentication internally
        if (pathname.startsWith('/api/cart') ||
            pathname.startsWith('/api/payments')) {
          return true // Allow through - these APIs handle auth internally
        }
        
        // Allow all other requests (pages, public APIs, etc.)
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)' 
  ]
}


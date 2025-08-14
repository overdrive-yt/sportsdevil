'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface SessionProviderProps {
  children: ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider 
      refetchOnWindowFocus={false} // Reduce API calls that might cause errors
      refetchInterval={0} // Disable automatic refetching to prevent errors  
      refetchWhenOffline={false}
      basePath="/api/auth"
    >
      {children}
    </NextAuthSessionProvider>
  )
}
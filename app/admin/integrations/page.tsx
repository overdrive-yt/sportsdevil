'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '../../../components/header'
import { Footer } from '../../../components/footer'
import { useCurrentUser } from '../../../hooks/use-auth-store'
import IntegrationsDashboard from '../../../components/admin/integrations-dashboard'
import { Loader2 } from 'lucide-react'

// V9.11.5: Revolutionary External Integrations Dashboard Page
export default function IntegrationsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useCurrentUser()
  const router = useRouter()

  // Check authentication
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN'))) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, user?.role, router])

  if (authLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading integrations dashboard...</p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <IntegrationsDashboard />
        </div>
      </main>
      <Footer />
    </>
  )
}
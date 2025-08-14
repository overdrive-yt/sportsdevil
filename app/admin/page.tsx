// V9.15: Enhanced Admin Dashboard - Advanced Sidebar Layout & Weekly Analytics
'use client'

import { useState } from 'react'
import { RoleBasedAdminLayout } from '@/components/layouts/role-based-admin-layout'
import { DashboardToggle } from '@/components/admin/dashboard-toggle'
// Dynamically imported heavy components for better performance
import { 
  DynamicAdminDashboard,
  DynamicAdvancedAnalytics,
  DynamicIntegrationsDashboard,
  DynamicSystemHealthMonitor,
  DynamicSocialMediaManager,
  DynamicNotificationsCenter
} from '@/components/dynamic-loaders'
// Keep light components as regular imports
import { InteractiveStats } from '@/components/admin/interactive-stats'
import { EnhancedSettingsPanel } from '@/components/admin/enhanced-settings-panel'
import { DashboardOptimization } from '@/components/admin/dashboard-optimization'
import { StripeDashboard } from '@/components/admin/stripe-dashboard'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  Bell, 
  Activity, 
  Zap,
  Settings,
  TrendingUp,
  Users,
  CreditCard
} from 'lucide-react'

export default function AdminDashboard() {
  const [isAdvanced, setIsAdvanced] = useState(false)
  
  // This would typically come from your authentication system
  const currentUser = {
    name: "Kirtan Patel",
    email: "kirtan@sportsdevil.co.uk",
    role: "super_admin" as const, // Change this to test different roles: 'super_admin', 'admin', 'manager', 'family_member', 'viewer'
    avatar: undefined
  }

  const advancedDashboard = (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="grid w-full grid-cols-9 bg-gray-50 border-gray-200">
        <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <BarChart3 className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <TrendingUp className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <CreditCard className="h-4 w-4" />
          Payments
        </TabsTrigger>
        <TabsTrigger value="integrations" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Zap className="h-4 w-4" />
          Integrations
        </TabsTrigger>
        <TabsTrigger value="social" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Users className="h-4 w-4" />
          Social Media
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
        <TabsTrigger value="health" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Activity className="h-4 w-4" />
          System Health
        </TabsTrigger>
        <TabsTrigger value="optimization" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Zap className="h-4 w-4" />
          Optimization
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <InteractiveStats />
      </TabsContent>

      <TabsContent value="analytics">
        <DynamicAdvancedAnalytics />
      </TabsContent>

      <TabsContent value="payments">
        <StripeDashboard />
      </TabsContent>

      <TabsContent value="integrations">
        <DynamicIntegrationsDashboard />
      </TabsContent>

      <TabsContent value="social">
        <DynamicSocialMediaManager />
      </TabsContent>

      <TabsContent value="notifications">
        <DynamicNotificationsCenter />
      </TabsContent>

      <TabsContent value="health">
        <DynamicSystemHealthMonitor />
      </TabsContent>

      <TabsContent value="optimization">
        <DashboardOptimization />
      </TabsContent>

      <TabsContent value="settings">
        <EnhancedSettingsPanel currentUserRole={currentUser.role} />
      </TabsContent>
    </Tabs>
  )

  // Only show toggle for roles that have advanced dashboard access
  const canUseAdvanced = ['super_admin', 'admin', 'manager'].includes(currentUser.role)
  
  // If user can't use advanced, always show simple
  if (!canUseAdvanced) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Basic Dashboard Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="h-7 w-7 text-blue-600" />
                  Sports Devil Dashboard
                </h1>
              </div>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                Basic Mode
              </Badge>
            </div>
            <DynamicAdminDashboard />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Show advanced dashboard if toggled (Full sidebar layout, no Header/Footer)
  if (isAdvanced) {
    return (
      <RoleBasedAdminLayout 
        title="Advanced Dashboard" 
        currentUser={currentUser}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              All Systems Operational
            </Badge>
            <div className="text-center">
              <Button
                onClick={() => setIsAdvanced(false)}
                variant="outline"
                className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                <Users className="h-4 w-4" />
                Switch to Basic View
              </Button>
              <p className="text-xs text-gray-500 mt-1">takes you back to the website</p>
            </div>
          </div>
        }
      >
        {advancedDashboard}
      </RoleBasedAdminLayout>
    )
  }

  // Show simple dashboard with upgrade option (Header/Footer layout)
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DashboardToggle
          userRole={currentUser.role}
          advancedDashboard={advancedDashboard}
          simpleDashboard={<DynamicAdminDashboard />}
        />
      </main>
      <Footer />
    </div>
  )
}
// V9.14: Dashboard Type Toggle for Admin Users - White Theme & Improved UX
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, BarChart3, Users, Activity, Zap, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Role } from '@/lib/rbac'

interface DashboardToggleProps {
  userRole: Role
  advancedDashboard: React.ReactNode
  simpleDashboard: React.ReactNode
}

export function DashboardToggle({ 
  userRole, 
  advancedDashboard, 
  simpleDashboard 
}: DashboardToggleProps) {
  const [isAdvanced, setIsAdvanced] = useState(false) // Default to basic dashboard

  // Only show toggle for roles that have advanced dashboard access
  const canUseAdvanced = ['super_admin', 'admin', 'manager'].includes(userRole)

  // If user can't use advanced, always show simple
  if (!canUseAdvanced) {
    return <>{simpleDashboard}</>
  }

  // Show advanced dashboard if toggled
  if (isAdvanced) {
    return (
      <div className="space-y-6">
        {/* Advanced Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-blue-600" />
              Sports Devil Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Advanced Mode
            </Badge>
            <div className="text-center">
              <Button
                onClick={() => setIsAdvanced(false)}
                variant="outline"
                className="gap-2 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              >
                <Home className="h-4 w-4" />
                Switch to Basic View
              </Button>
              <p className="text-xs text-gray-500 mt-1">takes you back to the website</p>
            </div>
          </div>
        </div>
        <Separator className="bg-gray-200" />
        {advancedDashboard}
      </div>
    )
  }

  // Show simple dashboard with upgrade option
  return (
    <div className="space-y-6">
      {/* Basic Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-600" />
            Sports Devil Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <Users className="h-3 w-3 mr-1" />
            Basic Mode
          </Badge>
          <Button
            onClick={() => setIsAdvanced(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <Zap className="h-4 w-4" />
            Advanced Dashboard
          </Button>
        </div>
      </div>

      <Separator className="bg-gray-200" />

      {/* Simple Dashboard Content */}
      {simpleDashboard}

      {/* Upgrade Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-red-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Ready for More?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Unlock advanced analytics, integrations, and detailed reporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm">Advanced Analytics</h4>
                <p className="text-xs text-gray-600">Detailed reports and insights</p>
              </div>
              <div className="text-center">
                <Settings className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm">System Management</h4>
                <p className="text-xs text-gray-600">Full platform control</p>
              </div>
              <div className="text-center">
                <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-gray-900 text-sm">Real-time Monitoring</h4>
                <p className="text-xs text-gray-600">Live system health tracking</p>
              </div>
            </div>
            <Button
              onClick={() => setIsAdvanced(true)}
              className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Activate Advanced Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
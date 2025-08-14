'use client'

import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import Link from 'next/link'

// Enhanced Stat Card Component
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  href?: string
  onClick?: () => void
  isLoading?: boolean
  className?: string
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, description, icon: Icon, trend, trendValue, href, onClick, isLoading, className }, ref) => {
    const getTrendIcon = () => {
      switch (trend) {
        case 'up':
          return <TrendingUp className="w-3 h-3 text-green-600" />
        case 'down':
          return <TrendingDown className="w-3 h-3 text-red-600" />
        default:
          return <Minus className="w-3 h-3 text-gray-400" />
      }
    }

    const getTrendColor = () => {
      switch (trend) {
        case 'up':
          return 'text-green-600'
        case 'down':
          return 'text-red-600'
        default:
          return 'text-gray-500'
      }
    }

    const cardContent = (
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.2 }}
        className={cn(
          "relative overflow-hidden",
          (href || onClick) && "cursor-pointer group",
          className
        )}
        ref={ref}
      >
        <Card className="border-0 shadow-sm hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              {(href || onClick) && (
                <ArrowUpRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center justify-between mt-1">
                  {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                  )}
                  {trend && trendValue && (
                    <div className={cn("flex items-center space-x-1 text-xs", getTrendColor())}>
                      {getTrendIcon()}
                      <span>{trendValue}</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )

    if (href) {
      return <Link href={href}>{cardContent}</Link>
    }

    if (onClick) {
      return <div onClick={onClick}>{cardContent}</div>
    }

    return cardContent
  }
)
StatCard.displayName = "StatCard"

// Enhanced Action Card Component
interface ActionCardProps {
  title: string
  description: string
  icon?: React.ElementType
  iconColor?: string
  href?: string
  onClick?: () => void
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'success' | 'warning' | 'error'
  isLoading?: boolean
  disabled?: boolean
  className?: string
}

export const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(
  ({ 
    title, 
    description, 
    icon: Icon, 
    iconColor = 'bg-blue-500', 
    href, 
    onClick, 
    badge, 
    badgeVariant = 'default',
    isLoading,
    disabled,
    className 
  }, ref) => {
    const getBadgeColor = () => {
      switch (badgeVariant) {
        case 'success':
          return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        case 'warning':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        case 'error':
          return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        case 'secondary':
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      }
    }

    const cardContent = (
      <motion.div
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.1 }}
        className={cn(
          "relative overflow-hidden",
          !disabled && (href || onClick) && "cursor-pointer group",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
      >
        <Card className="border hover:border-primary/20 hover:shadow-md transition-all duration-200">
          <CardContent className="p-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {Icon && (
                    <div className={cn(
                      "p-2 rounded-md group-hover:scale-110 transition-transform",
                      iconColor
                    )}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-sm">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {badge && (
                    <Badge className={`${getBadgeColor()} border-0 text-xs px-2 py-1`}>
                      {badge}
                    </Badge>
                  )}
                  {!disabled && (href || onClick) && (
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )

    if (href && !disabled) {
      return <Link href={href}>{cardContent}</Link>
    }

    if (onClick && !disabled) {
      return <div onClick={onClick}>{cardContent}</div>
    }

    return cardContent
  }
)
ActionCard.displayName = "ActionCard"

// Enhanced Status Card Component
interface StatusCardProps {
  title: string
  status: 'operational' | 'warning' | 'error' | 'maintenance' | 'connected'
  uptime?: string
  description?: string
  icon?: React.ElementType
  isLoading?: boolean
  className?: string
}

export const StatusCard = forwardRef<HTMLDivElement, StatusCardProps>(
  ({ title, status, uptime, description, icon: Icon, isLoading, className }, ref) => {
    const getStatusColor = () => {
      switch (status) {
        case 'operational':
        case 'connected':
          return {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            icon: 'text-green-600 dark:text-green-400',
            badge: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }
        case 'warning':
          return {
            bg: 'bg-yellow-50 dark:bg-yellow-900/20',
            border: 'border-yellow-200 dark:border-yellow-800',
            icon: 'text-yellow-600 dark:text-yellow-400',
            badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
          }
        case 'error':
          return {
            bg: 'bg-red-50 dark:bg-red-900/20',
            border: 'border-red-200 dark:border-red-800',
            icon: 'text-red-600 dark:text-red-400',
            badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }
        case 'maintenance':
          return {
            bg: 'bg-gray-50 dark:bg-gray-800',
            border: 'border-gray-200 dark:border-gray-700',
            icon: 'text-gray-600 dark:text-gray-400',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          }
        default:
          return {
            bg: 'bg-gray-50 dark:bg-gray-800',
            border: 'border-gray-200 dark:border-gray-700',
            icon: 'text-gray-600 dark:text-gray-400',
            badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
          }
      }
    }

    const colors = getStatusColor()

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn("relative overflow-hidden", className)}
        ref={ref}
      >
        <div className={cn(
          "flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-all duration-200",
          colors.bg,
          colors.border
        )}>
          <div className="flex items-center space-x-3">
            {Icon && <Icon className={cn("h-4 w-4", colors.icon)} />}
            <div>
              <span className="font-medium text-sm">{title}</span>
              {uptime && (
                <p className="text-xs text-muted-foreground">{uptime} uptime</p>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-6 w-16" />
          ) : (
            <Badge className={`${colors.badge} border-0 text-xs`}>
              {status}
            </Badge>
          )}
        </div>
      </motion.div>
    )
  }
)
StatusCard.displayName = "StatusCard"

// Enhanced Activity Card Component
interface ActivityCardProps {
  title: string
  description?: string
  timestamp: string
  type: 'success' | 'info' | 'warning' | 'error'
  icon?: React.ElementType
  isLoading?: boolean
  className?: string
}

export const ActivityCard = forwardRef<HTMLDivElement, ActivityCardProps>(
  ({ title, description, timestamp, type, icon: Icon, isLoading, className }, ref) => {
    const getTypeColor = () => {
      switch (type) {
        case 'success':
          return 'bg-green-500'
        case 'warning':
          return 'bg-yellow-500'
        case 'error':
          return 'bg-red-500'
        default:
          return 'bg-blue-500'
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className={cn("relative overflow-hidden", className)}
        ref={ref}
      >
        <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
          <div className={cn("w-2 h-2 rounded-full flex-shrink-0", getTypeColor())}></div>
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-24" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium truncate">{title}</p>
                {description && (
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                )}
                <p className="text-xs text-muted-foreground">{timestamp}</p>
              </>
            )}
          </div>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
        </div>
      </motion.div>
    )
  }
)
ActivityCard.displayName = "ActivityCard"

// Enhanced Card - Base Component
interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hover?: boolean
  gradient?: boolean
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, children, hover = true, gradient = false, ...props }, ref) => {
    // Filter out HTML event handlers that conflict with Framer Motion
    const {
      onDrag,
      onDragStart,
      onDragEnd,
      onAnimationStart,
      onAnimationEnd,
      onAnimationIteration,
      onTransitionEnd,
      ...motionProps
    } = props
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm",
          hover && "hover:shadow-md transition-shadow duration-200",
          gradient && "bg-gradient-to-br from-card to-card/80",
          className
        )}
        whileHover={hover ? {
          y: -2,
          scale: 1.02,
          transition: { duration: 0.2 }
        } : {}}
        {...motionProps}
      >
        {children}
      </motion.div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"
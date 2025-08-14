"use client"

import { useNotifications } from '@/contexts/notification-context'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

const colorMap = {
  success: 'border-green-500 bg-green-50 text-green-900',
  error: 'border-red-500 bg-red-50 text-red-900',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
  info: 'border-blue-500 bg-blue-50 text-blue-900',
}

export function NotificationToast() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type]
        const colorClass = colorMap[notification.type]

        return (
          <Alert key={notification.id} className={`${colorClass} shadow-lg animate-slide-up max-w-md`}>
            <Icon className="h-4 w-4" />
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <AlertTitle className="font-semibold">{notification.title}</AlertTitle>
                {notification.description && (
                  <AlertDescription className="mt-1">
                    {notification.description}
                  </AlertDescription>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-current hover:bg-current/10"
                onClick={() => removeNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        )
      })}
    </div>
  )
}
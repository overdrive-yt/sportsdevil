'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { Separator } from './ui/separator'
import { Badge } from './ui/badge'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { useCurrentUser } from '../hooks/use-auth-store'
import { useDashboardData } from '../hooks/use-extended-user'
import { toast } from '../hooks/use-toast'
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Settings, 
  Save,
  Loader2,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileEditorProps {
  onProfileUpdate?: () => void
}

export function ProfileEditor({ onProfileUpdate }: ProfileEditorProps) {
  const { user: sessionUser, isLoading: sessionLoading } = useCurrentUser()
  const { user: extendedUser, isLoading: dashboardLoading } = useDashboardData()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Use extended user data with session user as fallback
  const user = extendedUser || sessionUser
  const isLoading = sessionLoading || dashboardLoading

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: (user as any)?.phone || '',
      address: (user as any)?.address || '',
      city: (user as any)?.city || '',
      postalCode: (user as any)?.postalCode || '',
      country: (user as any)?.country || 'United Kingdom',
    },
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
        city: (user as any).city || '',
        postalCode: (user as any).postalCode || '',
        country: (user as any).country || 'United Kingdom',
      })
    }
  }, [user, form])

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      toast({
        title: 'Profile Updated Successfully',
        description: 'Your personal information has been saved.',
      })

      setIsEditing(false)
      onProfileUpdate?.()
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    form.reset()
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2">Loading profile...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
              <CardDescription>Manage your personal details and contact information</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Email Address</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={user?.email || ''} disabled className="bg-muted" />
                    <Badge variant="secondary">Verified</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Address Information</h4>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter postal code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Country</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium">Full Name</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.name || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Phone Number</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(user as any)?.phone || 'Not provided'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Email Address</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-sm font-medium">Address Information</Label>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {(user as any)?.address || 'Street address not provided'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(user as any)?.city && (user as any)?.postalCode 
                      ? `${(user as any).city}, ${(user as any).postalCode}` 
                      : (user as any)?.city || (user as any)?.postalCode || 'City and postal code not provided'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(user as any)?.country || 'Country not provided'}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Member Since</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {(user as any)?.createdAt 
                    ? new Date((user as any).createdAt).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Date not available'
                  }
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Account Security</span>
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For security reasons, some account changes require email verification.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-12">
                <Settings className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" className="justify-start h-12">
                <Mail className="h-4 w-4 mr-2" />
                Email Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
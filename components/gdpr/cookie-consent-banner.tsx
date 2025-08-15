'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { Badge } from '../ui/badge'
import { X, Settings, Shield, Info, Cookie } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { COOKIE_DEFINITIONS, CookieCategory, GDPRConsent } from '../../lib/gdpr'
import { useRouter } from 'next/navigation'

interface CookieConsentBannerProps {
  onConsentSave: (consent: Omit<GDPRConsent, 'consentDate' | 'lastUpdated' | 'userId'>) => void
  initialConsent?: GDPRConsent | null
  sessionId: string
}

export default function CookieConsentBanner({ 
  onConsentSave, 
  initialConsent,
  sessionId 
}: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [consent, setConsent] = useState({
    essential: true, // Cannot be disabled
    performance: false,
    functional: false,
    marketing: false,
    analytics: false
  })

  const router = useRouter()

  useEffect(() => {
    // Check if consent is required
    if (!initialConsent) {
      setIsVisible(true)
    } else {
      // Check if consent is older than 1 year
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      if (new Date(initialConsent.lastUpdated) < oneYearAgo) {
        setIsVisible(true)
      }
      
      // Load existing consent
      setConsent({
        essential: initialConsent.essential,
        performance: initialConsent.performance,
        functional: initialConsent.functional,
        marketing: initialConsent.marketing,
        analytics: initialConsent.analytics
      })
    }
  }, [initialConsent])

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      performance: true,
      functional: true,
      marketing: true,
      analytics: true,
      sessionId,
      ipAddress: '0.0.0.0', // Will be set server-side
      userAgent: navigator.userAgent,
      version: '1.0'
    }
    
    setConsent(fullConsent)
    saveConsent(fullConsent)
  }

  const handleAcceptEssential = () => {
    const essentialConsent = {
      essential: true,
      performance: false,
      functional: false,
      marketing: false,
      analytics: false,
      sessionId,
      ipAddress: '0.0.0.0', // Will be set server-side
      userAgent: navigator.userAgent,
      version: '1.0'
    }
    
    setConsent(essentialConsent)
    saveConsent(essentialConsent)
  }

  const handleSavePreferences = () => {
    const customConsent = {
      ...consent,
      sessionId,
      ipAddress: '0.0.0.0', // Will be set server-side
      userAgent: navigator.userAgent,
      version: '1.0'
    }
    
    saveConsent(customConsent)
  }

  const saveConsent = async (consentData: any) => {
    try {
      onConsentSave(consentData)
      setIsVisible(false)
      setShowSettings(false)
      
      // Reload page to apply cookie settings
      window.location.reload()
    } catch (error) {
      console.error('Failed to save consent:', error)
    }
  }

  const updateConsent = (category: keyof typeof consent, value: boolean) => {
    if (category === 'essential') return // Cannot disable essential cookies
    
    setConsent(prev => ({
      ...prev,
      [category]: value
    }))
  }

  if (!isVisible) return null

  return (
    <>
      {/* Main consent banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <div className="container mx-auto p-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      We use cookies to enhance your experience
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      We use cookies to personalise content and ads, provide social media features, 
                      and analyse our traffic. We also share information about your use of our site 
                      with our analytics and advertising partners.
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleAcceptAll}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Accept All
                    </Button>
                    
                    <Button 
                      onClick={handleAcceptEssential}
                      variant="outline"
                    >
                      Essential Only
                    </Button>
                    
                    <Button 
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Preferences
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    By continuing to use our site, you consent to our use of cookies. 
                    <button 
                      onClick={() => router.push('/privacy-policy')}
                      className="text-primary hover:underline ml-1"
                    >
                      Learn more about our Privacy Policy
                    </button>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cookie preferences dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies cannot be disabled as they are 
              necessary for the website to function properly.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(COOKIE_DEFINITIONS).map(([category, definition]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label 
                      htmlFor={category}
                      className="font-medium cursor-pointer"
                    >
                      {definition.name}
                    </Label>
                    {category === CookieCategory.ESSENTIAL && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  
                  <Switch
                    id={category}
                    checked={consent[category as keyof typeof consent]}
                    onCheckedChange={(checked) => updateConsent(category as keyof typeof consent, checked)}
                    disabled={category === CookieCategory.ESSENTIAL}
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {definition.description}
                </p>
                
                <div className="text-xs text-muted-foreground">
                  <strong>Retention:</strong> {definition.retention} | 
                  <strong className="ml-2">Legal basis:</strong> {definition.purpose.replace('_', ' ')}
                </div>
                
                <details className="text-xs">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View specific cookies ({definition.cookies.length})
                  </summary>
                  <div className="mt-2 space-y-2">
                    {definition.cookies.map((cookie, index) => (
                      <div key={index} className="ml-4 p-2 bg-muted/50 rounded">
                        <div className="font-medium">{cookie.name}</div>
                        <div className="text-muted-foreground">{cookie.description}</div>
                        <div className="text-muted-foreground">Expires: {cookie.expiry}</div>
                      </div>
                    ))}
                  </div>
                </details>
                
                {category !== CookieCategory.ANALYTICS && <Separator />}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-4 w-4" />
              Changes will take effect after page reload
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Data Controller:</strong> W3 Sports Devil Ltd
            </p>
            <p>
              <strong>Contact:</strong> privacy@sportsdevil.co.uk
            </p>
            <p>
              You can withdraw your consent or change your preferences at any time by 
              clicking the cookie settings link in our footer.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
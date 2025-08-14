'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function WhatsAppFloat() {
  const [isOpen, setIsOpen] = useState(false)
  
  const whatsappNumber = '+441211234567' // Replace with actual WhatsApp business number
  const defaultMessage = 'Hello! I\'m interested in your cricket equipment. Can you help me?'

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage)
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  return (
    <>
      {/* Main WhatsApp Button - Positioned below scroll-to-top button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          size="icon"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* WhatsApp Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-3rem)]">
          <Card className="shadow-xl border-green-200">
            <CardHeader className="bg-green-500 text-white rounded-t-lg">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Sports Devil Support</span>
              </CardTitle>
              <div className="flex items-center space-x-2 text-green-100">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm">Typically replies instantly</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="bg-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  👋 Hi there! Welcome to Sports Devil!
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  How can we help you today? We're here to assist with:
                </p>
                <ul className="text-sm text-gray-700 mt-2 list-disc list-inside space-y-1">
                  <li>Product recommendations</li>
                  <li>Size and fit guidance</li>
                  <li>Order status updates</li>
                  <li>Technical support</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleWhatsAppClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Start WhatsApp Chat
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By clicking above, you'll be redirected to WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
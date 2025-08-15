'use client'

import Link from 'next/link'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { Facebook, Instagram, Mail, Phone, MapPin, Star } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="font-bold text-xl">
                <span className="text-primary">Sports</span>
                <span className="text-foreground">Devil</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted partner for premium sporting equipment. 
              Quality gear for athletes at every level.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform duration-200" asChild>
                <Link href="https://www.facebook.com/sportsdevil.co.uk/" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform duration-200" asChild>
                <Link href="https://www.tiktok.com/@sportsdevil3/video/7527043096287186198" target="_blank" rel="noopener noreferrer">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="sr-only">TikTok</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform duration-200" asChild>
                <Link href="https://www.instagram.com/sportsdevil1/" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                All Products
              </Link>
              <Link href="/products?featured=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Featured Products
              </Link>
              <Link href="/products?new=true" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                New Arrivals
              </Link>
            </nav>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Service</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <Link href="/shipping" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Shipping Info
              </Link>
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Returns & Exchanges
              </Link>
              <Link href="/warranty" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Warranty
              </Link>
            </nav>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Get In Touch</h3>
            <div className="space-y-2">
              <Link 
                href="https://maps.google.com/?q=309+Kingstanding+Rd,+Birmingham+B44+9TH" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <MapPin className="h-5 w-5" />
                <span>309 Kingstanding Rd, Birmingham B44 9TH</span>
              </Link>
              <Link 
                href="tel:07897813165"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Phone className="h-5 w-5" />
                <span>07897813165</span>
              </Link>
              <Link 
                href="mailto:info@sportsdevil.co.uk"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Mail className="h-5 w-5" />
                <span>info@sportsdevil.co.uk</span>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Leave a Review</h3>
              <Link 
                href="https://www.google.com/maps/place/Sports+Devil+Online+Cricket+Shop/@52.5432429,-1.9018155,17z/data=!4m12!1m2!2m1!1sgoogle+maps+sports+devil+review!3m8!1s0x84aacdd62ea8534f:0x5f6b60fee8a3837d!8m2!3d52.5432429!4d-1.8992406!9m1!1b1!15sCh9nb29nbGUgbWFwcyBzcG9ydHMgZGV2aWwgcmV2aWV3IgOIAQGSARRzcG9ydGluZ19nb29kc19zdG9yZeABAA!16s%2Fg%2F11rpzm6jnw?entry=ttu&g_ep=EgoyMDI1MDcyOS4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <Star className="h-5 w-5" />
                <span>Review & get extra 5% off</span>
              </Link>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold">Newsletter</h3>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Coming Soon"
                  className="flex-1"
                  disabled
                />
                <Button size="sm" disabled>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 Sports Devil™. All rights reserved.
          </p>
          <nav className="flex space-x-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Cookie Policy
            </Link>
          </nav>
        </div>
        
        <div className="text-center pt-4 border-t border-muted mt-4">
          <p className="text-xs text-muted-foreground">
            Made By: <Link href="#" className="hover:text-primary transition-colors">iCandy</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
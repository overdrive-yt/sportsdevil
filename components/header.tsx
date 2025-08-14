"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, User, Menu, Search, Heart, LogIn, UserPlus, LogOut, Settings, Package, Minus, Plus } from "lucide-react"
import { useCartStore } from '@/stores/cart-store'
import { useCurrentUser, useEnhancedLogout } from '@/hooks/use-auth-store'
import { useCartSyncStatus } from '@/hooks/use-cart-sync'
import { ScrollingBanner } from "@/components/scrolling-banner"
import { WishlistHeaderButton } from "@/components/wishlist-header-button"
import { formatPriceSimple } from '@/lib/utils'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isCartHydrated, setIsCartHydrated] = useState(false)
  const { user, isAuthenticated, isLoading, isAdmin, isCustomer } = useCurrentUser()
  const { mutate: logout, isPending: isLoggingOut } = useEnhancedLogout()
  const cartStore = useCartStore()
  const { statusText, statusColor, isSyncing: isSyncingStatus } = useCartSyncStatus()

  // Safe access to cart store with defaults
  const items = cartStore?.items || []
  const getTotalItems = cartStore?.getTotalItems || (() => 0)
  const getTotalPrice = cartStore?.getTotalPrice || (() => 0)
  const isSyncing = cartStore?.isSyncing || false
  
  const totalItems = getTotalItems()

  useEffect(() => {
    // Ensure immediate functionality
    setIsReady(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Prevent hydration mismatch by only showing cart badge after client-side hydration
    setIsCartHydrated(true)
  }, [])

  // Debug authentication state changes from auth store
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const currentTime = new Date().toISOString().split('T')[1].split('.')[0]
      console.log(`🖥️ [${currentTime}] HEADER AUTH STORE STATE:`, {
        isAuthenticated,
        isLoading,
        isLoggingOut,
        user: user?.email,
        userRole: user?.role,
      })
    }
  }, [isAuthenticated, isLoading, isLoggingOut, user?.email, user?.role])

  return (
    <>
      {/* Scrolling Banner */}
      <ScrollingBanner />

      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
        }`}
      >
        <nav className="container mx-auto px-2 sm:px-3 md:px-2 lg:px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center mr-2 sm:mr-4 md:mr-2 lg:mr-6 xl:mr-8">
                <Image
                src="/images/logo-rect-white.jpg"
                alt="Sports Devil"
                width={240}
                height={72}
                className="h-6 sm:h-8 md:h-8 lg:h-9 xl:h-16 w-auto flex-shrink-0 max-w-none"
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors font-medium hover:scale-110 transition-transform duration-200">
                Home
              </Link>
              
              <NavigationMenu delayDuration={0}>
                <NavigationMenuList className="space-x-2">
                  {/* Cricket Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-900 hover:text-blue-600 transition-colors font-medium hover:scale-110 transition-transform duration-200">
                      Cricket
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[800px] p-6">
                        {/* Age Category Filter Buttons */}
                        <div className="mb-6 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-600">Shop by Age Group:</span>
                            <Link 
                              href="/products?category=Bats,Batting Gloves,Batting Pads,Helmets,Thigh Pads,Wicket Keeping Gloves,Wicket Keeping Pads,Kit Bags&prefilter=true" 
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 hover:scale-105 transition-all duration-200 font-medium text-sm shadow-sm"
                            >
                              🏏 Mens Cricket Equipment
                            </Link>
                            <Link 
                              href="/products?category=Junior Stock,Junior Bats,Junior Batting Gloves,Junior Batting Pads/ Leg Guards,Junior Helmets,Junior Thigh Pads,Junior Wicket Keeping Gloves,Junior Wicket Keeping Shin Guard,Junior Kitbags,Junior Abdomen Guards&prefilter=true" 
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 hover:scale-105 transition-all duration-200 font-medium text-sm shadow-sm"
                            >
                              🏏 Junior Cricket Equipment
                            </Link>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                          {/* Column 1: Cricket Bats */}
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">
                              Cricket Bats
                            </h3>
                            <div className="space-y-2">
                              <Link href="/products?category=Bats&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">All Cricket Bats</Link>
                              <Link href="/products?search=Sports+Devil&category=Bats&prefilter=true" className="block text-sm text-red-600 hover:text-red-700 hover:scale-105 transition-all duration-200 font-semibold">Sports Devil</Link>
                              <Link href="/products?category=A2&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">A2</Link>
                              <Link href="/products?category=BAS&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">BAS</Link>
                              <Link href="/products?category=BDM&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">BDM</Link>
                              <Link href="/products?category=CEAT&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">CEAT</Link>
                              <Link href="/products?category=DSC&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">DSC</Link>
                              <Link href="/products?category=GM&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">GM</Link>
                              <Link href="/products?search=GRAY+NICOLLS&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">GRAY NICOLLS</Link>
                              <Link href="/products?category=KG&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">KG</Link>
                              <Link href="/products?category=MRF&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">MRF</Link>
                              <Link href="/products?category=NB&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">NEW BALANCE</Link>
                              <Link href="/products?category=RNS&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">RNS</Link>
                              <Link href="/products?category=SF&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">SF</Link>
                              <Link href="/products?category=SG&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">SG</Link>
                              <Link href="/products?category=SS&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">SS</Link>
                            </div>
                          </div>
                          
                          {/* Column 2: Junior Stock & More */}
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">
                              Youth/Junior Stock
                            </h3>
                            <div className="space-y-2">
                              <Link href="/products?category=Junior Batting Gloves&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior Batting Gloves</Link>
                              <Link href="/products?category=Junior Batting Pads/ Leg Guards&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior Batting Pads</Link>
                              <Link href="/products?category=Junior Bats&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior Cricket Bats</Link>
                              <Link href="/products?category=Junior Helmets&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior Helmets</Link>
                              <Link href="/products?category=Junior Thigh Pads&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior Thigh Pads</Link>
                              <Link href="/products?category=Junior Wicket Keeping Gloves&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior WK Gloves</Link>
                              <Link href="/products?category=Junior Wicket Keeping Shin Guard&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Junior WK Pads</Link>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Protection</h3>
                            <div className="space-y-2">
                              <Link href="/products?search=Abdomen+Guard&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Abdomen Guards</Link>
                              <Link href="/products?category=Batting Gloves&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Batting Gloves</Link>
                              <Link href="/products?category=Batting Pads&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Batting Pads</Link>
                              <Link href="/products?search=Chest+Guard&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Chest Guards</Link>
                              <Link href="/products?search=Elbow+Guard&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Elbow Guards</Link>
                              <Link href="/products?category=Helmets&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Helmets</Link>
                              <Link href="/products?category=Thigh Pads&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Thigh Pads</Link>
                            </div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900 mt-6">Wicket Keeping & More</h3>
                            <div className="space-y-2">
                              <Link href="/products?category=Wicket Keeping Gloves&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">WK Gloves</Link>
                              <Link href="/products?category=Wicket Keeping Pads&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">WK Pads</Link>
                              <Link href="/products?category=Wicket Stumps&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Wicket Stumps</Link>
                              <Link href="/products?search=Cricket+Ball&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Balls</Link>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Apparel & Footwear</h3>
                            <div className="space-y-2">
                              <Link href="/products?search=Cricket+Clothing&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Clothing</Link>
                              <Link href="/products?search=Cricket+Shirts&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Shirts</Link>
                              <Link href="/products?search=Cricket+Trousers&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Trousers</Link>
                              <Link href="/products?search=Cricket+Shoes&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Shoes</Link>
                              <Link href="/products?search=Cricket+Caps&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Cricket Caps</Link>
                            </div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900 mt-6">Accessories</h3>
                            <div className="space-y-2">
                              <Link href="/products?category=Bat Grips&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Bat Grips</Link>
                              <Link href="/products?search=Kit+Bag&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Kit Bags</Link>
                              <Link href="/products?category=Bat Padded Cover&prefilter=true" className="block text-sm text-gray-700 hover:text-blue-600 hover:scale-105 transition-all duration-200">Bat Covers</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Tennis Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-500 hover:text-gray-600 transition-colors font-medium cursor-not-allowed">
                      Tennis
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] p-6 relative overflow-hidden">
                        {/* Coming Soon Diagonal Banner */}
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center z-10">
                          <div className="transform -rotate-45 origin-center">
                            <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white text-4xl font-bold px-20 py-4 shadow-lg">
                              COMING SOON
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 opacity-20">
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Rackets</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">All Rackets</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Babolat</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Head</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Junior Rackets</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Prince</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Wilson</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Strings & Accessories</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Dampeners</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Grips & Overgrips</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Bags</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Balls</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Strings</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Apparel & Footwear</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Caps</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Clothing</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Shirts</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Shoes</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Tennis Shorts</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* Hockey Mega Menu */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-500 hover:text-gray-600 transition-colors font-medium cursor-not-allowed">
                      Hockey
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[600px] p-6 relative overflow-hidden">
                        {/* Coming Soon Diagonal Banner */}
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center z-10">
                          <div className="transform -rotate-45 origin-center">
                            <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white text-4xl font-bold px-20 py-4 shadow-lg">
                              COMING SOON
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 opacity-20">
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Hockey Sticks</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">All Hockey Sticks</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Adidas</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Grays</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Junior Sticks</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Osaka</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">TK Hockey</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Protective Gear</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Face Masks</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Goalkeeping Kit</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Hockey Gloves</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Kickers</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Shin Pads</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Accessories</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Hockey Bags</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Hockey Balls</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Hockey Clothing</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Hockey Shoes</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Stick Grips</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  {/* More Sports Dropdown */}
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-gray-500 hover:text-gray-600 transition-colors font-medium cursor-not-allowed">
                      More Sports
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-[400px] p-6 relative overflow-hidden">
                        {/* Coming Soon Diagonal Banner */}
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-95 flex items-center justify-center z-10">
                          <div className="transform -rotate-45 origin-center">
                            <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white text-3xl font-bold px-16 py-3 shadow-lg">
                              COMING SOON
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 opacity-20">
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Team Sports</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Football Equipment</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Rugby Equipment</span>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg mb-4 text-gray-900">Racket Sports</h3>
                            <div className="space-y-2">
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Badminton Equipment</span>
                              <span className="block text-sm text-gray-400 cursor-not-allowed">Pickleball Equipment</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200">
                <Search className="h-5 w-5" />
              </Button>

              {/* Wishlist */}
              <WishlistHeaderButton />

              {/* Cart */}
              <div className="relative group">
                <Button variant="ghost" size="icon" className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200 relative">
                  <ShoppingCart className="h-5 w-5" />
                  {isCartHydrated && totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.25rem] h-5">
                      {totalItems}
                    </Badge>
                  )}
                  {isCartHydrated && (isSyncing || isSyncingStatus) && (
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </Button>
                <div className="absolute top-full right-0 w-96 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Shopping Cart</h3>
                    {!isCartHydrated ? (
                      <p className="text-gray-500 text-center py-4">Loading cart...</p>
                    ) : totalItems === 0 ? (
                      <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                    ) : (
                      <>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              <div className="flex-1">
                                <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                                <p className="text-xs text-gray-600">
                                  {item.quantity} × {formatPriceSimple(parseFloat(item.product.price))}
                                </p>
                              </div>
                            </div>
                          ))}
                          {items.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{items.length - 3} more items
                            </p>
                          )}
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between">
                            <span>Total:</span>
                            <span className="font-semibold">{formatPriceSimple(getTotalPrice())}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700" asChild>
                            <Link href="/cart">View Cart</Link>
                          </Button>
                          <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                            <Link href="/checkout">Checkout</Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* User Account */}
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200 flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span className="hidden md:inline text-sm">{user?.name || user?.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200">
                    <DropdownMenuItem asChild>
                      <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                      </Link>
                    </DropdownMenuItem>
                    {/* Customer-specific menu items */}
                    {isCustomer && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                            <User className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/orders" className="flex items-center cursor-pointer">
                            <Package className="h-4 w-4 mr-2" />
                            Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    {/* Admin-specific menu items */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin?tab=products" className="flex items-center cursor-pointer">
                            <Package className="h-4 w-4 mr-2" />
                            Manage Products
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin?tab=orders" className="flex items-center cursor-pointer">
                            <Package className="h-4 w-4 mr-2" />
                            Manage Orders
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => {
                        if (!isLoggingOut) {
                          console.log('🔓 HEADER: Logout button clicked')
                          logout()
                        } else {
                          console.log('⚠️ HEADER: Logout already in progress, ignoring click')
                        }
                      }}
                      className={`flex items-center cursor-pointer ${
                        isLoggingOut 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-red-600 hover:text-red-700'
                      }`}
                      disabled={isLoggingOut}
                    >
                      <LogOut className={`h-4 w-4 mr-2 ${isLoggingOut ? 'animate-spin' : ''}`} />
                      {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden lg:flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-blue-600 hover:scale-110 transition-transform duration-200" asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-1" />
                      Login
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 hover:scale-110 transition-transform duration-200"
                    asChild
                  >
                    <Link href="/register">
                      <UserPlus className="h-4 w-4 mr-1" />
                      Register
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-gray-700 hover:text-blue-600">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white">
                  <SheetHeader>
                    <SheetTitle>Navigation Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-8 max-h-[70vh] overflow-y-auto">
                    <Link href="/" className="text-gray-900 hover:text-blue-600 transition-colors py-2 font-medium">
                      Home
                    </Link>
                    
                    {/* Cricket Section */}
                    <div className="py-2">
                      <Link href="/products?search=Cricket&prefilter=true" className="font-semibold text-gray-900 mb-2 text-lg hover:text-blue-600 transition-colors">
                        Cricket
                      </Link>
                      <div className="pl-4 space-y-1 mt-2">
                        <p className="font-medium text-gray-800 text-sm mb-1">Cricket Bats</p>
                        <div className="pl-2 space-y-1">
                          <Link href="/products?category=Bats&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">All Bats</Link>
                          <Link href="/products?category=SS&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">SS</Link>
                          <Link href="/products?category=MRF&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">MRF</Link>
                          <Link href="/products?category=SG&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">SG</Link>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-1 mt-2">Protection</p>
                        <div className="pl-2 space-y-1">
                          <Link href="/products?category=Batting Gloves&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">Batting Gloves</Link>
                          <Link href="/products?category=Helmets&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">Helmets</Link>
                          <Link href="/products?category=Batting Pads&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">Batting Pads</Link>
                        </div>
                        <p className="font-medium text-gray-800 text-sm mb-1 mt-2">Wicket Keeping</p>
                        <div className="pl-2 space-y-1">
                          <Link href="/products?category=Wicket Keeping Gloves&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">WK Gloves</Link>
                          <Link href="/products?category=Wicket Keeping Pads&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-xs">WK Pads</Link>
                        </div>
                      </div>
                    </div>

                    {/* Tennis Section */}
                    <div className="py-2">
                      <Link href="/products?category=Tennis&prefilter=true" className="font-semibold text-gray-900 mb-2 text-lg hover:text-blue-600 transition-colors">
                        Tennis
                      </Link>
                      <div className="pl-4 space-y-1 mt-2">
                        <Link href="/products?search=Tennis+Rackets&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Tennis Rackets</Link>
                        <Link href="/products?search=Tennis+Strings&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Strings & Grips</Link>
                        <Link href="/products?search=Tennis+Balls&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Tennis Balls</Link>
                        <Link href="/products?search=Tennis+Bags&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Tennis Bags</Link>
                        <Link href="/products?search=Tennis+Shoes&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Tennis Shoes</Link>
                      </div>
                    </div>

                    {/* Hockey Section */}
                    <div className="py-2">
                      <Link href="/products?category=Hockey&prefilter=true" className="font-semibold text-gray-900 mb-2 text-lg hover:text-blue-600 transition-colors">
                        Hockey
                      </Link>
                      <div className="pl-4 space-y-1 mt-2">
                        <Link href="/products?search=Hockey+Sticks&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Hockey Sticks</Link>
                        <Link href="/products?search=Hockey+Shin+Pads&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Shin Pads</Link>
                        <Link href="/products?search=Hockey+Gloves&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Hockey Gloves</Link>
                        <Link href="/products?search=Hockey+Goalkeeping&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Goalkeeping Kit</Link>
                        <Link href="/products?search=Hockey+Balls&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Hockey Balls</Link>
                      </div>
                    </div>

                    {/* More Sports Section */}
                    <div className="py-2">
                      <p className="font-semibold text-gray-900 mb-2 text-lg">More Sports</p>
                      <div className="pl-4 space-y-1 mt-2">
                        <Link href="/products?search=Rugby+Equipment&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Rugby Equipment</Link>
                        <Link href="/products?search=Football+Equipment&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Football Equipment</Link>
                        <Link href="/products?search=Pickleball+Equipment&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Pickleball Equipment</Link>
                        <Link href="/products?search=Badminton+Equipment&prefilter=true" className="block text-gray-600 hover:text-blue-600 transition-colors text-sm">Badminton Equipment</Link>
                      </div>
                    </div>

                    {!isAuthenticated && (
                      <>
                        <Link href="/login" className="text-gray-900 hover:text-blue-600 transition-colors py-2 font-medium">
                          Login
                        </Link>
                        <Link href="/register" className="text-gray-900 hover:text-blue-600 transition-colors py-2 font-medium">
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Minus, X } from 'lucide-react'
import { useCartStore } from '@/stores/cart-store'
import { formatPriceSimple } from '@/lib/utils'

interface CartDrawerProps {
  children?: React.ReactNode
}

export function CartDrawer({ children }: CartDrawerProps) {
  const [open, setOpen] = useState(false)
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore()

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id)
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {getTotalItems() === 0 
              ? 'Your cart is empty' 
              : `${getTotalItems()} item${getTotalItems() > 1 ? 's' : ''} in your cart`
            }
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-2">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPriceSimple(item.product.price)}
                      </p>
                      {((item as any).size || (item as any).color) && (
                        <p className="text-xs text-muted-foreground">
                          {(item as any).size && `Size: ${(item as any).size}`}
                          {(item as any).size && (item as any).color && ', '}
                          {(item as any).color && `Color: ${(item as any).color}`}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-lg">{formatPriceSimple(getTotalPrice())}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/cart">View Cart</Link>
                </Button>
                <Button asChild variant="outline" className="w-full" onClick={() => setOpen(false)}>
                  <Link href="/checkout">Checkout</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
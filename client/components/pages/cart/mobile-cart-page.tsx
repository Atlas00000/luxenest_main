"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileCartItem } from "./mobile-cart-item"
import { MobileCartEmptyState } from "./mobile-cart-empty-state"
import { MobileCartOrderSummary } from "./mobile-cart-order-summary"
import { MobileCartAnalytics } from "./mobile-cart-analytics"
import type { CartItem } from "@/lib/cart"

// Mock analytics data - replace with actual data from your backend
const mockAnalytics = {
  totalSpent: 1250.75,
  averageOrderValue: 125.08,
  itemsPurchased: 15,
  savings: 187.5,
  freeShippingThreshold: 100,
  currentSpend: 75.25,
}

export function MobileCartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart()
  const { toast } = useToast()
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [savedItems, setSavedItems] = useState<CartItem[]>([])
  const [activeTab, setActiveTab] = useState("cart")

  // Load saved items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedForLater")
    if (saved) {
      setSavedItems(JSON.parse(saved))
    }
  }, [])

  // Save items to localStorage when updated
  useEffect(() => {
    localStorage.setItem("savedForLater", JSON.stringify(savedItems))
  }, [savedItems])

  const handleApplyPromo = async (code: string) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful promo code
    if (code.toLowerCase() === "discount20") {
      setDiscount(subtotal * 0.2)
      toast({
        title: "Promo code applied",
        description: "20% discount has been applied to your order.",
      })
    } else {
      toast({
        title: "Invalid promo code",
        description: "Please check the code and try again.",
        variant: "destructive",
      })
    }
  }

  const handleSaveForLater = (item: CartItem) => {
    setSavedItems((prev) => [...prev, item])
    removeItem(item.product.id)
    toast({
      title: "Saved for later",
      description: `${item.product.name} has been moved to your saved items.`,
    })
  }

  const handleMoveToCart = (item: CartItem) => {
    updateQuantity(item.product.id, item.quantity)
    setSavedItems((prev) => prev.filter((i) => i.product.id !== item.product.id))
    toast({
      title: "Moved to cart",
      description: `${item.product.name} has been moved to your cart.`,
    })
  }

  const handleRemoveSaved = (productId: string) => {
    setSavedItems((prev) => prev.filter((item) => item.product.id !== productId))
    toast({
      title: "Removed from saved items",
      description: "Item has been removed from your saved items.",
    })
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      toast({
        title: "Minimum quantity",
        description: "Quantity cannot be less than 1.",
        variant: "destructive",
      })
      return
    }
    if (newQuantity > 10) {
      toast({
        title: "Maximum quantity",
        description: "Maximum quantity per item is 10.",
        variant: "destructive",
      })
      return
    }
    updateQuantity(productId, newQuantity)
  }

  const handleImageLoad = (productId: string) => {
    setImageLoaded((prev) => ({ ...prev, [productId]: true }))
  }

  const shipping = subtotal > mockAnalytics.freeShippingThreshold ? 0 : 10
  const total = subtotal - discount + shipping
  const progressToFreeShipping = (subtotal / mockAnalytics.freeShippingThreshold) * 100

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="Your Cart"
        subtitle="Every item is backed by our lifetime repair guarantee"
        eyebrow="Shopping"
      />

      <MobileSection>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cart" className="text-xs">
              Cart ({items.length})
            </TabsTrigger>
            <TabsTrigger value="saved" className="text-xs">
              Saved ({savedItems.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cart" className="mt-4">
            {items.length > 0 ? (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <MobileCartItem
                    key={item.product.id}
                    item={item}
                    index={index}
                    imageLoaded={imageLoaded}
                    onImageLoad={handleImageLoad}
                    onQuantityChange={handleQuantityChange}
                    onSaveForLater={handleSaveForLater}
                    onRemove={removeItem}
                  />
                ))}

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button variant="ghost" asChild size="sm" className="gap-1">
                    <Link href="/products">
                      <ChevronLeft className="h-4 w-4" />
                      Continue Shopping
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={clearCart} size="sm">
                    Clear Cart
                  </Button>
                </div>
              </div>
            ) : (
              <MobileCartEmptyState type="cart" />
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-4">
            {savedItems.length > 0 ? (
              <div className="space-y-4">
                {savedItems.map((item, index) => (
                  <div key={item.product.id} className="space-y-2">
                    <MobileCartItem
                      item={item}
                      index={index}
                      imageLoaded={imageLoaded}
                      onImageLoad={handleImageLoad}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveSaved}
                      showSaveForLater={false}
                    />
                    <div className="flex justify-end pb-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => handleMoveToCart(item)}
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <MobileCartEmptyState
                type="saved"
                onViewCart={() => setActiveTab("cart")}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <MobileCartAnalytics
              analytics={mockAnalytics}
              progressToFreeShipping={progressToFreeShipping}
            />
          </TabsContent>
        </Tabs>
      </MobileSection>

      {/* Order Summary - Only show if cart has items */}
      {items.length > 0 && (
        <MobileSection>
          <MobileCartOrderSummary
            subtotal={subtotal}
            discount={discount}
            shipping={shipping}
            total={total}
            onApplyPromo={handleApplyPromo}
          />
        </MobileSection>
      )}
    </MobilePageLayout>
  )
}


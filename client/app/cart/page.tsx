"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2, Heart, BarChart2, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MobileCartPage } from "@/components/pages/cart/mobile-cart-page"
import { useMobile } from "@/hooks/use-mobile"

// Mock analytics data - replace with actual data from your backend
const mockAnalytics = {
  totalSpent: 1250.75,
  averageOrderValue: 125.08,
  itemsPurchased: 15,
  savings: 187.50,
  freeShippingThreshold: 100,
  currentSpend: 75.25,
}

export default function CartPage() {
  const isMobile = useMobile()
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [savedItems, setSavedItems] = useState<typeof items>([])
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

  const handleApplyPromo = async () => {
    if (!promoCode) return

    setIsApplyingPromo(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful promo code
    if (promoCode.toLowerCase() === "discount20") {
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

    setIsApplyingPromo(false)
  }

  const handleSaveForLater = (item: typeof items[0]) => {
    setSavedItems((prev) => [...prev, item])
    removeItem(item.product.id)
    toast({
      title: "Saved for later",
      description: `${item.product.name} has been moved to your saved items.`,
    })
  }

  const handleMoveToCart = (item: typeof savedItems[0]) => {
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

  const shipping = subtotal > mockAnalytics.freeShippingThreshold ? 0 : 10
  const total = subtotal - discount + shipping
  const progressToFreeShipping = (subtotal / mockAnalytics.freeShippingThreshold) * 100

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileCartPage />
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Every item in your cart is backed by our lifetime repair guarantee and white-glove delivery service.
                </p>
              </div>
              <TabsList>
                <TabsTrigger value="cart">Cart ({items.length})</TabsTrigger>
                <TabsTrigger value="saved">Saved ({savedItems.length})</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="cart">
              {items.length > 0 ? (
                <div className="space-y-6">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row gap-4 border-b pb-6"
                    >
                      <Link href={`/products/${item.product.id}`} className="shrink-0">
                        <div className="relative aspect-square w-24 h-24 rounded-md border overflow-hidden bg-muted/50">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: imageLoaded[item.product.id] ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full"
                          >
                            <Image
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              loading="lazy"
                              sizes="96px"
                              onLoad={() => setImageLoaded(prev => ({ ...prev, [item.product.id]: true }))}
                              onError={() => setImageLoaded(prev => ({ ...prev, [item.product.id]: true }))}
                            />
                          </motion.div>
                        </div>
                      </Link>

                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.product.colors && <span>Color: {item.product.colors[0]}</span>}
                              {item.product.sizes && item.product.colors && <span> / </span>}
                              {item.product.sizes && <span>Size: {item.product.sizes[0]}</span>}
                            </div>
                          </div>

                          <div className="font-medium">
                            {item.product.sale ? (
                              <div className="flex items-center gap-2">
                                <span className="text-destructive">
                                  ${((item.product.price * (100 - item.product.discount!)) / 100).toFixed(2)}
                                </span>
                                <span className="text-muted-foreground line-through text-sm">
                                  ${item.product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span>${item.product.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8"
                              onClick={() => handleSaveForLater(item)}
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Save for later
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <div className="flex justify-between items-center mt-8">
                    <Button variant="ghost" asChild className="gap-1">
                      <Link href="/products">
                        <ChevronLeft className="h-4 w-4" />
                        Continue Shopping
                      </Link>
                    </Button>

                    <Button variant="outline" onClick={clearCart}>
                      Clear Cart
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full py-12 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
                    <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Looks like you haven't added anything to your cart yet. Explore our products and find something you'll
                    love.
                  </p>

                  <Button asChild size="lg">
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              {savedItems.length > 0 ? (
                <div className="space-y-6">
                  {savedItems.map((item, index) => (
                    <motion.div
                      key={item.product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row gap-4 border-b pb-6"
                    >
                      <Link href={`/products/${item.product.id}`} className="shrink-0">
                        <div className="relative aspect-square w-24 h-24 rounded-md border overflow-hidden bg-muted/50">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: imageLoaded[item.product.id] ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full"
                          >
                            <Image
                              src={item.product.images[0] || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              loading="lazy"
                              sizes="96px"
                              onLoad={() => setImageLoaded(prev => ({ ...prev, [item.product.id]: true }))}
                              onError={() => setImageLoaded(prev => ({ ...prev, [item.product.id]: true }))}
                            />
                          </motion.div>
                        </div>
                      </Link>

                      <div className="flex-1 flex flex-col">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <Link
                              href={`/products/${item.product.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.product.colors && <span>Color: {item.product.colors[0]}</span>}
                              {item.product.sizes && item.product.colors && <span> / </span>}
                              {item.product.sizes && <span>Size: {item.product.sizes[0]}</span>}
                            </div>
                          </div>

                          <div className="font-medium">
                            {item.product.sale ? (
                              <div className="flex items-center gap-2">
                                <span className="text-destructive">
                                  ${((item.product.price * (100 - item.product.discount!)) / 100).toFixed(2)}
                                </span>
                                <span className="text-muted-foreground line-through text-sm">
                                  ${item.product.price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span>${item.product.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= 10}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8"
                              onClick={() => handleMoveToCart(item)}
                            >
                              <ShoppingBag className="h-4 w-4 mr-1" />
                              Move to Cart
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleRemoveSaved(item.product.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="w-full py-12 text-center">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-muted mb-6">
                    <Clock className="h-12 w-12 text-muted-foreground" />
                  </div>

                  <h2 className="text-2xl font-bold mb-2">No saved items</h2>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Items you save for later will appear here. You can save items from your cart to purchase them later.
                  </p>

                  <Button asChild size="lg" onClick={() => setActiveTab("cart")}>
                    View Cart
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="luxury-card p-6 rounded-xl">
                    <h3 className="text-lg font-medium mb-4">Shopping Stats</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Total Spent</span>
                          <span className="font-medium">${mockAnalytics.totalSpent.toFixed(2)}</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Average Order Value</span>
                          <span className="font-medium">${mockAnalytics.averageOrderValue.toFixed(2)}</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Items Purchased</span>
                          <span className="font-medium">{mockAnalytics.itemsPurchased}</span>
                        </div>
                        <Progress value={80} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Total Savings</span>
                          <span className="font-medium text-destructive">${mockAnalytics.savings.toFixed(2)}</span>
                        </div>
                        <Progress value={90} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="luxury-card p-6 rounded-xl">
                    <h3 className="text-lg font-medium mb-4">Free Shipping Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Current Spend</span>
                          <span className="font-medium">${mockAnalytics.currentSpend.toFixed(2)}</span>
                        </div>
                        <Progress value={progressToFreeShipping} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                          Add ${(mockAnalytics.freeShippingThreshold - mockAnalytics.currentSpend).toFixed(2)} more to
                          get free shipping
                        </p>
                      </div>
                      <div className="pt-4">
                        <h4 className="text-sm font-medium mb-2">Quick Add Items</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm" className="w-full">
                            Gift Card
                          </Button>
                          <Button variant="outline" size="sm" className="w-full">
                            Accessories
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <div className="w-full md:w-96 shrink-0">
            <div className="luxury-card p-6 rounded-xl sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-destructive">
                    <span>Discount</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>

                <Separator className="my-3" />

                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="Promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} />
                  <Button variant="outline" onClick={handleApplyPromo} disabled={isApplyingPromo || !promoCode}>
                    Apply
                  </Button>
                </div>

                <Button asChild className="w-full">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <div className="text-xs text-muted-foreground text-center">Taxes calculated at checkout</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

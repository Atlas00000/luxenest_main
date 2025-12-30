"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart"
import { useAuth } from "@/components/auth-provider"
import { createOrder, type ShippingAddress } from "@/lib/api/orders"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ApiClientError } from "@/lib/api/client"
import { MobileCheckoutPage } from "@/components/pages/checkout/mobile-checkout-page"
import { useMobile } from "@/hooks/use-mobile"

const paymentMethods = [
  {
    id: "credit-card",
    name: "Credit Card",
    icon: CreditCard,
    description: "Pay with your credit card",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: CreditCard,
    description: "Pay with your PayPal account",
  },
]

export default function CheckoutPage() {
  const isMobile = useMobile()
  const router = useRouter()
  const { items, subtotal, isLoading: cartLoading } = useCart()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    phone: "",
  })

  // Calculate shipping and tax (matching backend logic)
  const FREE_SHIPPING_THRESHOLD = 100
  const STANDARD_SHIPPING_COST = 10
  const TAX_RATE = 0.08

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_COST
  const tax = (subtotal + shipping) * TAX_RATE
  const total = subtotal + shipping + tax

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !cartLoading) {
      toast({
        title: "Please login",
        description: "You need to be logged in to checkout.",
        variant: "destructive",
      })
      router.push("/login?redirect=/checkout")
    }
  }, [isAuthenticated, cartLoading, router, toast])

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && items.length === 0 && isAuthenticated) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      router.push("/cart")
    }
  }, [items.length, cartLoading, isAuthenticated, router, toast])

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!shippingAddress.fullName.trim()) {
      toast({
        title: "Full name required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return false
    }

    if (!shippingAddress.address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your address.",
        variant: "destructive",
      })
      return false
    }

    if (!shippingAddress.city.trim()) {
      toast({
        title: "City required",
        description: "Please enter your city.",
        variant: "destructive",
      })
      return false
    }

    if (!shippingAddress.state.trim()) {
      toast({
        title: "State required",
        description: "Please enter your state.",
        variant: "destructive",
      })
      return false
    }

    if (!shippingAddress.zipCode.trim()) {
      toast({
        title: "Zip code required",
        description: "Please enter your zip code.",
        variant: "destructive",
      })
      return false
    }

    if (!shippingAddress.country.trim()) {
      toast({
        title: "Country required",
        description: "Please enter your country.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      return
    }

    setIsProcessing(true)

    try {
      const order = await createOrder({
        shippingAddress,
        paymentMethod,
      })

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })

      router.push(`/orders/${order.id}`)
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to place order. Please try again."
      
      toast({
        title: "Order failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return null // Will redirect via useEffect
  }

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileCheckoutPage />
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
            <p className="text-muted-foreground mb-2">Complete your purchase</p>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Your order includes free white-glove delivery on orders over $100, our lifetime repair guarantee, 
              and 30-day hassle-free returns. All payments are processed securely through encrypted channels.
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Shipping Address */}
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                <CardDescription>Enter your shipping information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={shippingAddress.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    placeholder="123 Main Street"
                    value={shippingAddress.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={shippingAddress.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={shippingAddress.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      placeholder="United States"
                      value={shippingAddress.country}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={shippingAddress.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Select your preferred payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center space-x-4 rounded-lg border p-4 ${
                        paymentMethod === method.id ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-muted-foreground">{method.description}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <Card className="luxury-card sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>{items.length} items in your order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {items.map((item) => {
                  const productPrice = item.product.sale && item.product.discount
                    ? item.product.price * (1 - item.product.discount / 100)
                    : item.product.price
                  
                  return (
                    <div key={item.product.id} className="flex gap-4">
                      <div className="relative aspect-square w-20 h-20 rounded-md border overflow-hidden">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ${productPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="font-medium">
                        ${(productPrice * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/cart"
import { useAuth } from "@/components/auth-provider"
import { createOrder, type ShippingAddress } from "@/lib/api/orders"
import { ApiClientError } from "@/lib/api/client"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileCheckoutShippingForm } from "./mobile-checkout-shipping-form"
import { MobileCheckoutPaymentMethods } from "./mobile-checkout-payment-methods"
import { MobileCheckoutOrderSummary } from "./mobile-checkout-order-summary"

export function MobileCheckoutPage() {
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
      <MobilePageLayout>
        <MobilePageContent>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MobilePageContent>
      </MobilePageLayout>
    )
  }

  if (items.length === 0) {
    return null // Will redirect via useEffect
  }

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="Checkout"
        subtitle="Complete your purchase"
        eyebrow="Order"
      />

      <MobileSection>
        <p className="text-xs text-muted-foreground mb-4">
          Your order includes free white-glove delivery on orders over $100, our lifetime repair
          guarantee, and 30-day hassle-free returns. All payments are processed securely through
          encrypted channels.
        </p>
      </MobileSection>

      {/* Order Summary - Show first on mobile */}
      <MobileSection>
        <MobileCheckoutOrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </MobileSection>

      <form onSubmit={handleSubmitOrder}>
        <MobileSection>
          <div className="luxury-card p-4 rounded-xl border">
            <h3 className="text-base font-semibold mb-2">Shipping Address</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your shipping information
            </p>
            <MobileCheckoutShippingForm
              shippingAddress={shippingAddress}
              onInputChange={handleInputChange}
            />
          </div>
        </MobileSection>

        <MobileSection>
          <div className="luxury-card p-4 rounded-xl border">
            <h3 className="text-base font-semibold mb-2">Payment Method</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Select your preferred payment method
            </p>
            <MobileCheckoutPaymentMethods
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
            />
          </div>
        </MobileSection>

        <MobileSection>
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
        </MobileSection>
      </form>
    </MobilePageLayout>
  )
}


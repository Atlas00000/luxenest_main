"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

interface MobileCartOrderSummaryProps {
  subtotal: number
  discount: number
  shipping: number
  total: number
  onApplyPromo: (code: string) => Promise<void>
}

export function MobileCartOrderSummary({
  subtotal,
  discount,
  shipping,
  total,
  onApplyPromo,
}: MobileCartOrderSummaryProps) {
  const { toast } = useToast()
  const [promoCode, setPromoCode] = useState("")
  const [isApplyingPromo, setIsApplyingPromo] = useState(false)

  const handleApplyPromo = async () => {
    if (!promoCode) return
    setIsApplyingPromo(true)
    try {
      await onApplyPromo(promoCode)
    } finally {
      setIsApplyingPromo(false)
    }
  }

  return (
    <div className="luxury-card p-4 rounded-xl border">
      <h2 className="text-lg font-bold mb-4">Order Summary</h2>

      <div className="space-y-2 text-sm mb-4">
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

        <Separator className="my-2" />

        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Promo code"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="text-sm"
          />
          <Button
            variant="outline"
            onClick={handleApplyPromo}
            disabled={isApplyingPromo || !promoCode}
            size="sm"
          >
            {isApplyingPromo ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>

        <Button asChild className="w-full">
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Taxes calculated at checkout
        </div>
      </div>
    </div>
  )
}


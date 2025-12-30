"use client"

import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import type { CartItem } from "@/lib/cart"

interface MobileCheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export function MobileCheckoutOrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: MobileCheckoutOrderSummaryProps) {
  return (
    <div className="luxury-card p-4 rounded-xl border">
      <h2 className="text-lg font-bold mb-2">Order Summary</h2>
      <p className="text-xs text-muted-foreground mb-4">{items.length} items in your order</p>

      <div className="space-y-3 mb-4">
        {items.map((item) => {
          const productPrice = item.product.sale && item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price

          return (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative aspect-square w-16 h-16 rounded-md border overflow-hidden shrink-0">
                <Image
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm line-clamp-1">{item.product.name}</div>
                <div className="text-xs text-muted-foreground">
                  Qty: {item.quantity} × ${productPrice.toFixed(2)}
                </div>
              </div>
              <div className="font-medium text-sm">
                ${(productPrice * item.quantity).toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>

      <Separator className="my-3" />

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
    </div>
  )
}


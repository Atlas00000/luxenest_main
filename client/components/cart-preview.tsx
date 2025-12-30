"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart"
import { Separator } from "@/components/ui/separator"

export function CartPreview() {
  const { items, subtotal } = useCart()

  return (
    <motion.div
      className="absolute right-0 mt-2 w-80 bg-background border rounded-lg shadow-lg z-50 overflow-hidden"
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Your Cart</h3>
          <span className="text-sm text-muted-foreground">{items.length} items</span>
        </div>

        <div className="max-h-60 overflow-auto space-y-3 pr-1">
          {items.slice(0, 3).map((item) => (
            <div key={item.product.id} className="flex gap-3">
              <div className="relative h-16 w-16 rounded border overflow-hidden shrink-0">
                <Image
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium truncate">{item.product.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                  <span className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}

          {items.length > 3 && (
            <div className="text-center text-sm text-muted-foreground py-1">+{items.length - 3} more items</div>
          )}
        </div>

        {items.length > 0 ? (
          <>
            <Separator className="my-3" />

            <div className="flex justify-between items-center mb-4">
              <span className="font-medium">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href="/cart">View Cart</Link>
              </Button>
              <Button asChild size="sm" className="flex-1">
                <Link href="/checkout">Checkout</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

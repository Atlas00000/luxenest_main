"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Order } from "@/lib/api/orders"

interface MobileOrderDetailItemsProps {
  items: Order["items"]
}

export function MobileOrderDetailItems({ items }: MobileOrderDetailItemsProps) {
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})

  return (
    <div className="luxury-card p-4 rounded-xl border">
      <h3 className="text-base font-semibold mb-2">Order Items</h3>
      <p className="text-xs text-muted-foreground mb-4">{items.length} items</p>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative aspect-square w-16 h-16 rounded-md border overflow-hidden bg-muted/50 shrink-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded[item.id] ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <Image
                  src={item.product.images[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="64px"
                  onLoad={() => setImageLoaded((prev) => ({ ...prev, [item.id]: true }))}
                  onError={() => setImageLoaded((prev) => ({ ...prev, [item.id]: true }))}
                />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm line-clamp-2">{item.product.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
              </div>
            </div>
            <div className="font-medium text-sm">
              ${(Number(item.price) * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


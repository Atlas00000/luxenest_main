"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/api/orders"
import { cn } from "@/lib/utils"

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: "⏱",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  PROCESSING: {
    label: "Processing",
    icon: "📦",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  SHIPPED: {
    label: "Shipped",
    icon: "🚚",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "✓",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "✕",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
}

interface MobileOrderCardProps {
  order: Order
  index: number
}

export function MobileOrderCard({ order, index }: MobileOrderCardProps) {
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})
  const status = statusConfig[order.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="luxury-card p-4 rounded-xl border"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h3>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge
          variant="outline"
          className={cn("text-xs px-2 py-1", status.bgColor, status.color)}
        >
          <span className="mr-1">{status.icon}</span>
          {status.label}
        </Badge>
      </div>

      {/* Order Items Preview */}
      <div className="space-y-2 mb-3">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex gap-2">
            <div className="relative aspect-square w-12 h-12 rounded border overflow-hidden bg-muted/50 shrink-0">
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
                  sizes="48px"
                  onLoad={() => setImageLoaded((prev) => ({ ...prev, [item.id]: true }))}
                  onError={() => setImageLoaded((prev) => ({ ...prev, [item.id]: true }))}
                />
              </motion.div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs truncate">{item.product.name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
              </p>
            </div>
          </div>
        ))}
        {order.items.length > 2 && (
          <p className="text-xs text-muted-foreground text-center">
            +{order.items.length - 2} more items
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-base font-semibold">${Number(order.total).toFixed(2)}</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orders/${order.id}`}>
            Details
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}


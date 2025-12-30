"use client"

import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/api/orders"
import { cn } from "@/lib/utils"

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: "⏱",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  PROCESSING: {
    label: "Processing",
    icon: "📦",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: "🚚",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: "✓",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "✕",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
}

interface MobileOrderDetailHeaderProps {
  order: Order
}

export function MobileOrderDetailHeader({ order }: MobileOrderDetailHeaderProps) {
  const status = statusConfig[order.status]

  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Order Confirmation</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn("text-xs px-3 py-1.5", status.bgColor, status.borderColor, status.color)}
      >
        <span className="mr-1">{status.icon}</span>
        {status.label}
      </Badge>
    </div>
  )
}


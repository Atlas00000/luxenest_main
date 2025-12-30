"use client"

import { Separator } from "@/components/ui/separator"
import type { Order } from "@/lib/api/orders"

interface MobileOrderDetailSummaryProps {
  order: Order
}

export function MobileOrderDetailSummary({ order }: MobileOrderDetailSummaryProps) {
  return (
    <div className="luxury-card p-4 rounded-xl border">
      <h3 className="text-base font-semibold mb-2">Order Summary</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Order placed on {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${Number(order.subtotal).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>${Number(order.tax).toFixed(2)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-base font-medium">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm mb-2">Shipping Address</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
          </div>
        </div>

        <Separator className="my-3" />

        <div>
          <h4 className="font-medium text-sm mb-2">Payment Method</h4>
          <p className="text-xs text-muted-foreground capitalize">
            {order.paymentMethod.replace("-", " ")}
          </p>
        </div>
      </div>
    </div>
  )
}


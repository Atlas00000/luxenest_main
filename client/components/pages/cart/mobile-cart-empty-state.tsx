"use client"

import Link from "next/link"
import { ShoppingBag, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileCartEmptyStateProps {
  type: "cart" | "saved"
  onViewCart?: () => void
}

export function MobileCartEmptyState({ type, onViewCart }: MobileCartEmptyStateProps) {
  if (type === "saved") {
    return (
      <div className="w-full py-12 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <Clock className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">No saved items</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
          Items you save for later will appear here. You can save items from your cart to purchase
          them later.
        </p>
        {onViewCart && (
          <Button asChild size="lg" onClick={onViewCart}>
            View Cart
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full py-12 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
        Looks like you haven't added anything to your cart yet. Explore our products and find
        something you'll love.
      </p>
      <Button asChild size="lg">
        <Link href="/products">Start Shopping</Link>
      </Button>
    </div>
  )
}


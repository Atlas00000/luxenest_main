"use client"

import Link from "next/link"
import { Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileOrdersEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        <Package className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No orders yet</h3>
      <p className="text-muted-foreground mb-6 text-sm">
        Start shopping to see your orders here.
      </p>
      <Button asChild size="lg">
        <Link href="/products">Browse Products</Link>
      </Button>
    </div>
  )
}


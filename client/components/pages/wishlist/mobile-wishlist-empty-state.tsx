"use client"

import Link from "next/link"
import { Heart, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileWishlistEmptyState() {
  return (
    <div className="text-center py-12">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
        <Heart className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Start adding items to your wishlist to see them here
      </p>
      <Button asChild size="lg">
        <Link href="/products">
          Browse Products
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}


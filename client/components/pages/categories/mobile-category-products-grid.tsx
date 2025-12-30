"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/api/products"

interface MobileCategoryProductsGridProps {
  products: Product[]
  isLoading: boolean
}

export function MobileCategoryProductsGrid({
  products,
  isLoading,
}: MobileCategoryProductsGridProps) {
  const [productImagesLoaded, setProductImagesLoaded] = useState<Record<string, boolean>>({})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 luxury-card rounded-xl">
        <h3 className="text-lg font-medium mb-2">No products found</h3>
        <p className="text-muted-foreground mb-4 text-sm">
          This category doesn't have any products yet.
        </p>
        <Button asChild size="sm">
          <Link href="/products">Browse All Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-2">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="group relative luxury-card overflow-hidden theme-transition"
        >
          <Link href={`/products/${product.id}`} className="block">
            <div className="relative aspect-square overflow-hidden rounded-lg mb-3 bg-muted/50">
              <motion.div
                key={`img-${product.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: productImagesLoaded[product.id] ? 1 : 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  onLoad={() =>
                    setProductImagesLoaded((prev) => ({ ...prev, [product.id]: true }))
                  }
                  onError={() =>
                    setProductImagesLoaded((prev) => ({ ...prev, [product.id]: true }))
                  }
                />
              </motion.div>
              {product.onSale && (
                <Badge className="absolute top-2 right-2" variant="destructive" size="sm">
                  Sale
                </Badge>
              )}
              {product.isNew && (
                <Badge className="absolute top-2 left-2" variant="secondary" size="sm">
                  New
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold">${Number(product.price).toFixed(2)}</span>
                {product.discount && (
                  <span className="text-xs text-muted-foreground line-through">
                    ${(Number(product.price) / (1 - product.discount / 100)).toFixed(2)}
                  </span>
                )}
              </div>
              {product.rating > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>★</span>
                  <span>{product.rating.toFixed(1)}</span>
                  <span>({product.reviewsCount})</span>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}


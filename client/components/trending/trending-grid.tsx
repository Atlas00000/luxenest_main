"use client"

import { motion } from "framer-motion"
import { TrendingProductCard } from "./trending-product-card"
import type { Product } from "@/lib/types"

interface TrendingGridProps {
  products: Product[]
}

export function TrendingGrid({ products }: TrendingGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No trending products found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product, index) => (
        <TrendingProductCard
          key={product.id}
          product={product}
          index={index}
          rank={index + 1}
        />
      ))}
    </div>
  )
}


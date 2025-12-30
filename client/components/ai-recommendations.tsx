"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUserRecommendations } from "@/lib/api/recommendations"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/api/products"
import { SectionShell } from "@/components/section-shell"

export function AiRecommendations() {
  const { addItem } = useCart()
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const products = await getUserRecommendations(4)
        setRecommendedProducts(products)
      } catch (error: any) {
        // Silently handle 401 (not logged in) - this is expected behavior
        if (error?.status !== 401) {
          console.error("Failed to load recommendations:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadRecommendations()
  }, [])

  if (isLoading) {
    return (
      <SectionShell
        eyebrow="For You"
        title="Personalized For You"
        subtitle="Curated recommendations based on your style preferences."
      >
        <div className="text-center py-8">Loading recommendations...</div>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      eyebrow="For You"
      title="Personalized For You"
      subtitle="Our AI-powered recommendation engine analyzes your browsing patterns, purchase history, and style preferences to suggest pieces that perfectly match your aesthetic. Over 40% of our customers discover their favorite items through these personalized recommendations."
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-6 w-6 text-primary" />
        <p className="text-sm text-muted-foreground">
          Recommendations powered by machine learning and your shopping behavior.
        </p>
      </div>

      {recommendedProducts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No recommendations available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              className="group relative overflow-hidden rounded-xl luxury-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className={cn(
                      "object-cover transition-transform duration-500",
                      hoveredIndex === index && "scale-110",
                    )}
                  />
                  {product.onSale && product.discount && (
                    <Badge variant="destructive" className="absolute top-3 left-3">
                      Sale {product.discount}%
                    </Badge>
                  )}
                  {product.isNew && <Badge className="absolute top-3 left-3">New Arrival</Badge>}
                  <Badge variant="secondary" className="absolute top-3 right-3 bg-background/80">
                    AI Recommended
                  </Badge>
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviewsCount})</span>
                </div>

                <Link href={`/products/${product.id}`} className="block">
                  <h3 className="font-medium text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    {product.onSale && product.discount ? (
                      <div className="flex items-center gap-2">
                        <span className="text-destructive">
                          ${((Number(product.price) * (100 - product.discount)) / 100).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground line-through text-sm">
                          ${Number(product.price).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span>${Number(product.price).toFixed(2)}</span>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault()
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        images: product.images,
                      })
                    }}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </SectionShell>
  )
}

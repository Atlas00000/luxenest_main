"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getTrendingProducts } from "@/lib/api/recommendations"
import type { Product as APIProduct } from "@/lib/api/products"
import type { Product } from "@/lib/types"
import { SectionShell } from "@/components/section-shell"
import { TrendingGrid } from "./trending/trending-grid"
import { Loader2 } from "lucide-react"

export function TrendingSection() {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const apiProducts = await getTrendingProducts(4)
        // Convert API products to component format
        const convertedProducts: Product[] = apiProducts.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          images: product.images,
          category: product.category?.slug || "",
          tags: product.tags,
          rating: product.rating,
          reviews: product.reviewsCount,
          stock: product.stock,
          featured: product.featured,
          new: product.isNew,
          sale: product.onSale,
          discount: product.discount || undefined,
          sustainabilityScore: product.sustainabilityScore || undefined,
          colors: product.colors,
          sizes: product.sizes,
          materials: product.materials,
        }))
        setTrendingProducts(convertedProducts)
      } catch (error) {
        console.error("Failed to load trending products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTrending()
  }, [])

  if (isLoading) {
    return (
      <SectionShell
        eyebrow="Just In"
        title="Trending Now"
        subtitle="See what's capturing attention this season. These products combine exceptional design with proven popularity—chosen by our community of design enthusiasts and interior professionals."
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      eyebrow="Just In"
      title="Trending Now"
      subtitle="See what's capturing attention this season. These products combine exceptional design with proven popularity—chosen by our community of design enthusiasts and interior professionals."
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className="space-y-8"
      >
        {/* Header with Trending Indicator */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
                Trending Now
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
              </h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Top picks this season
              </p>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <Button
              variant="outline"
              asChild
              className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 group"
            >
              <Link href="/new-arrivals" className="flex items-center gap-2">
                <span>View all new arrivals</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </div>

        {/* Products Grid */}
        <TrendingGrid products={trendingProducts} />

        {/* Mobile CTA */}
        <div className="text-center md:hidden pt-4">
          <Button
            asChild
            className="rounded-full"
          >
            <Link href="/new-arrivals" className="group flex items-center gap-2">
              <span>View all new arrivals</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </motion.div>
    </SectionShell>
  )
}

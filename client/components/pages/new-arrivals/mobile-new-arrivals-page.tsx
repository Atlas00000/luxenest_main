"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/lib/api/products"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { ProductsGrid } from "@/components/products/products-grid"
import { MobileNewArrivalsControls } from "./mobile-new-arrivals-controls"

export function MobileNewArrivalsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState("newest")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts({ isNew: true })
        setProducts(data.products)
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (!product.isNew) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
        case "price-low":
          return Number(a.price) - Number(b.price)
        case "price-high":
          return Number(b.price) - Number(a.price)
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <MobilePageLayout>
        <MobilePageContent>
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MobilePageContent>
      </MobilePageLayout>
    )
  }

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="New Arrivals"
        subtitle="Be the first to discover our latest curated pieces"
        eyebrow="Latest"
      />

      <MobileSection>
        <MobileNewArrivalsControls sortBy={sortBy} onSortChange={setSortBy} />
      </MobileSection>

      <MobilePageContent>
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <h2 className="text-xl font-semibold mb-2">No new arrivals found</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Try adjusting your filters to see more products
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ProductsGrid products={filteredProducts} />
          </motion.div>
        )}
      </MobilePageContent>

      <MobileSection>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 group"
            >
              <Link href="/products">
                View All Products
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </MobileSection>
    </MobilePageLayout>
  )
}


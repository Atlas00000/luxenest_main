"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2, Percent, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/lib/api/products"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { ProductsGrid } from "@/components/products/products-grid"
import { MobileSalesControls } from "./mobile-sales-controls"

type SortOption = "discount-desc" | "price-asc" | "price-desc" | "popular" | "ending-soon"

export function MobileSalesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("discount-desc")

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts({ onSale: true })
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
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesSearch
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "discount-desc":
            return (b.discount || 0) - (a.discount || 0)
          case "price-asc":
            return (
              Number(a.price) * (1 - ((a.discount || 0) / 100)) -
              Number(b.price) * (1 - ((b.discount || 0) / 100))
            )
          case "price-desc":
            return (
              Number(b.price) * (1 - ((b.discount || 0) / 100)) -
              Number(a.price) * (1 - ((a.discount || 0) / 100))
            )
          case "popular":
            return b.reviewsCount - a.reviewsCount
          default:
            return 0
        }
      })
  }, [products, searchQuery, sortBy])

  const clearFilters = () => {
    setSearchQuery("")
  }

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
        title="Flash Sales"
        subtitle="Limited-time savings on select pieces from our collection"
        eyebrow="Special Offers"
      />

      <MobileSection>
        <MobileSalesControls
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
        />
      </MobileSection>

      <MobilePageContent>
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-lg font-medium mb-2">No sales found</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-full">
              Clear all filters
            </Button>
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


"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { ChevronRight, Filter, Sparkles, Loader2 } from "lucide-react"
import { ProductsGrid } from "@/components/products/products-grid"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MobileNewArrivalsPage } from "@/components/pages/new-arrivals/mobile-new-arrivals-page"
import { useMobile } from "@/hooks/use-mobile"

export default function NewArrivalsPage() {
  const isMobile = useMobile()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    categories: [] as string[],
    dateRange: "7d",
    sort: "newest",
    onlyTrending: false,
  })

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


  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort: value }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      dateRange: "7d",
      sort: "newest",
      onlyTrending: false,
    })
  }

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (!product.isNew) return false
      return true
    })
    .sort((a, b) => {
      switch (filters.sort) {
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
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileNewArrivalsPage />
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Latest</span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
          New Arrivals
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
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          Be the first to discover our latest curated pieces from master artisans worldwide. Our design team 
          adds new products weekly, each meeting our rigorous standards for quality, sustainability, and timeless design.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
      >
        <div className="flex items-center gap-2">
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px] rounded-full border-primary/30 hover:border-primary">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <h2 className="text-2xl font-semibold mb-2">No new arrivals found</h2>
          <p className="text-muted-foreground mb-8">Try adjusting your filters to see more products</p>
          <Button onClick={clearFilters} className="rounded-full">Clear Filters</Button>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-16 text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 group"
          >
            <Link href="/products">
              View All Products
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
} 
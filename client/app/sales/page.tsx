"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { getProducts } from "@/lib/api/products"
import type { Product } from "@/lib/api/products"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ChevronRight, Search, Sparkles, Loader2, Percent } from "lucide-react"
import { ProductsGrid } from "@/components/products/products-grid"
import { MobileSalesPage } from "@/components/pages/sales/mobile-sales-page"
import { useMobile } from "@/hooks/use-mobile"

type SortOption = "discount-desc" | "price-asc" | "price-desc" | "popular" | "ending-soon"

export default function SalesPage() {
  const isMobile = useMobile()
  const { toast } = useToast()
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
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileSalesPage />
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
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Special Offers</span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
          Flash Sales
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
            <Percent className="h-6 w-6 text-primary" />
          </motion.div>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
          Limited-time savings on select pieces from our collection. These exclusive offers feature the same 
          exceptional quality and lifetime warranty as all LuxeNest products—now at special prices for a limited time.
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full border-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] rounded-full border-primary/30 hover:border-primary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discount-desc">Highest Discount</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <ProductsGrid products={filteredProducts} />
      </motion.div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <h3 className="text-lg font-medium mb-2">No sales found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button variant="outline" onClick={clearFilters} className="rounded-full">
            Clear all filters
          </Button>
        </motion.div>
      )}

      {/* View All Products Button */}
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
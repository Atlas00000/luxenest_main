"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { getCategories } from "@/lib/api/categories"
import type { Category } from "@/lib/api/categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Search, SlidersHorizontal, X, Loader2, Sparkles } from "lucide-react"
import { CategoriesPageGrid } from "@/components/categories-page/categories-page-grid"
import { MobileCategoriesPage } from "@/components/pages/categories/mobile-categories-page"
import { useMobile } from "@/hooks/use-mobile"

type SortOption = "name-asc" | "name-desc" | "popular" | "newest"

export default function CategoriesPage() {
  const isMobile = useMobile()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("name-asc")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    return categories
      .filter((category) => {
        const matchesSearch =
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description &&
            category.description.toLowerCase().includes(searchQuery.toLowerCase()))
        return matchesSearch
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name)
          case "name-desc":
            return b.name.localeCompare(a.name)
          case "popular":
            return (b.popularity || 0) - (a.popularity || 0)
          case "newest":
            return (
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
            )
          default:
            return 0
        }
      })
  }, [categories, searchQuery, selectedFilters, sortBy])

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    )
  }

  const clearFilters = () => {
    setSelectedFilters([])
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
    return <MobileCategoriesPage />
  }

  return (
    <div className="container mx-auto px-4 py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
          <span className="text-sm text-primary font-medium uppercase tracking-wider">
            Categories
          </span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center justify-center gap-2">
          Shop by Category
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
          Our design team travels globally to discover exceptional pieces from master artisans.
          Each category represents years of curation, with products selected for their timeless
          design, superior craftsmanship, and ability to transform your living space into a
          sanctuary of style and comfort.
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
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-full border-primary/30 focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto rounded-full border-primary/30 hover:border-primary hover:bg-primary/10"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {selectedFilters.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedFilters.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Categories</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {selectedFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={clearFilters}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-[180px] rounded-full border-primary/30 hover:border-primary">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer rounded-full"
                onClick={() => toggleFilter(filter)}
              >
                {filter}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 rounded-full"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <CategoriesPageGrid categories={filteredCategories} />
      </motion.div>

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <h3 className="text-lg font-medium mb-2">No categories found</h3>
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

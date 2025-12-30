"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Loader2, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategories, type Category } from "@/lib/api/categories"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { CategoriesPageGrid } from "@/components/categories-page/categories-page-grid"
import { MobileCategoriesSearchControls } from "./mobile-categories-search-controls"
import { MobileCategoriesActiveFilters } from "./mobile-categories-active-filters"

type SortOption = "name-asc" | "name-desc" | "popular" | "newest"

export function MobileCategoriesPage() {
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
        title="Shop by Category"
        subtitle="Discover exceptional pieces from master artisans"
        eyebrow="Categories"
      />

      <MobileSection>
        <MobileCategoriesSearchControls
          searchQuery={searchQuery}
          sortBy={sortBy}
          selectedFiltersCount={selectedFilters.length}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onFilterOpen={setIsFilterOpen}
        />
      </MobileSection>

      {/* Active Filters */}
      <MobileSection spacing="tight">
        <MobileCategoriesActiveFilters
          selectedFilters={selectedFilters}
          onRemoveFilter={toggleFilter}
          onClearAll={clearFilters}
        />
      </MobileSection>

      <MobilePageContent>
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
            <p className="text-muted-foreground mb-4 text-sm">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters} size="sm" className="rounded-full">
              Clear all filters
            </Button>
          </motion.div>
        )}
      </MobilePageContent>

      {/* View All Products Button */}
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
              className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 group"
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


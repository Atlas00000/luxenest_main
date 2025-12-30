"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProducts, type Product } from "@/lib/api/products"
import { getCategories as getCategoriesApi, type Category as CategoryType } from "@/lib/api/categories"
import { useToast } from "@/components/ui/use-toast"
import { ProductsGrid } from "@/components/products/products-grid"
import { ProductsPagination } from "@/components/products/products-pagination"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileProductsControls } from "./mobile-products-controls"
import { MobileProductsActiveFilters } from "./mobile-products-active-filters"

interface MobileProductsPageProps {
  initialProducts?: Product[]
  initialCategories?: CategoryType[]
  initialMeta?: { page: 1; limit: 20; total: 0; totalPages: 1 }
}

export function MobileProductsPage({
  initialProducts = [],
  initialCategories = [],
  initialMeta = { page: 1, limit: 20, total: 0, totalPages: 1 },
}: MobileProductsPageProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [categories, setCategories] = useState<CategoryType[]>(initialCategories)
  const [isLoading, setIsLoading] = useState(initialProducts.length === 0)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState(initialMeta)
  
  const [filters, setFilters] = useState({
    categoryId: undefined as string | undefined,
    priceRange: [0, 1500] as [number, number],
    sort: "createdAt" as "name" | "price" | "rating" | "createdAt" | "reviewsCount",
    sortOrder: "desc" as "asc" | "desc",
    onlyInStock: false,
    onlySustainable: false,
    page: 1,
    limit: 20,
  })

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategoriesApi()
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [])

  // Load products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getProducts({
          categoryId: filters.categoryId,
          minPrice: filters.priceRange[0],
          maxPrice: filters.priceRange[1],
          inStock: filters.onlyInStock,
          sustainable: filters.onlySustainable,
          sortBy: filters.sort,
          sortOrder: filters.sortOrder,
          page: filters.page,
          limit: filters.limit,
        })
        setProducts(result.products)
        setMeta({
          page: result.meta?.page || 1,
          limit: result.meta?.limit || 20,
          total: result.meta?.total || 0,
          totalPages: result.meta?.totalPages || 1,
        })
      } catch (error: any) {
        setError(error.message || "Failed to load products")
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [filters, toast])

  const hasActiveFilters = Boolean(
    filters.categoryId ||
    filters.onlyInStock ||
    filters.onlySustainable ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1500
  )

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      priceRange: [0, 1500],
      sort: "createdAt",
      sortOrder: "desc",
      onlyInStock: false,
      onlySustainable: false,
      page: 1,
      limit: 20,
    })
  }

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
      page: 1,
    }))
  }

  const handlePriceRangeChange = (range: [number, number]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: range,
      page: 1,
    }))
  }

  const handleStockChange = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      onlyInStock: checked,
      page: 1,
    }))
  }

  const handleSustainableChange = (checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      onlySustainable: checked,
      page: 1,
    }))
  }

  const handleSortChange = (value: string) => {
    const sortMap: Record<string, { sort: typeof filters.sort; sortOrder: typeof filters.sortOrder }> = {
      featured: { sort: "createdAt", sortOrder: "desc" },
      newest: { sort: "createdAt", sortOrder: "desc" },
      "price-low": { sort: "price", sortOrder: "asc" },
      "price-high": { sort: "price", sortOrder: "desc" },
      rating: { sort: "rating", sortOrder: "desc" },
    }

    const sortConfig = sortMap[value] || { sort: "createdAt" as const, sortOrder: "desc" as const }
    
    setFilters((prev) => ({
      ...prev,
      ...sortConfig,
      page: 1,
    }))
  }

  const getSortValue = () => {
    if (filters.sort === "price" && filters.sortOrder === "asc") return "price-low"
    if (filters.sort === "price" && filters.sortOrder === "desc") return "price-high"
    if (filters.sort === "rating") return "rating"
    if (filters.sort === "createdAt") return "newest"
    return "featured"
  }

  const activeFiltersCount =
    (filters.categoryId ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0) +
    (filters.onlySustainable ? 1 : 0) +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1500 ? 1 : 0)

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="All Products"
        subtitle={isLoading ? "Loading..." : `Showing ${products.length} of ${meta.total} products`}
        eyebrow="Shop"
      />

      <MobileSection>
        <MobileProductsControls
          filters={filters}
          categories={categories}
          hasActiveFilters={hasActiveFilters}
          activeFiltersCount={activeFiltersCount}
          onCategoryChange={handleCategoryChange}
          onPriceRangeChange={handlePriceRangeChange}
          onStockChange={handleStockChange}
          onSustainableChange={handleSustainableChange}
          onSortChange={handleSortChange}
          getSortValue={getSortValue}
        />
      </MobileSection>

      {/* Active Filters */}
      <MobileSection spacing="tight">
        <MobileProductsActiveFilters
          filters={filters}
          categories={categories}
          onRemoveCategory={() => setFilters((prev) => ({ ...prev, categoryId: undefined }))}
          onRemovePriceRange={() => setFilters((prev) => ({ ...prev, priceRange: [0, 1500] }))}
          onRemoveStock={() => setFilters((prev) => ({ ...prev, onlyInStock: false }))}
          onRemoveSustainable={() => setFilters((prev) => ({ ...prev, onlySustainable: false }))}
          onClearAll={clearFilters}
        />
      </MobileSection>

      <MobilePageContent>
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Error loading products</h3>
            <p className="text-muted-foreground mb-6 text-sm">{error}</p>
            <Button onClick={() => window.location.reload()} size="sm">
              Retry
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <ProductsGrid products={products} />
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-6 text-sm">
              Try adjusting your filters to find what you're looking for.
            </p>
            <Button onClick={clearFilters} size="sm">
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !error && products.length > 0 && (
          <div className="mt-6">
            <ProductsPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          </div>
        )}
      </MobilePageContent>
    </MobilePageLayout>
  )
}


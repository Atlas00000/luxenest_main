"use client"

import { useState, useEffect } from "react"
import { Filter, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { getProducts, getCategories, type Product, type Category } from "@/lib/api/products"
import { getCategories as getCategoriesApi, type Category as CategoryType } from "@/lib/api/categories"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useToast } from "@/components/ui/use-toast"
import { ProductsGrid } from "@/components/products/products-grid"
import { ProductsPagination } from "@/components/products/products-pagination"
import { MobileProductsPage } from "@/components/pages/products/mobile-products-page"

export default function ProductsPage() {
  const { toast } = useToast()
  const isMobile = useMobile()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  
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
        const apiFilters: any = {
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sort,
          sortOrder: filters.sortOrder,
          minPrice: filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined,
          maxPrice: filters.priceRange[1] < 1500 ? filters.priceRange[1] : undefined,
          inStock: filters.onlyInStock || undefined,
          sustainable: filters.onlySustainable || undefined,
        }

        if (filters.categoryId) {
          apiFilters.categoryId = filters.categoryId
        }

        const result = await getProducts(apiFilters)
        setProducts(result.products)
        setMeta(result.meta)
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

  const handleCategoryChange = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? undefined : categoryId,
      page: 1, // Reset to first page
    }))
  }

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number],
      page: 1,
    }))
  }

  const handleSortChange = (value: string) => {
    const sortMap: Record<string, { sortBy: typeof filters.sort; sortOrder: typeof filters.sortOrder }> = {
      featured: { sortBy: "createdAt", sortOrder: "desc" },
      newest: { sortBy: "createdAt", sortOrder: "desc" },
      "price-low": { sortBy: "price", sortOrder: "asc" },
      "price-high": { sortBy: "price", sortOrder: "desc" },
      rating: { sortBy: "rating", sortOrder: "desc" },
    }

    const sortConfig = sortMap[value] || { sortBy: "createdAt" as const, sortOrder: "desc" as const }
    
    setFilters((prev) => ({
      ...prev,
      ...sortConfig,
      page: 1,
    }))
  }

  const handleStockChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, onlyInStock: checked, page: 1 }))
  }

  const handleSustainableChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, onlySustainable: checked, page: 1 }))
  }

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

  const hasActiveFilters =
    filters.categoryId !== undefined ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1500 ||
    filters.onlyInStock ||
    filters.onlySustainable

  // Filter UI component
  const FilterUI = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categoryId === category.id}
                onCheckedChange={() => handleCategoryChange(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Price Range</h4>
          <span className="text-xs text-muted-foreground">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[0, 1500]}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          max={1500}
          step={10}
          onValueChange={handlePriceChange}
          className="py-4"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={filters.onlyInStock}
            onCheckedChange={(checked) => handleStockChange(checked as boolean)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            In Stock Only
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="sustainable"
            checked={filters.onlySustainable}
            onCheckedChange={(checked) => handleSustainableChange(checked as boolean)}
          />
          <Label htmlFor="sustainable" className="text-sm font-normal cursor-pointer">
            Eco-Friendly Only
          </Label>
        </div>
      </div>
    </div>
  )

  const getSortValue = () => {
    if (filters.sort === "price" && filters.sortOrder === "asc") return "price-low"
    if (filters.sort === "price" && filters.sortOrder === "desc") return "price-high"
    if (filters.sort === "rating") return "rating"
    if (filters.sort === "createdAt") return "newest"
    return "featured"
  }

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileProductsPage />
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="luxury-card p-6 rounded-xl">
          <FilterUI />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-0.5 w-8 bg-primary" />
              <span className="text-sm text-primary font-medium uppercase tracking-wider">Shop</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">All Products</h1>
            <p className="text-muted-foreground mb-2">
              {isLoading ? "Loading..." : `Showing ${products.length} of ${meta.total} products`}
            </p>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Every piece in our collection is hand-selected by our design team from master artisans worldwide. 
              Since 2018, LuxeNest has curated over 2,000 exceptional products, each meeting our rigorous standards 
              for quality, sustainability, and timeless design.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-2">
                        {(filters.categoryId ? 1 : 0) +
                          (filters.onlyInStock ? 1 : 0) +
                          (filters.onlySustainable ? 1 : 0) +
                          (filters.priceRange[0] > 0 || filters.priceRange[1] < 1500 ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your product search</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterUI />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
                    <SheetClose asChild>
                      <Button className="w-full">Apply Filters</Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <Select value={getSortValue()} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.categoryId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, categoryId: undefined }))}
                  />
                </Badge>
              )}

              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1500) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  ${filters.priceRange[0]} - ${filters.priceRange[1]}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, priceRange: [0, 1500] }))}
                  />
                </Badge>
              )}

              {filters.onlyInStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  In Stock Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, onlyInStock: false }))}
                  />
                </Badge>
              )}

              {filters.onlySustainable && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Eco-Friendly Only
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setFilters((prev) => ({ ...prev, onlySustainable: false }))}
                  />
                </Badge>
              )}
            </div>
          )}

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
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
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
              <p className="text-muted-foreground mb-6">Try adjusting your filters to find what you're looking for.</p>
              <Button onClick={clearFilters}>Clear all filters</Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && (
            <ProductsPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          )}
        </div>
      </div>
    </div>
  )
}

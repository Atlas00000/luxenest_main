"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { MobileProductsFilter } from "./mobile-products-filter"
import type { Category } from "@/lib/api/categories"

interface MobileProductsControlsProps {
  filters: {
    categoryId?: string
    priceRange: [number, number]
    onlyInStock: boolean
    onlySustainable: boolean
    sort: "name" | "price" | "rating" | "createdAt" | "reviewsCount"
    sortOrder: "asc" | "desc"
  }
  categories: Category[]
  hasActiveFilters: boolean
  activeFiltersCount: number
  onCategoryChange: (categoryId: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onStockChange: (checked: boolean) => void
  onSustainableChange: (checked: boolean) => void
  onSortChange: (value: string) => void
  getSortValue: () => string
}

export function MobileProductsControls({
  filters,
  categories,
  hasActiveFilters,
  activeFiltersCount,
  onCategoryChange,
  onPriceRangeChange,
  onStockChange,
  onSustainableChange,
  onSortChange,
  getSortValue,
}: MobileProductsControlsProps) {
  const handleCategoryChange = (categoryId: string) => {
    onCategoryChange(categoryId)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Mobile Filter Button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Refine your product search</SheetDescription>
          </SheetHeader>
          <div className="mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <MobileProductsFilter
              categories={categories}
              filters={filters}
              onCategoryChange={handleCategoryChange}
              onPriceRangeChange={onPriceRangeChange}
              onStockChange={onStockChange}
              onSustainableChange={onSustainableChange}
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <SheetClose asChild>
              <Button className="w-full">Apply Filters</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      {/* Sort Dropdown */}
      <Select value={getSortValue()} onValueChange={onSortChange}>
        <SelectTrigger className="flex-1">
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
  )
}


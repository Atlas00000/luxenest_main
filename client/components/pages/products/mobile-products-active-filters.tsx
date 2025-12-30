"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Category } from "@/lib/api/categories"

interface MobileProductsActiveFiltersProps {
  filters: {
    categoryId?: string
    priceRange: [number, number]
    onlyInStock: boolean
    onlySustainable: boolean
  }
  categories: Category[]
  onRemoveCategory: () => void
  onRemovePriceRange: () => void
  onRemoveStock: () => void
  onRemoveSustainable: () => void
  onClearAll: () => void
}

export function MobileProductsActiveFilters({
  filters,
  categories,
  onRemoveCategory,
  onRemovePriceRange,
  onRemoveStock,
  onRemoveSustainable,
  onClearAll,
}: MobileProductsActiveFiltersProps) {
  const hasActiveFilters = Boolean(
    filters.categoryId ||
    filters.onlyInStock ||
    filters.onlySustainable ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1500
  )

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap gap-2">
      {filters.categoryId && (
        <Badge variant="secondary" className="flex items-center gap-1">
          {categories.find((c) => c.id === filters.categoryId)?.name}
          <X className="h-3 w-3 cursor-pointer" onClick={onRemoveCategory} />
        </Badge>
      )}

      {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1500) && (
        <Badge variant="secondary" className="flex items-center gap-1">
          ${filters.priceRange[0]} - ${filters.priceRange[1]}
          <X className="h-3 w-3 cursor-pointer" onClick={onRemovePriceRange} />
        </Badge>
      )}

      {filters.onlyInStock && (
        <Badge variant="secondary" className="flex items-center gap-1">
          In Stock
          <X className="h-3 w-3 cursor-pointer" onClick={onRemoveStock} />
        </Badge>
      )}

      {filters.onlySustainable && (
        <Badge variant="secondary" className="flex items-center gap-1">
          Eco-Friendly
          <X className="h-3 w-3 cursor-pointer" onClick={onRemoveSustainable} />
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="h-6 px-2 text-xs">
        Clear all
      </Button>
    </div>
  )
}


"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { Category } from "@/lib/api/categories"

interface MobileProductsFilterProps {
  categories: Category[]
  filters: {
    categoryId?: string
    priceRange: [number, number]
    onlyInStock: boolean
    onlySustainable: boolean
  }
  onCategoryChange: (categoryId: string) => void
  onPriceRangeChange: (range: [number, number]) => void
  onStockChange: (checked: boolean) => void
  onSustainableChange: (checked: boolean) => void
}

export function MobileProductsFilter({
  categories,
  filters,
  onCategoryChange,
  onPriceRangeChange,
  onStockChange,
  onSustainableChange,
}: MobileProductsFilterProps) {
  return (
    <div className="space-y-6">
      {/* Categories Filter */}
      <div>
        <h4 className="text-sm font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.categoryId === category.id}
                onCheckedChange={() => onCategoryChange(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Price Range</h4>
          <span className="text-xs text-muted-foreground">
            ${filters.priceRange[0]} - ${filters.priceRange[1]}
          </span>
        </div>
        <Slider
          value={[filters.priceRange[0], filters.priceRange[1]]}
          max={1500}
          step={10}
          onValueChange={(value) => onPriceRangeChange([value[0], value[1]] as [number, number])}
        />
      </div>

      {/* Options */}
      <div>
        <h4 className="text-sm font-medium mb-3">Options</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={filters.onlyInStock}
              onCheckedChange={(checked) => onStockChange(checked as boolean)}
            />
            <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sustainable"
              checked={filters.onlySustainable}
              onCheckedChange={(checked) => onSustainableChange(checked as boolean)}
            />
            <Label htmlFor="sustainable" className="text-sm font-normal cursor-pointer">
              Eco-Friendly Only
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}


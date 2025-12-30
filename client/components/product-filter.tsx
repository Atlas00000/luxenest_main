"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, X, ChevronDown, ChevronUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getCategories, type Category } from "@/lib/api/categories"

export type FilterOptions = {
  categories: string[]
  priceRange: [number, number]
  sort: string
  onlyInStock: boolean
  onlySustainable: boolean
}

type ProductFilterProps = {
  onFilterChange: (filters: FilterOptions) => void
  className?: string
}

export function ProductFilter({ onFilterChange, className }: ProductFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, 1500],
    sort: "featured",
    onlyInStock: false,
    onlySustainable: false,
  })

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load categories:", error)
      }
    }
    loadCategories()
  }, [])

  const sortOptions = [
    { value: "featured", label: "Featured" },
    { value: "newest", label: "Newest" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
  ]

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category]

      return { ...prev, categories }
    })
  }

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: [value[0], value[1]] as [number, number],
    }))
  }

  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort: value }))
  }

  const handleStockChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, onlyInStock: checked }))
  }

  const handleSustainableChange = (checked: boolean) => {
    setFilters((prev) => ({ ...prev, onlySustainable: checked }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 1500],
      sort: "featured",
      onlyInStock: false,
      onlySustainable: false,
    })
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 1500 ||
    filters.onlyInStock ||
    filters.onlySustainable

  const activeFilterCount =
    filters.categories.length +
    (filters.priceRange[0] > 0 || filters.priceRange[1] < 1500 ? 1 : 0) +
    (filters.onlyInStock ? 1 : 0) +
    (filters.onlySustainable ? 1 : 0)

  return (
    <div className={cn("w-full filter-panel theme-transition", className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 theme-transition"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
            {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1 theme-transition">
                <span>Sort: {sortOptions.find((opt) => opt.value === filters.sort)?.label}</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="theme-transition">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center gap-2"
                >
                  {filters.sort === option.value && <Check className="h-4 w-4" />}
                  <span className={filters.sort === option.value ? "font-medium" : ""}>{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
            Clear all
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border rounded-lg p-4 mb-6 bg-background/50 backdrop-blur-sm theme-transition">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Categories</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.slug)}
                          onCheckedChange={() => handleCategoryChange(category.slug)}
                          className="theme-transition"
                        />
                        <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      defaultValue={[0, 1500]}
                      value={[filters.priceRange[0], filters.priceRange[1]]}
                      max={1500}
                      step={10}
                      onValueChange={handlePriceChange}
                      className="mb-6 theme-transition"
                    />
                    <div className="flex items-center justify-between text-sm">
                      <span>${filters.priceRange[0]}</span>
                      <span>${filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={filters.onlyInStock}
                        onCheckedChange={(checked) => handleStockChange(checked as boolean)}
                        className="theme-transition"
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
                        className="theme-transition"
                      />
                      <Label htmlFor="sustainable" className="text-sm font-normal cursor-pointer">
                        Eco-Friendly Only
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="flex items-center gap-1 theme-transition">
                    {categories.find((c) => c.slug === category)?.name}
                    <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => handleCategoryChange(category)} />
                  </Badge>
                ))}

                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1500) && (
                  <Badge variant="secondary" className="flex items-center gap-1 theme-transition">
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => setFilters((prev) => ({ ...prev, priceRange: [0, 1500] }))}
                    />
                  </Badge>
                )}

                {filters.onlyInStock && (
                  <Badge variant="secondary" className="flex items-center gap-1 theme-transition">
                    In Stock Only
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => setFilters((prev) => ({ ...prev, onlyInStock: false }))}
                    />
                  </Badge>
                )}

                {filters.onlySustainable && (
                  <Badge variant="secondary" className="flex items-center gap-1 theme-transition">
                    Eco-Friendly Only
                    <X
                      className="h-3 w-3 cursor-pointer ml-1"
                      onClick={() => setFilters((prev) => ({ ...prev, onlySustainable: false }))}
                    />
                  </Badge>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

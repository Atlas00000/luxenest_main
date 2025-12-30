"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SortOption = "discount-desc" | "price-asc" | "price-desc" | "popular" | "ending-soon"

interface MobileSalesControlsProps {
  searchQuery: string
  sortBy: SortOption
  onSearchChange: (query: string) => void
  onSortChange: (value: SortOption) => void
}

export function MobileSalesControls({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
}: MobileSalesControlsProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sales..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-full border-primary/30 focus:border-primary"
        />
      </div>
      <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
        <SelectTrigger className="w-full rounded-full border-primary/30 hover:border-primary">
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
  )
}


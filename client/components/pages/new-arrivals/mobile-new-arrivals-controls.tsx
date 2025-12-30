"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MobileNewArrivalsControlsProps {
  sortBy: string
  onSortChange: (value: string) => void
}

export function MobileNewArrivalsControls({
  sortBy,
  onSortChange,
}: MobileNewArrivalsControlsProps) {
  return (
    <Select value={sortBy} onValueChange={onSortChange}>
      <SelectTrigger className="w-full rounded-full border-primary/30 hover:border-primary">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="price-low">Price: Low to High</SelectItem>
        <SelectItem value="price-high">Price: High to Low</SelectItem>
        <SelectItem value="rating">Top Rated</SelectItem>
      </SelectContent>
    </Select>
  )
}


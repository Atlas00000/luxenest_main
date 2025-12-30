"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MobileCategoriesActiveFiltersProps {
  selectedFilters: string[]
  onRemoveFilter: (filter: string) => void
  onClearAll: () => void
}

export function MobileCategoriesActiveFilters({
  selectedFilters,
  onRemoveFilter,
  onClearAll,
}: MobileCategoriesActiveFiltersProps) {
  if (selectedFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {selectedFilters.map((filter) => (
        <Badge
          key={filter}
          variant="secondary"
          className="cursor-pointer rounded-full"
          onClick={() => onRemoveFilter(filter)}
        >
          {filter}
          <X className="ml-1 h-3 w-3" />
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 rounded-full"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  )
}


"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type SortOption = "name-asc" | "name-desc" | "popular" | "newest"

interface MobileCategoriesSearchControlsProps {
  searchQuery: string
  sortBy: SortOption
  selectedFiltersCount: number
  onSearchChange: (query: string) => void
  onSortChange: (sort: SortOption) => void
  onFilterOpen: (open: boolean) => void
}

export function MobileCategoriesSearchControls({
  searchQuery,
  sortBy,
  selectedFiltersCount,
  onSearchChange,
  onSortChange,
  onFilterOpen,
}: MobileCategoriesSearchControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 rounded-full border-primary/30 focus:border-primary"
        />
      </div>
      <div className="flex gap-2">
        <Sheet onOpenChange={onFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex-1 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {selectedFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Categories</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Filter options will be available here.
              </p>
            </div>
          </SheetContent>
        </Sheet>
        <Select value={sortBy} onValueChange={(value: SortOption) => onSortChange(value)}>
          <SelectTrigger className="flex-1 rounded-full border-primary/30 hover:border-primary">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}


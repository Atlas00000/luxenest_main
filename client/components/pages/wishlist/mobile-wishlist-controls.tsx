"use client"

import { Share2, ShoppingBag, Trash2, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"

interface MobileWishlistControlsProps {
  activeTab: string
  selectedItemsCount: number
  totalItemsCount: number
  allSelected: boolean
  onTabChange: (tab: string) => void
  onSelectAll: () => void
  onShare: () => void
  onBulkAddToCart: () => void
  onBulkRemove: () => void
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
}

export function MobileWishlistControls({
  activeTab,
  selectedItemsCount,
  totalItemsCount,
  allSelected,
  onTabChange,
  onSelectAll,
  onShare,
  onBulkAddToCart,
  onBulkRemove,
  categories,
  selectedCategory,
  onCategoryChange,
}: MobileWishlistControlsProps) {
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <div className="flex items-center justify-between mb-3">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" className="text-xs">
              Items ({totalItemsCount})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs">
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        {activeTab === "items" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onShare} className="flex-1 text-xs">
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
              {selectedItemsCount > 0 && (
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onBulkAddToCart}
                    className="text-xs h-8"
                  >
                    <ShoppingBag className="h-3 w-3 mr-1" />
                    Add All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 text-destructive"
                    onClick={onBulkRemove}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category)}
                  className="text-xs h-7"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {category}
                </Button>
              ))}
            </div>

            {/* Bulk Actions */}
            {totalItemsCount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <Checkbox checked={allSelected} onCheckedChange={onSelectAll} />
                <span className="text-xs text-muted-foreground">
                  {selectedItemsCount} items selected
                </span>
              </div>
            )}
          </div>
        )}
      </Tabs>
    </div>
  )
}


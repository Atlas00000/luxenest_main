"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TabsContent } from "@/components/ui/tabs"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { useToast } from "@/components/ui/use-toast"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileWishlistControls } from "./mobile-wishlist-controls"
import { MobileWishlistItem } from "./mobile-wishlist-item"
import { MobileWishlistAnalytics } from "./mobile-wishlist-analytics"
import { MobileWishlistEmptyState } from "./mobile-wishlist-empty-state"
import type { WishlistItem } from "@/lib/wishlist"

// Mock analytics data - replace with actual data from your backend
const mockAnalytics = {
  totalItems: 24,
  categories: {
    "Home Decor": 8,
    "Kitchen": 6,
    "Bathroom": 4,
    "Outdoor": 3,
    "Other": 3,
  },
  priceRanges: {
    "Under $50": 5,
    "$50-$100": 8,
    "$100-$200": 6,
    "Over $200": 5,
  },
  averagePrice: 125.5,
  totalValue: 3012.0,
}

// Mock categories - replace with actual categories from your backend
const categories = ["All Items", "Home Decor", "Kitchen", "Bathroom", "Outdoor", "Other"]

export function MobileWishlistPage() {
  const { addItem } = useCart()
  const { items: wishlistItems, removeItem } = useWishlist()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState("All Items")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [priceAlerts, setPriceAlerts] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("items")
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})

  // Load price alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts")
    if (savedAlerts) {
      setPriceAlerts(JSON.parse(savedAlerts))
    }
  }, [])

  // Save price alerts to localStorage
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(priceAlerts))
  }, [priceAlerts])

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied",
        description: "Wishlist link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const newAlerts = { ...prev, [productId]: !prev[productId] }
      toast({
        title: newAlerts[productId] ? "Price alert set" : "Price alert removed",
        description: newAlerts[productId]
          ? "You'll be notified when the price changes."
          : "Price alert has been removed.",
      })
      return newAlerts
    })
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const handleBulkAction = (action: "remove" | "add-to-cart") => {
    if (action === "remove") {
      selectedItems.forEach((id) => removeItem(id))
      setSelectedItems([])
      toast({
        title: "Items removed",
        description: `${selectedItems.length} items have been removed from your wishlist.`,
      })
    } else if (action === "add-to-cart") {
      selectedItems.forEach((id) => {
        const item = wishlistItems.find((item) => item.id === id)
        if (item) addItem(item)
      })
      toast({
        title: "Items added to cart",
        description: `${selectedItems.length} items have been added to your cart.`,
      })
    }
  }

  const filteredItems = wishlistItems.filter((item) =>
    selectedCategory === "All Items" ? true : item.category === selectedCategory
  )

  const handleImageLoad = (productId: string) => {
    setImageLoaded((prev) => ({ ...prev, [productId]: true }))
  }

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="Wishlist"
        subtitle="Your curated collection of favorite items"
        eyebrow="Your Collection"
      />

      <MobileSection>
        <MobileWishlistControls
          activeTab={activeTab}
          selectedItemsCount={selectedItems.length}
          totalItemsCount={filteredItems.length}
          allSelected={selectedItems.length === filteredItems.length && filteredItems.length > 0}
          onTabChange={setActiveTab}
          onSelectAll={toggleSelectAll}
          onShare={handleShare}
          onBulkAddToCart={() => handleBulkAction("add-to-cart")}
          onBulkRemove={() => handleBulkAction("remove")}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </MobileSection>

      <MobilePageContent>
        <TabsContent value="items" className="mt-0">
          {filteredItems.length === 0 ? (
            <MobileWishlistEmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((product, index) => (
                <MobileWishlistItem
                  key={product.id}
                  product={product}
                  index={index}
                  isSelected={selectedItems.includes(product.id)}
                  imageLoaded={imageLoaded}
                  priceAlertEnabled={priceAlerts[product.id] || false}
                  onSelect={(productId, selected) => {
                    setSelectedItems((prev) =>
                      selected
                        ? [...prev, productId]
                        : prev.filter((id) => id !== productId)
                    )
                  }}
                  onImageLoad={handleImageLoad}
                  onAddToCart={addItem}
                  onRemove={removeItem}
                  onTogglePriceAlert={togglePriceAlert}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <MobileWishlistAnalytics analytics={mockAnalytics} />
        </TabsContent>
      </MobilePageContent>

      {wishlistItems.length > 0 && (
        <MobileSection>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center"
          >
            <Button asChild variant="outline" size="lg" className="group w-full">
              <Link href="/products">
                Continue Shopping
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        </MobileSection>
      )}
    </MobilePageLayout>
  )
}


"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"
import * as wishlistApi from "@/lib/api/wishlist"
import { useAuth } from "@/components/auth-provider"
import { ApiClientError } from "@/lib/api/client"

interface WishlistContextType {
  items: Product[]
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  isLoading: boolean
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  // Convert API wishlist item to Product format
  const convertWishlistItem = (apiItem: wishlistApi.WishlistItem): Product => {
    const product = apiItem.product
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      images: product.images,
      category: product.category?.slug || "",
      tags: [],
      rating: product.rating,
      reviews: product.reviewsCount,
      stock: product.stock,
      featured: product.featured,
      new: product.isNew,
      sale: product.onSale,
      discount: product.discount,
      sustainabilityScore: product.sustainabilityScore,
      colors: [],
      sizes: [],
      materials: [],
    }
  }

  // Load wishlist from API
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const wishlist = await wishlistApi.getWishlist()
      const convertedItems = wishlist.items.map(convertWishlistItem)
      setItems(convertedItems)
    } catch (error) {
      console.error("Failed to load wishlist:", error)
      // Don't show error toast on initial load
      if (error instanceof ApiClientError && error.statusCode !== 401) {
        toast({
          title: "Error",
          description: "Failed to load wishlist. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  // Load wishlist on mount and when auth state changes
  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const addItem = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to wishlist.",
        variant: "destructive",
      })
      return
    }

    try {
      await wishlistApi.addWishlistItem(product.id)
      
      // Refresh wishlist
      await loadWishlist()
      
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to add item to wishlist"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const removeItem = async (productId: string) => {
    if (!isAuthenticated) {
      return
    }

    try {
      await wishlistApi.removeWishlistItem(productId)
      
      // Refresh wishlist
      await loadWishlist()
      
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed from your wishlist.",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to remove item from wishlist"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        isInWishlist,
        isLoading,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}

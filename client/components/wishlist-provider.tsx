"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { Property } from "@/lib/types"

interface WishlistContextType {
  items: Property[]
  addItem: (item: Property) => void
  removeItem: (id: string) => void
  clearWishlist: () => void
  isInWishlist: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Property[]>([])

  const addItem = useCallback((item: Property) => {
    setItems((prev) => [...prev, item])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearWishlist = useCallback(() => {
    setItems([])
  }, [])

  const isInWishlist = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  )

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, clearWishlist, isInWishlist }}
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
"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "@/lib/types"
import * as cartApi from "@/lib/api/cart"
import { useAuth } from "@/components/auth-provider"
import { ApiClientError } from "@/lib/api/client"

type CartItem = {
  product: Product
  quantity: number
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  subtotal: number
  isLoading: boolean
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  // Convert API cart item to component format
  const convertCartItem = (apiItem: cartApi.CartItem): CartItem => {
    const product: Product = {
      id: apiItem.product.id,
      name: apiItem.product.name,
      description: apiItem.product.description,
      price: Number(apiItem.product.price),
      images: apiItem.product.images,
      category: apiItem.product.category?.slug || "",
      tags: [],
      rating: apiItem.product.rating,
      reviews: apiItem.product.reviewsCount,
      stock: apiItem.product.stock,
      featured: false,
      new: false,
      sale: false,
      discount: null,
      sustainabilityScore: null,
      colors: [],
      sizes: [],
      materials: [],
    }

    return {
      product,
      quantity: apiItem.quantity,
    }
  }

  // Load cart from API
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const cart = await cartApi.getCart()
      const convertedItems = cart.items.map(convertCartItem)
      setItems(convertedItems)
    } catch (error) {
      console.error("Failed to load cart:", error)
      // Don't show error toast on initial load
      if (error instanceof ApiClientError && error.statusCode !== 401) {
        toast({
          title: "Error",
          description: "Failed to load cart. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, toast])

  // Load cart on mount and when auth state changes
  useEffect(() => {
    loadCart()
  }, [loadCart])

  const addItem = async (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Please login",
        description: "You need to be logged in to add items to cart.",
        variant: "destructive",
      })
      return
    }

    try {
      await cartApi.addCartItem({
        productId: product.id,
        quantity,
      })
      
      // Refresh cart
      await loadCart()
      
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to add item to cart"
      
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
      await cartApi.removeCartItem(productId)
      
      // Refresh cart
      await loadCart()
      
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to remove item from cart"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      return
    }

    if (quantity < 1) {
      await removeItem(productId)
      return
    }

    try {
      await cartApi.updateCartItem(productId, { quantity })
      
      // Refresh cart
      await loadCart()
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to update item quantity"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const clearCart = async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      await cartApi.clearCart()
      
      // Refresh cart
      await loadCart()
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      })
    } catch (error) {
      const errorMessage = error instanceof ApiClientError 
        ? error.message 
        : "Failed to clear cart"
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const subtotal = items.reduce((total, item) => {
    const price = item.product.sale && item.product.discount
      ? item.product.price * (1 - item.product.discount / 100)
      : item.product.price
    return total + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isLoading,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

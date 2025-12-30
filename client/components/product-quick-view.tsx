"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { X, Star, Minus, Plus, Heart, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

type ProductQuickViewProps = {
  product: Product
  onClose: () => void
}

export function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "")
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
    onClose()
  }

  // Calculate final price
  const finalPrice = product.sale ? (product.price * (100 - product.discount!)) / 100 : product.price

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-4xl bg-background rounded-xl shadow-xl overflow-hidden modal-content theme-transition"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10"
          onClick={onClose}
          aria-label="Close quick view"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="grid md:grid-cols-2 gap-0">
          <div className="relative aspect-square">
            <Image
              src={product.images[currentImageIndex] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover"
            />
            {product.sale && (
              <Badge variant="destructive" className="absolute top-4 left-4 theme-transition">
                Sale {product.discount}%
              </Badge>
            )}
            {product.new && <Badge className="absolute top-4 left-4 theme-transition">New Arrival</Badge>}

            {/* Thumbnail navigation */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                {product.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? "bg-primary w-6" : "bg-white/70 dark:bg-gray-700/70"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 flex flex-col">
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground",
                      )}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                {product.sale ? (
                  <>
                    <span className="text-2xl font-bold text-destructive">${finalPrice.toFixed(2)}</span>
                    <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            <p className="text-muted-foreground mt-4">{product.description}</p>

            <div className="space-y-6 mt-6">
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <Label>Color</Label>
                  <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <div key={color} className="flex items-center">
                        <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                        <Label
                          htmlFor={`color-${color}`}
                          className="px-3 py-1.5 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:border-primary theme-transition"
                        >
                          {color}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <Label>Size</Label>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="px-3 py-1.5 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:border-primary theme-transition"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="theme-transition"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= 10}
                    className="theme-transition"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto pt-6">
              <Button size="lg" className="flex-1 theme-transition" onClick={handleAddToCart}>
                <ShoppingBag className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>

              <Button variant="outline" size="lg" className="flex-1 theme-transition">
                <Heart className="h-5 w-5 mr-2" />
                Add to Wishlist
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button variant="link" asChild className="theme-transition">
                <Link href={`/products/${product.id}`}>View Full Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

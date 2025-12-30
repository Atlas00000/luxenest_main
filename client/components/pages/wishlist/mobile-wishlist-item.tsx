"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, ShoppingBag, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { WishlistItem } from "@/lib/wishlist"

interface MobileWishlistItemProps {
  product: WishlistItem
  index: number
  isSelected: boolean
  imageLoaded: Record<string, boolean>
  priceAlertEnabled: boolean
  onSelect: (productId: string, selected: boolean) => void
  onImageLoad: (productId: string) => void
  onAddToCart: (product: WishlistItem) => void
  onRemove: (productId: string) => void
  onTogglePriceAlert: (productId: string) => void
  onShare: () => void
}

export function MobileWishlistItem({
  product,
  index,
  isSelected,
  imageLoaded,
  priceAlertEnabled,
  onSelect,
  onImageLoad,
  onAddToCart,
  onRemove,
  onTogglePriceAlert,
  onShare,
}: MobileWishlistItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group relative luxury-card overflow-hidden theme-transition"
    >
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(product.id, checked as boolean)}
        />
      </div>

      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded[product.id] ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
              sizes="(max-width: 768px) 50vw, 33vw"
              onLoad={() => onImageLoad(product.id)}
              onError={() => onImageLoad(product.id)}
            />
          </motion.div>
          {product.sale && (
            <Badge variant="destructive" className="absolute top-3 right-3 text-xs">
              {product.discount}% OFF
            </Badge>
          )}
          {product.new && (
            <Badge className="absolute top-3 right-3 text-xs">New Arrival</Badge>
          )}
          {product.sustainabilityScore >= 4 && (
            <Badge variant="outline" className="absolute top-3 left-3 bg-background/80 text-xs">
              Eco-Friendly
            </Badge>
          )}
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-center gap-1 mb-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-3 w-3",
                  i < Math.floor(product.rating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews})</span>
        </div>

        <Link href={`/products/${product.id}`} className="block">
          <h3 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>

        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold text-sm">
            {product.sale ? (
              <div className="flex items-center gap-1">
                <span className="text-destructive">
                  ${((product.price * (100 - product.discount!)) / 100).toFixed(2)}
                </span>
                <span className="text-muted-foreground line-through text-xs">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span>${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 mb-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-7"
            onClick={(e) => {
              e.preventDefault()
              onAddToCart(product)
            }}
          >
            <ShoppingBag className="h-3 w-3 mr-1" />
            Add to Cart
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.preventDefault()
              onRemove(product.id)
            }}
          >
            <Heart className="h-3 w-3 fill-current" />
          </Button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Switch
              id={`price-alert-${product.id}`}
              checked={priceAlertEnabled}
              onCheckedChange={() => onTogglePriceAlert(product.id)}
              className="h-4 w-4"
            />
            <Label htmlFor={`price-alert-${product.id}`} className="text-xs text-muted-foreground">
              Price Alert
            </Label>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.preventDefault()
              onShare()
            }}
          >
            <Share2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


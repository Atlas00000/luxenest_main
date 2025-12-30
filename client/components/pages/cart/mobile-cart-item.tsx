"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Minus, Plus, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/lib/cart"

interface MobileCartItemProps {
  item: CartItem
  index: number
  imageLoaded: Record<string, boolean>
  onImageLoad: (productId: string) => void
  onQuantityChange: (productId: string, quantity: number) => void
  onSaveForLater?: (item: CartItem) => void
  onRemove: (productId: string) => void
  showSaveForLater?: boolean
}

export function MobileCartItem({
  item,
  index,
  imageLoaded,
  onImageLoad,
  onQuantityChange,
  onSaveForLater,
  onRemove,
  showSaveForLater = true,
}: MobileCartItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex gap-3 border-b pb-4"
    >
      <Link href={`/products/${item.product.id}`} className="shrink-0">
        <div className="relative aspect-square w-20 h-20 rounded-md border overflow-hidden bg-muted/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded[item.product.id] ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <Image
              src={item.product.images[0] || "/placeholder.svg"}
              alt={item.product.name}
              fill
              className="object-cover"
              loading="lazy"
              sizes="80px"
              onLoad={() => onImageLoad(item.product.id)}
              onError={() => onImageLoad(item.product.id)}
            />
          </motion.div>
        </div>
      </Link>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col gap-1 mb-2">
          <Link
            href={`/products/${item.product.id}`}
            className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
          >
            {item.product.name}
          </Link>
          <div className="text-xs text-muted-foreground">
            {item.product.colors && <span>Color: {item.product.colors[0]}</span>}
            {item.product.sizes && item.product.colors && <span> / </span>}
            {item.product.sizes && <span>Size: {item.product.sizes[0]}</span>}
          </div>
          <div className="font-medium text-sm">
            {item.product.sale ? (
              <div className="flex items-center gap-2">
                <span className="text-destructive">
                  ${((item.product.price * (100 - item.product.discount!)) / 100).toFixed(2)}
                </span>
                <span className="text-muted-foreground line-through text-xs">
                  ${item.product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span>${item.product.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(item.product.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(item.product.id, item.quantity + 1)}
              disabled={item.quantity >= 10}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex gap-1">
            {showSaveForLater && onSaveForLater && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => onSaveForLater(item)}
              >
                <Clock className="h-3 w-3 mr-1" />
                Save
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => onRemove(item.product.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


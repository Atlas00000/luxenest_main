"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Star, ShoppingBag, Heart, Eye, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { ProductQuickView } from "@/components/product-quick-view"
import { AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"

interface FeaturedProductCardProps {
  product: Product
  index: number
}

export function FeaturedProductCard({ product, index }: FeaturedProductCardProps) {
  const router = useRouter()
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [isHovered, setIsHovered] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 3D tilt transforms
  const rotateX = useTransform(y, (value) => (value - 50) * 0.1)
  const rotateY = useTransform(x, (value) => (50 - value) * 0.1)
  const imageX = useTransform(x, (value) => (value - 50) * 0.2)
  const imageY = useTransform(y, (value) => (value - 50) * 0.2)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const handleMouseLeave = () => {
    mouseX.set(50)
    mouseY.set(50)
    setIsHovered(false)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowQuickView(true)
  }

  const finalPrice = product.sale && product.discount
    ? (product.price * (100 - product.discount)) / 100
    : product.price

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{
          duration: 0.8,
          delay: index * 0.1,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="group relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          perspective: "1000px",
        }}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          animate={
            isHovered
              ? {
                  scale: 1.03,
                  z: 20,
                }
              : {
                  scale: 1,
                  z: 0,
                }
          }
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          {/* Organic Container - Not boxy */}
          <motion.div
            className="relative overflow-hidden bg-background"
            style={{
              borderRadius: "2rem",
              clipPath: isHovered
                ? "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)"
                : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            }}
            animate={
              isHovered
                ? {
                    boxShadow: "0 25px 80px rgba(191, 149, 63, 0.25)",
                  }
                : {
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  }
            }
            transition={{ duration: 0.5 }}
          >
            <div 
              className="block cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              {/* Image Container with Parallax */}
              <div className="relative aspect-square overflow-hidden bg-muted/50">
                <motion.div
                  style={{ x: imageX, y: imageY }}
                  animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="h-full w-full"
                  >
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover"
                      loading={index < 4 ? "eager" : "lazy"}
                      priority={index < 4}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(true)}
                    />
                  </motion.div>
                </motion.div>

                {/* Luxury Gradient Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                  initial={{ opacity: 0.5 }}
                  animate={{
                    opacity: isHovered && imageLoaded ? 0.4 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Animated Gold Glow */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(ellipse at 50% 50%, 
                      rgba(191, 149, 63, 0.15) 0%, 
                      transparent 70%)`,
                  }}
                  initial={{ opacity: 0.2, scale: 1 }}
                  animate={{
                    opacity: isHovered && imageLoaded ? [0.3, 0.6, 0.3] : 0.2,
                    scale: isHovered && imageLoaded ? [1, 1.3, 1] : 1,
                  }}
                  transition={{
                    duration: 3,
                    repeat: isHovered && imageLoaded ? Infinity : 0,
                    ease: "easeInOut",
                  }}
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.sale && product.discount && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Badge
                        variant="destructive"
                        className="px-3 py-1.5 text-xs font-semibold shadow-lg"
                      >
                        {product.discount}% Off
                      </Badge>
                    </motion.div>
                  )}
                  {product.new && (
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                    >
                      <Badge className="px-3 py-1.5 text-xs font-semibold bg-primary/90 shadow-lg">
                        New
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {product.sustainabilityScore && product.sustainabilityScore >= 4 && (
                  <motion.div
                    className="absolute top-4 right-4 z-10"
                    initial={{ scale: 0, rotate: 180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                  >
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 text-xs font-semibold bg-background/90 backdrop-blur-sm border-primary/30 shadow-lg"
                    >
                      <Sparkles className="h-3 w-3 mr-1.5 text-primary" />
                      Eco
                    </Badge>
                  </motion.div>
                )}

                {/* Action Buttons - Slide up on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 p-4 z-20"
                  initial={{ y: "100%" }}
                  animate={{
                    y: isHovered ? 0 : "100%",
                  }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex justify-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-11 w-11 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-primary/20"
                        onClick={handleAddToCart}
                      >
                        <ShoppingBag className="h-5 w-5" />
                        <span className="sr-only">Add to cart</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: -5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-11 w-11 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-primary/20"
                        onClick={handleQuickView}
                      >
                        <Eye className="h-5 w-5" />
                        <span className="sr-only">Quick view</span>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="icon"
                        variant="secondary"
                        className={cn(
                          "h-11 w-11 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border border-primary/20",
                          isInWishlist(product.id) && "bg-primary/20 border-primary/40"
                        )}
                        onClick={handleToggleWishlist}
                      >
                        <Heart
                          className={cn(
                            "h-5 w-5 transition-all",
                            isInWishlist(product.id) && "fill-primary text-primary scale-110"
                          )}
                        />
                        <span className="sr-only">Add to wishlist</span>
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-5 md:p-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.05 + i * 0.05 }}
                      >
                        <Star
                          className={cn(
                            "h-4 w-4",
                            i < Math.floor(product.rating)
                              ? "text-primary fill-primary"
                              : "text-muted-foreground"
                          )}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({product.reviews})
                  </span>
                </div>

                {/* Product Name */}
                <Link href={`/products/${product.id}`}>
                  <motion.h3
                    className="font-semibold text-lg md:text-xl leading-tight mb-2 group-hover:text-primary transition-colors"
                    animate={{
                      y: isHovered ? -2 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.name}
                  </motion.h3>
                </Link>

                {/* Description */}
                <motion.p
                  className="text-sm text-muted-foreground line-clamp-2 leading-relaxed"
                  animate={{
                    opacity: isHovered ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {product.description}
                </motion.p>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    {product.sale && product.discount ? (
                      <div className="flex items-baseline gap-2">
                        <motion.span
                          className="text-xl md:text-2xl font-bold text-destructive"
                          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          ${finalPrice.toFixed(2)}
                        </motion.span>
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <motion.span
                        className="text-xl md:text-2xl font-bold"
                        animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        ${product.price.toFixed(2)}
                      </motion.span>
                    )}
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full border-primary/30 hover:border-primary hover:bg-primary/10"
                    >
                      <Link href={`/products/${product.id}`} className="flex items-center gap-1.5">
                        <span className="text-xs md:text-sm">View</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <ProductQuickView product={product} onClose={() => setShowQuickView(false)} />
        )}
      </AnimatePresence>
    </>
  )
}


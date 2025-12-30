"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Eye, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { cn } from "@/lib/utils"
import type { Product } from "@/lib/types"
import { ProductQuickView } from "@/components/product-quick-view"

type ProductCarouselProps = {
  title: string
  subtitle?: string
  products: Product[]
  className?: string
}

export function ProductCarousel({ title, subtitle, products, className }: ProductCarouselProps) {
  const { addItem } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const productsPerPage = 4
  const totalPages = Math.ceil(products.length / productsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalPages) % totalPages)
  }

  useEffect(() => {
    controls.start({
      x: `${-currentIndex * 100}%`,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    })
  }, [currentIndex, controls])

  const openQuickView = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
  }

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
  }

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "2rem" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-0.5 bg-primary"
            />
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Collection</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="rounded-full transition-opacity duration-300"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex === totalPages - 1}
            className="rounded-full transition-opacity duration-300"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <motion.div ref={containerRef} className="flex" animate={controls} initial={{ x: 0 }}>
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 min-w-full"
              style={{ paddingRight: pageIndex === totalPages - 1 ? 0 : "1px" }}
            >
              {products.slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage).map((product, index) => {
                const productIndex = pageIndex * productsPerPage + index
                return (
                  <motion.div
                    key={product.id}
                    className="group relative rounded-xl border bg-background overflow-hidden transition-all hover:shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onMouseEnter={() => setHoveredIndex(productIndex)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-700",
                            hoveredIndex === productIndex ? "scale-110" : "scale-100",
                          )}
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        {product.sale && (
                          <Badge variant="destructive" className="absolute top-3 left-3">
                            Sale {product.discount}%
                          </Badge>
                        )}
                        {product.new && <Badge className="absolute top-3 left-3">New Arrival</Badge>}
                        {product.sustainabilityScore >= 4 && (
                          <Badge variant="outline" className="absolute top-3 right-3 bg-background/80">
                            Eco-Friendly
                          </Badge>
                        )}

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex justify-center gap-2">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-9 w-9 rounded-full"
                              onClick={(e) => handleAddToCart(product, e)}
                            >
                              <ShoppingBag className="h-4 w-4" />
                              <span className="sr-only">Add to cart</span>
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-9 w-9 rounded-full"
                              onClick={(e) => openQuickView(product, e)}
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">Quick view</span>
                            </Button>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-9 w-9 rounded-full"
                              onClick={(e) => handleToggleWishlist(product, e)}
                            >
                              <Heart className={cn("h-4 w-4", isInWishlist(product.id) && "fill-current")} />
                              <span className="sr-only">Add to wishlist</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Link>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>

                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-medium text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {product.sale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-destructive">
                                ${((product.price * (100 - product.discount!)) / 100).toFixed(2)}
                              </span>
                              <span className="text-muted-foreground line-through text-sm">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span>${product.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination dots */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? "bg-primary w-6" : "bg-primary/30"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && <ProductQuickView product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  )
}

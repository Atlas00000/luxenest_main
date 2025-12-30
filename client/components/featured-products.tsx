"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ChevronRight, Star, ChevronLeft, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getFeaturedProducts, type Product } from "@/lib/api/products"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import { useSafeScroll } from "@/hooks/use-safe-scroll"

export function FeaturedProducts() {
  const { addItem } = useCart()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const { containerRef, scrollYProgress } = useSafeScroll({
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const y = scrollYProgress
  const opacity = scrollYProgress

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await getFeaturedProducts(8)
        // Convert to component format
        const converted = products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price),
          images: product.images,
          category: product.category?.slug || "",
          tags: product.tags,
          rating: product.rating,
          reviews: product.reviewsCount,
          stock: product.stock,
          featured: product.featured,
          new: product.isNew,
          sale: product.onSale,
          discount: product.discount,
          sustainabilityScore: product.sustainabilityScore,
          colors: product.colors,
          sizes: product.sizes,
          materials: product.materials,
        }))
        setFeaturedProducts(converted)
      } catch (error) {
        console.error("Failed to load featured products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  if (isLoading) {
    return (
      <motion.section ref={containerRef} style={{ opacity }} className="relative container mx-auto px-4 py-16">
        <div className="text-center">Loading featured products...</div>
      </motion.section>
    )
  }

  return (
    <motion.section ref={containerRef} style={{ opacity }} className="relative container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex flex-col md:flex-row md:items-end justify-between mb-12"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "2rem" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="h-0.5 bg-primary"
            />
            <span className="text-sm text-primary font-medium uppercase tracking-wider">Curated Selection</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Products</h2>
          <p className="text-muted-foreground mt-2 max-w-md">
            Handpicked selections to elevate your space with exceptional quality and design
          </p>
        </div>
        <div className="flex gap-2 mt-6 md:mt-0">
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {featuredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => {
              const productPrice = Number(product.price)
              const discount = product.discount || 0
              const discountedPrice = product.sale && discount > 0 
                ? productPrice * (1 - discount / 100) 
                : productPrice

              return (
                <motion.div
                  key={product.id}
                  className="group relative rounded-xl border bg-background overflow-hidden transition-all hover:shadow-lg"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ y: index % 2 === 0 ? -20 : 20 }}
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={product.images[0] || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-700",
                          hoveredIndex === index ? "scale-110" : "scale-100",
                        )}
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      {product.sale && discount > 0 && (
                        <Badge variant="destructive" className="absolute top-3 left-3">
                          Sale {discount}%
                        </Badge>
                      )}
                      {product.new && <Badge className="absolute top-3 left-3">New Arrival</Badge>}
                      {product.sustainabilityScore && product.sustainabilityScore >= 4 && (
                        <Badge variant="outline" className="absolute top-3 right-3 bg-background/80">
                          Eco-Friendly
                        </Badge>
                      )}

                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">Quick View</span>
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                            <ShoppingBag className="h-4 w-4" />
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
                        {product.sale && discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-destructive">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground line-through text-sm">
                              ${productPrice.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span>${productPrice.toFixed(2)}</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={(e) => {
                          e.preventDefault()
                          addItem(product)
                        }}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className="mt-12 text-center">
            <Button asChild variant="outline" className="group rounded-full px-6">
              <Link href="/products">
                View all products
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No featured products available</p>
        </div>
      )}
    </motion.section>
  )
}

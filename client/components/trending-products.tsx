"use client"

import { useState, useEffect } from "react"
import { motion, useTransform } from "framer-motion"
import { getNewProducts, getSaleProducts, type Product } from "@/lib/api/products"
import { ProductCarousel } from "@/components/product-carousel"
import { useSafeScroll } from "@/hooks/use-safe-scroll"

export function TrendingSection() {
  const [trendingProducts, setTrendingProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { containerRef, scrollYProgress } = useSafeScroll({
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [100, -50])

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const [newProducts, saleProducts] = await Promise.all([
          getNewProducts(6),
          getSaleProducts(6),
        ])
        
        // Combine and convert to component format
        const combined = [...newProducts, ...saleProducts].map((product) => ({
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
        
        setTrendingProducts(combined)
      } catch (error) {
        console.error("Failed to load trending products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadTrending()
  }, [])

  if (isLoading) {
    return (
      <section ref={containerRef} className="relative py-16">
        <div className="text-center">Loading trending products...</div>
      </section>
    )
  }

  return (
    <motion.section ref={containerRef} style={{ opacity, y }} className="relative py-16">
      <ProductCarousel 
        title="Trending Now" 
        subtitle="New arrivals and current favorites" 
        products={trendingProducts} 
      />
    </motion.section>
  )
}

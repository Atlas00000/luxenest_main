"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getFeaturedProducts, type Product } from "@/lib/api/products"
import { SectionShell } from "@/components/section-shell"
import { FeaturedCarousel } from "./featured-products/featured-carousel"
import { Loader2 } from "lucide-react"

export function FeaturedProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const featured = await getFeaturedProducts(12)
        setProducts(featured)
      } catch (error) {
        console.error("Failed to load featured products:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Convert API products to component format
  const convertedProducts = products.map((product) => ({
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

  return (
    <SectionShell
      eyebrow="Discover"
      title="Featured Products"
      subtitle="Hand-selected by our design team, these pieces represent the pinnacle of craftsmanship and style. Each featured product has been chosen for its exceptional quality, timeless appeal, and ability to elevate any interior space."
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : convertedProducts.length > 0 ? (
          <FeaturedCarousel products={convertedProducts} />
        ) : (
          <div className="text-center py-16 luxury-card rounded-2xl">
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground">Check back soon for featured products.</p>
          </div>
        )}
      </motion.div>
    </SectionShell>
  )
}

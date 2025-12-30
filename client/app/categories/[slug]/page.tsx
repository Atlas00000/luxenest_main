"use client"

import { useState, useEffect, use } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategoryBySlug, type Category } from "@/lib/api/categories"
import { getProducts, type Product } from "@/lib/api/products"
import { useCart } from "@/lib/cart"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MobileCategoryDetailPage } from "@/components/pages/categories/mobile-category-detail-page"
import { useMobile } from "@/hooks/use-mobile"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useMobile()
  // useParams() returns params synchronously, not a Promise
  const slug = params.slug as string
  const { addItem } = useCart()
  const { toast } = useToast()

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryImageLoaded, setCategoryImageLoaded] = useState(false)
  const [productImagesLoaded, setProductImagesLoaded] = useState<Record<string, boolean>>({})

  // Load category
  useEffect(() => {
    const loadCategory = async () => {
      try {
        // Reset image loaded state when category changes
        setCategoryImageLoaded(false)
        setProductImagesLoaded({})
        const categoryData = await getCategoryBySlug(slug)
        setCategory(categoryData)
      } catch (error: any) {
        setError(error.message || "Category not found")
        if (error.statusCode === 404) {
          router.push("/categories")
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      loadCategory()
    }
  }, [slug, router])

  // Load products for this category
  useEffect(() => {
    const loadProducts = async () => {
      if (!category) return

      setIsLoadingProducts(true)
      // Reset product images loaded state when products change
      setProductImagesLoaded({})
      try {
        const result = await getProducts({
          categoryId: category.id,
          limit: 50,
        })
        setProducts(result.products)
      } catch (error: any) {
        console.error("Failed to load products:", error)
      } finally {
        setIsLoadingProducts(false)
      }
    }

    loadProducts()
  }, [category])

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileCategoryDetailPage slug={slug} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !category) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <Button asChild>
            <Link href="/categories">Back to Categories</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/categories">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
      </Button>

      {/* Category Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="relative aspect-[16/6] rounded-xl overflow-hidden mb-6 bg-muted/50">
          <motion.div
            key={category.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: categoryImageLoaded ? 1 : 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={category.image || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover"
              priority
              onLoad={() => setCategoryImageLoaded(true)}
              onError={() => setCategoryImageLoaded(true)}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-white/90 text-lg max-w-2xl">{category.description}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative luxury-card overflow-hidden theme-transition"
            >
              <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-square overflow-hidden rounded-xl mb-4 bg-muted/50">
                  <motion.div
                    key={`img-${product.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: productImagesLoaded[product.id] ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onLoad={() => setProductImagesLoaded(prev => ({ ...prev, [product.id]: true }))}
                      onError={() => setProductImagesLoaded(prev => ({ ...prev, [product.id]: true }))}
                    />
                  </motion.div>
                  {product.onSale && (
                    <Badge className="absolute top-2 right-2" variant="destructive">
                      Sale
                    </Badge>
                  )}
                  {product.isNew && (
                    <Badge className="absolute top-2 left-2" variant="secondary">
                      New
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">${Number(product.price).toFixed(2)}</span>
                    {product.discount && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${(Number(product.price) / (1 - product.discount / 100)).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>★</span>
                      <span>{product.rating.toFixed(1)}</span>
                      <span>({product.reviewsCount})</span>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 luxury-card rounded-xl">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">This category doesn't have any products yet.</p>
          <Button asChild>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </div>
  )
}


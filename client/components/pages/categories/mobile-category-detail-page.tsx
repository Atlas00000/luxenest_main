"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCategoryBySlug, type Category } from "@/lib/api/categories"
import { getProducts, type Product } from "@/lib/api/products"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileCategoryHeader } from "./mobile-category-header"
import { MobileCategoryProductsGrid } from "./mobile-category-products-grid"

interface MobileCategoryDetailPageProps {
  slug: string
}

export function MobileCategoryDetailPage({ slug }: MobileCategoryDetailPageProps) {
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load category
  useEffect(() => {
    const loadCategory = async () => {
      try {
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

  if (isLoading) {
    return (
      <MobilePageLayout>
        <MobilePageContent>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MobilePageContent>
      </MobilePageLayout>
    )
  }

  if (error || !category) {
    return (
      <MobilePageLayout>
        <MobilePageContent>
          <div className="text-center py-12">
            <h1 className="text-xl font-bold mb-4">Category not found</h1>
            <Button asChild size="sm">
              <Link href="/categories">Back to Categories</Link>
            </Button>
          </div>
        </MobilePageContent>
      </MobilePageLayout>
    )
  }

  return (
    <MobilePageLayout>
      {/* Back Button */}
      <MobileSection spacing="tight">
        <Button variant="ghost" asChild size="sm">
          <Link href="/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </MobileSection>

      {/* Category Header */}
      <MobileSection>
        <MobileCategoryHeader category={category} />
      </MobileSection>

      {/* Products Grid */}
      <MobilePageContent>
        <MobileCategoryProductsGrid products={products} isLoading={isLoadingProducts} />
      </MobilePageContent>
    </MobilePageLayout>
  )
}


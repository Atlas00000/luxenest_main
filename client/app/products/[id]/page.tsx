"use client"

import { useState, useEffect, use } from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, Share2, ShoppingBag, Star, Truck, Facebook, Twitter, Linkedin, MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getProductById, getProducts, type Product } from "@/lib/api/products"
import { getProductReviews, getUserReview, markReviewHelpful, type Review } from "@/lib/api/reviews"
import { useCart } from "@/lib/cart"
import { useWishlist } from "@/lib/wishlist"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { ReviewForm } from "@/components/review-form"
import { cn } from "@/lib/utils"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { addItem } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [reviewsPage, setReviewsPage] = useState(1)
  const [reviewsMeta, setReviewsMeta] = useState({ total: 0, totalPages: 1 })
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [thumbnailImagesLoaded, setThumbnailImagesLoaded] = useState<Record<number, boolean>>({})

  // Load product
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const productData = await getProductById(id)
        setProduct(productData)
        
        // Set default color and size
        if (productData.colors && productData.colors.length > 0) {
          setSelectedColor(productData.colors[0])
        }
        if (productData.sizes && productData.sizes.length > 0) {
          setSelectedSize(productData.sizes[0])
        }
        
        // Load related products
        if (productData.categoryId) {
          try {
            const related = await getProducts({
              categoryId: productData.categoryId,
              limit: 5,
            })
            // Filter out current product and limit to 4
            const filtered = related.products
              .filter(p => p.id !== productData.id)
              .slice(0, 4)
            setRelatedProducts(filtered)
          } catch (error) {
            console.error("Failed to load related products:", error)
          }
        }

        // Load reviews
        await loadReviews(productData.id, 1)
        
        // Load user's review if authenticated
        if (isAuthenticated) {
          try {
            const review = await getUserReview(productData.id)
            setUserReview(review)
          } catch (error: any) {
            // User hasn't reviewed yet (404) or other error - that's fine
            if (error.statusCode !== 404) {
              console.error("Failed to load user review:", error)
            }
            setUserReview(null)
          }
        }
      } catch (error: any) {
        setError(error.message || "Product not found")
        if (error.statusCode === 404) {
          notFound()
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, isAuthenticated])

  // Load reviews function
  const loadReviews = async (productId: string, page: number = 1) => {
    setIsLoadingReviews(true)
    try {
      const result = await getProductReviews(productId, page, 10)
      setReviews(Array.isArray(result.reviews) ? result.reviews : [])
      setReviewsMeta({
        total: result.meta?.total || 0,
        totalPages: result.meta?.totalPages || 1,
      })
    } catch (error) {
      console.error("Failed to load reviews:", error)
      setReviews([])
      setReviewsMeta({ total: 0, totalPages: 1 })
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Handle review submission
  const handleReviewSubmitted = async () => {
    if (!product) return
    
    // Reload reviews
    await loadReviews(product.id, reviewsPage)
    
    // Reload user's review
    if (isAuthenticated) {
      try {
        const review = await getUserReview(product.id)
        setUserReview(review)
      } catch (error) {
        setUserReview(null)
      }
    }
    
    // Reload product to get updated rating
    try {
      const updatedProduct = await getProductById(product.id)
      setProduct(updatedProduct)
    } catch (error) {
      console.error("Failed to reload product:", error)
    }
  }

  // Handle helpful button
  const handleHelpful = async (reviewId: string) => {
    try {
      await markReviewHelpful(reviewId)
      // Reload reviews to get updated helpful count
      if (product) {
        await loadReviews(product.id, reviewsPage)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark review as helpful",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-6">{error || "The product you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/products")}>Back to Products</Button>
        </div>
      </div>
    )
  }

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10))
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1))
  }

  const handleAddToCart = () => {
    // Convert API product to cart format
    const cartProduct = {
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
    }
    addItem(cartProduct, quantity)
  }

  const toggleWishlist = () => {
    const cartProduct = {
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
    }
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      })
    } else {
      addToWishlist(cartProduct)
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Check out this amazing ${product.name} on LuxeNest!`
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
    }
    setShowShareMenu(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const selectImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  // Calculate final price
  const productPrice = Number(product.price)
  const discount = product.discount || 0
  const finalPrice = product.onSale && discount > 0 
    ? productPrice * (1 - discount / 100) 
    : productPrice

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-xl luxury-card bg-muted/50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
                onAnimationStart={() => setMainImageLoaded(false)}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: mainImageLoaded ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <Image
                    src={product.images[currentImageIndex] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onLoad={() => setMainImageLoaded(true)}
                    onError={() => setMainImageLoaded(true)}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {product.onSale && discount > 0 && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                Sale {discount}%
              </Badge>
            )}
            {product.isNew && <Badge className="absolute top-4 left-4">New Arrival</Badge>}

            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-background/80 backdrop-blur-sm"
                onClick={toggleWishlist}
              >
                <Heart className={cn("h-5 w-5", isInWishlist(product.id) && "fill-current")} />
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background/80 backdrop-blur-sm"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-md border bg-background shadow-lg z-10">
                    <div className="p-2 space-y-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleShare('facebook')}
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleShare('twitter')}
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => handleShare('linkedin')}
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
              {product.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={cn(
                    "w-2.5 h-2.5 rounded-full transition-all",
                    index === currentImageIndex ? "bg-primary w-8" : "bg-primary/30",
                  )}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={prevImage}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={nextImage}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex gap-4 overflow-auto pb-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => selectImage(index)}
                className={cn(
                  "relative aspect-square w-20 shrink-0 rounded-md border overflow-hidden",
                  index === currentImageIndex && "ring-2 ring-primary",
                )}
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: thumbnailImagesLoaded[index] ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="80px"
                    onLoad={() => setThumbnailImagesLoaded(prev => ({ ...prev, [index]: true }))}
                    onError={() => setThumbnailImagesLoaded(prev => ({ ...prev, [index]: true }))}
                  />
                </motion.div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to products
            </Link>

            <h1 className="text-3xl font-bold tracking-tight mt-2">{product.name}</h1>

            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground",
                    )}
                  />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">({product.reviewsCount} reviews)</span>
              </div>

              <Separator orientation="vertical" className="h-5" />

              <span className="text-sm text-muted-foreground">
                {product.stock > 0 ? (
                  <span className="text-green-600">In Stock</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            {product.onSale && discount > 0 ? (
              <>
                <span className="text-3xl font-bold text-destructive">${finalPrice.toFixed(2)}</span>
                <span className="text-xl text-muted-foreground line-through">${productPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-3xl font-bold">${productPrice.toFixed(2)}</span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <div className="space-y-6">
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label>Color</Label>
                <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <div key={color} className="flex items-center">
                      <RadioGroupItem value={color} id={`color-${color}`} className="peer sr-only" />
                      <Label
                        htmlFor={`color-${color}`}
                        className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:border-primary"
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
                        className="px-4 py-2 border rounded-md cursor-pointer peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:border-primary"
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
                <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button variant="outline" size="icon" onClick={incrementQuantity} disabled={quantity >= 10}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button 
              className="w-full" 
              size="lg" 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Free shipping on orders $100+
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>30-day returns</div>
              <Separator orientation="vertical" className="h-4" />
              <div>Lifetime warranty</div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">LuxeNest Promise:</strong> Every product is backed by our 
                lifetime repair guarantee and white-glove delivery service. Our team of design consultants is 
                available to help you create the perfect space.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="details" className="space-y-8">
          <TabsList className="luxury-card p-2 rounded-xl">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewsCount || 0})</TabsTrigger>
            <TabsTrigger value="related">Related Products</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Product Details</h3>
                <ul className="space-y-2">
                  {product.materials && product.materials.length > 0 && (
                    <li className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Material</span>
                      <span className="font-medium">{product.materials.join(", ")}</span>
                    </li>
                  )}
                  {product.colors && product.colors.length > 0 && (
                    <li className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Colors</span>
                      <span className="font-medium">{product.colors.join(", ")}</span>
                    </li>
                  )}
                  {product.sizes && product.sizes.length > 0 && (
                    <li className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Sizes</span>
                      <span className="font-medium">{product.sizes.join(", ")}</span>
                    </li>
                  )}
                  {product.sustainabilityScore !== null && (
                    <li className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Sustainability Score</span>
                      <span className="font-medium">{product.sustainabilityScore}/5</span>
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Shipping, Returns & Warranty</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Free White-Glove Delivery</span>
                      <p className="text-sm text-muted-foreground">
                        Free professional delivery and setup on orders over $100. Our team handles placement 
                        and assembly. Standard shipping (3-5 business days) available for smaller items.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">30-Day Returns</span>
                      <p className="text-sm text-muted-foreground">
                        Hassle-free returns within 30 days. We'll arrange pickup and provide a full refund. 
                        Items must be in original condition with all packaging.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Lifetime Repair Guarantee</span>
                      <p className="text-sm text-muted-foreground">
                        All LuxeNest furniture includes our lifetime repair guarantee. Manufacturing defect repairs 
                        are free; normal wear repairs available at discounted rates.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="font-medium">Design Consultation</span>
                      <p className="text-sm text-muted-foreground">
                        Complimentary 30-minute design consultation with our in-house stylists for orders over $500. 
                        Book online or call 1-800-LUXENEST.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-6">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{product.rating}</div>
                <div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(product.rating) ? "text-primary fill-primary" : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on {product.reviewsCount} reviews</p>
                </div>
              </div>

              {/* Review Form - Show if authenticated and user hasn't reviewed */}
              {isAuthenticated && !userReview && (
                <div className="luxury-card p-6 rounded-xl">
                  <h3 className="text-lg font-medium mb-4">Write a Review</h3>
                  <ReviewForm productId={product.id} onReviewSubmitted={handleReviewSubmitted} />
                </div>
              )}

              {/* User's Review - Show if user has reviewed */}
              {isAuthenticated && userReview && (
                <div className="luxury-card p-6 rounded-xl border-primary/20">
                  <h3 className="text-lg font-medium mb-4">Your Review</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < userReview.rating ? "text-primary fill-primary" : "text-muted-foreground",
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(userReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h5 className="font-medium">{userReview.title}</h5>
                    <p className="text-muted-foreground">{userReview.comment}</p>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="luxury-card p-6 rounded-xl mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{review.user.name}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < review.rating ? "text-primary fill-primary" : "text-muted-foreground",
                                  )}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleHelpful(review.id)}
                        >
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                      <h5 className="font-medium mb-2">{review.title}</h5>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>
                  ))}
                  
                  {/* Pagination */}
                  {reviewsMeta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPage = reviewsPage - 1
                          setReviewsPage(newPage)
                          if (product) loadReviews(product.id, newPage)
                        }}
                        disabled={reviewsPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {reviewsPage} of {reviewsMeta.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPage = reviewsPage + 1
                          setReviewsPage(newPage)
                          if (product) loadReviews(product.id, newPage)
                        }}
                        disabled={reviewsPage >= reviewsMeta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="related" className="pt-6">
            {relatedProducts && relatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const relatedPrice = Number(relatedProduct.price)
                  const relatedDiscount = relatedProduct.discount || 0
                  
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/products/${relatedProduct.id}`}
                      className="group block"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted/50">
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3 }}
                          className="h-full w-full"
                        >
                          <Image
                            src={relatedProduct.images[0] || "/placeholder.svg"}
                            alt={relatedProduct.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </motion.div>
                        {relatedProduct.onSale && relatedDiscount > 0 && (
                          <Badge variant="destructive" className="absolute top-2 left-2">
                            Sale {relatedDiscount}%
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.floor(relatedProduct.rating)
                                    ? "text-primary fill-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">({relatedProduct.reviewsCount})</span>
                        </div>
                        <div className="mt-1">
                          {relatedProduct.onSale && relatedDiscount > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-destructive">
                                ${(relatedPrice * (1 - relatedDiscount / 100)).toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${relatedPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-medium">${relatedPrice.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No related products found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, Star, ShoppingBag, Heart, Share2, Bell, BarChart2, Tag, Trash2, Check } from "lucide-react"
import { useCart } from "@/lib/cart"
import { cn } from "@/lib/utils"
import { useWishlist } from "@/lib/wishlist"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { MobileWishlistPage } from "@/components/pages/wishlist/mobile-wishlist-page"
import { useMobile } from "@/hooks/use-mobile"

// Mock analytics data - replace with actual data from your backend
const mockAnalytics = {
  totalItems: 24,
  categories: {
    "Home Decor": 8,
    "Kitchen": 6,
    "Bathroom": 4,
    "Outdoor": 3,
    "Other": 3,
  },
  priceRanges: {
    "Under $50": 5,
    "$50-$100": 8,
    "$100-$200": 6,
    "Over $200": 5,
  },
  averagePrice: 125.50,
  totalValue: 3012.00,
}

// Mock categories - replace with actual categories from your backend
const categories = [
  "All Items",
  "Home Decor",
  "Kitchen",
  "Bathroom",
  "Outdoor",
  "Other",
]

export default function WishlistPage() {
  const isMobile = useMobile()
  const { addItem } = useCart()
  const { items: wishlistItems, removeItem } = useWishlist()
  const { toast } = useToast()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All Items")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [priceAlerts, setPriceAlerts] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("items")
  const [shareUrl, setShareUrl] = useState("")
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({})

  // Load price alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem("priceAlerts")
    if (savedAlerts) {
      setPriceAlerts(JSON.parse(savedAlerts))
    }
  }, [])

  // Save price alerts to localStorage
  useEffect(() => {
    localStorage.setItem("priceAlerts", JSON.stringify(priceAlerts))
  }, [priceAlerts])

  const handleShare = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setShareUrl(url)
      toast({
        title: "Link copied",
        description: "Wishlist link has been copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      })
    }
  }

  const togglePriceAlert = (productId: string) => {
    setPriceAlerts((prev) => {
      const newAlerts = { ...prev, [productId]: !prev[productId] }
      toast({
        title: newAlerts[productId] ? "Price alert set" : "Price alert removed",
        description: newAlerts[productId]
          ? "You'll be notified when the price changes."
          : "Price alert has been removed.",
      })
      return newAlerts
    })
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map((item) => item.id))
    }
  }

  const handleBulkAction = (action: "remove" | "add-to-cart") => {
    if (action === "remove") {
      selectedItems.forEach((id) => removeItem(id))
      setSelectedItems([])
      toast({
        title: "Items removed",
        description: `${selectedItems.length} items have been removed from your wishlist.`,
      })
    } else if (action === "add-to-cart") {
      selectedItems.forEach((id) => {
        const item = wishlistItems.find((item) => item.id === id)
        if (item) addItem(item)
      })
      toast({
        title: "Items added to cart",
        description: `${selectedItems.length} items have been added to your cart.`,
      })
    }
  }

  const filteredItems = wishlistItems.filter((item) =>
    selectedCategory === "All Items" ? true : item.category === selectedCategory
  )

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileWishlistPage />
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
          <span className="text-sm text-primary font-medium uppercase tracking-wider">Your Collection</span>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "2rem" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-0.5 bg-primary"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Wishlist</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
          Save your favorite pieces for later. Set price alerts to be notified when items go on sale, and 
          share your wishlist with friends and family. All items maintain our lifetime warranty and white-glove 
          delivery service.
        </p>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Your curated collection of favorite items
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {activeTab === "items" && (
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction("add-to-cart")}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleBulkAction("remove")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <TabsContent value="items" className="space-y-8">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                <Tag className="h-4 w-4 mr-2" />
                {category}
              </Button>
            ))}
          </div>

          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">Start adding items to your wishlist to see them here</p>
              <Button asChild>
                <Link href="/products">
                  Browse Products
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Bulk Actions */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedItems.length} items selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {filteredItems.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group relative luxury-card overflow-hidden theme-transition"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="absolute top-4 left-4 z-10">
                      <Checkbox
                        checked={selectedItems.includes(product.id)}
                        onCheckedChange={(checked) => {
                          setSelectedItems((prev) =>
                            checked
                              ? [...prev, product.id]
                              : prev.filter((id) => id !== product.id)
                          )
                        }}
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
                            className={cn(
                              "object-cover transition-transform duration-700",
                              hoveredIndex === index ? "scale-110" : "scale-100"
                            )}
                            loading="lazy"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onLoad={() => setImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                            onError={() => setImageLoaded(prev => ({ ...prev, [product.id]: true }))}
                          />
                        </motion.div>
                        {product.sale && (
                          <Badge variant="destructive" className="absolute top-3 right-3">
                            {product.discount}% OFF
                          </Badge>
                        )}
                        {product.new && (
                          <Badge className="absolute top-3 right-3">New Arrival</Badge>
                        )}
                        {product.sustainabilityScore >= 4 && (
                          <Badge
                            variant="outline"
                            className="absolute top-3 right-3 bg-background/80"
                          >
                            Eco-Friendly
                          </Badge>
                        )}

                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Quick View</span>
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-8 w-8 rounded-full"
                              onClick={(e) => {
                                e.preventDefault()
                                addItem(product)
                              }}
                            >
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
                                i < Math.floor(product.rating)
                                  ? "text-primary fill-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          ({product.reviews})
                        </span>
                      </div>

                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-medium text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="font-semibold">
                          {product.sale ? (
                            <div className="flex items-center gap-2">
                              <span className="text-destructive">
                                $
                                {(
                                  (product.price * (100 - product.discount!)) /
                                  100
                                ).toFixed(2)}
                              </span>
                              <span className="text-muted-foreground line-through text-sm">
                                ${product.price.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span>${product.price.toFixed(2)}</span>
                          )}
                        </div>

                        <div className="flex gap-2">
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.preventDefault()
                              removeItem(product.id)
                            }}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`price-alert-${product.id}`}
                            checked={priceAlerts[product.id]}
                            onCheckedChange={() => togglePriceAlert(product.id)}
                          />
                          <Label
                            htmlFor={`price-alert-${product.id}`}
                            className="text-sm text-muted-foreground"
                          >
                            Price Alert
                          </Label>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-full"
                          onClick={(e) => {
                            e.preventDefault()
                            handleShare()
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="luxury-card">
              <CardHeader>
                <CardTitle>Total Items</CardTitle>
                <CardDescription>In your wishlist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockAnalytics.totalItems}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Value</CardTitle>
                <CardDescription>Of wishlist items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${mockAnalytics.totalValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Price</CardTitle>
                <CardDescription>Per item</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  ${mockAnalytics.averagePrice.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
                <CardDescription>Item distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(mockAnalytics.categories).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{category}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Distribution</CardTitle>
                <CardDescription>By price range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockAnalytics.priceRanges).map(([range, count]) => (
                    <div key={range}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{range}</span>
                        <span className="font-medium">{count} items</span>
                      </div>
                      <Progress
                        value={(count / mockAnalytics.totalItems) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(mockAnalytics.categories).map(([category, count]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{category}</span>
                        <span className="font-medium">{count} items</span>
                      </div>
                      <Progress
                        value={(count / mockAnalytics.totalItems) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {wishlistItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Button asChild variant="outline" size="lg" className="group">
            <Link href="/products">
              Continue Shopping
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
} 
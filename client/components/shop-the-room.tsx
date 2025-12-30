"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getRooms } from "@/lib/api/rooms"
import { getProducts } from "@/lib/api/products"
import { cn } from "@/lib/utils"
import type { Room } from "@/lib/api/rooms"
import type { Product } from "@/lib/api/products"
import { SectionShell } from "@/components/section-shell"

export function ShopTheRoom() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentRoom, setCurrentRoom] = useState(0)
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [roomsData, productsData] = await Promise.all([
          getRooms(),
          getProducts({ limit: 20 }),
        ])
        setRooms(roomsData)
        setProducts(productsData.products)
      } catch (error) {
        console.error("Failed to load rooms:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading || rooms.length === 0) {
    return null
  }

  const room = rooms[currentRoom]
  // For now, use first few products as hotspots (in a real app, this would come from room data)
  const hotspots = products.slice(0, 3).map((product, index) => ({
    id: index + 1,
    x: [25, 60, 80][index] || 50,
    y: [45, 70, 30][index] || 50,
    productId: product.id,
  }))

  return (
    <SectionShell
      eyebrow="Interactive"
      title="Shop The Room"
      subtitle="Our interior design team creates complete room concepts using real LuxeNest products. Click on any item to see details, pricing, and add to your cart. Each room is professionally styled and photographed in actual homes, showing you exactly how pieces work together in real spaces."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden luxury-card p-0 bg-muted/50">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="h-full w-full"
              >
                <Image 
                  src={room.image || "/placeholder.svg"} 
                  alt={room.name} 
                  fill 
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </motion.div>

              {hotspots.map((hotspot) => {
                const product = products.find((p) => p.id === hotspot.productId)
                if (!product) return null

                return (
                  <div key={hotspot.id} className="absolute" style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}>
                    <button
                      className={cn(
                        "h-6 w-6 rounded-full flex items-center justify-center transition-all duration-300",
                        activeHotspot === hotspot.id
                          ? "bg-primary scale-100"
                          : "bg-primary/80 hover:bg-primary scale-75 hover:scale-100",
                      )}
                      onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                    >
                      <span className="sr-only">View {product.name}</span>
                      <span className="text-white text-xs font-bold">+</span>
                    </button>

                    <AnimatePresence>
                      {activeHotspot === hotspot.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-background rounded-lg shadow-lg border overflow-hidden"
                        >
                          <div className="relative aspect-square">
                            <Image
                              src={product.images[0] || "/placeholder.svg"}
                              alt={product.name}
                              fill
                              className="object-cover"
                              loading="lazy"
                              sizes="256px"
                            />
                            {product.onSale && product.discount && (
                              <Badge variant="destructive" className="absolute top-2 left-2">
                                Sale {product.discount}%
                              </Badge>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <div className="font-semibold">
                                {product.onSale && product.discount ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-destructive">
                                      ${((Number(product.price) * (100 - product.discount)) / 100).toFixed(2)}
                                    </span>
                                    <span className="text-muted-foreground line-through text-sm">
                                      ${Number(product.price).toFixed(2)}
                                    </span>
                                  </div>
                                ) : (
                                  <span>${Number(product.price).toFixed(2)}</span>
                                )}
                              </div>
                              <Button asChild size="sm" variant="outline" className="h-8">
                                <Link href={`/products/${product.id}`}>View</Link>
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
          </div>

          <div className="flex justify-center mt-4 gap-2">
            {rooms.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentRoom(index)
                  setActiveHotspot(null)
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentRoom ? "bg-primary w-8" : "bg-primary/30"
                }`}
                aria-label={`View room ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="luxury-card rounded-2xl p-6 h-full">
              <h3 className="text-2xl font-bold mb-2">{room.name}</h3>
              <p className="text-muted-foreground mb-6">{room.description}</p>

              <h4 className="font-medium text-lg mb-4">Featured Products</h4>
            <div className="space-y-4">
                {hotspots.map((hotspot) => {
                  const product = products.find((p) => p.id === hotspot.productId)
                  if (!product) return null

                  return (
                    <motion.div
                      key={hotspot.id}
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: activeHotspot === hotspot.id ? 1.02 : 1,
                        backgroundColor: activeHotspot === hotspot.id ? "rgba(var(--primary), 0.1)" : "transparent",
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg cursor-pointer"
                      onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                    >
                      <div className="relative h-16 w-16 rounded border overflow-hidden shrink-0">
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover"
                          loading="lazy"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h5 className="font-medium">{product.name}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="font-semibold text-sm">
                            {product.onSale && product.discount ? (
                              <div className="flex items-center gap-2">
                                <span className="text-destructive">
                                  ${((Number(product.price) * (100 - product.discount)) / 100).toFixed(2)}
                                </span>
                                <span className="text-muted-foreground line-through text-xs">
                                  ${Number(product.price).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span>${Number(product.price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

            <div className="mt-8">
              <Button asChild className="w-full">
                <Link href="/products">Shop All Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

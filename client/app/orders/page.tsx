"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Package, Clock, Truck, CheckCircle2, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserOrders, type Order } from "@/lib/api/orders"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { MobileOrdersPage } from "@/components/pages/orders/mobile-orders-page"
import { useMobile } from "@/hooks/use-mobile"

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
}

export default function OrdersPage() {
  const isMobile = useMobile()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadOrders = async () => {
      setIsLoading(true)
      try {
        const result = await getUserOrders(page, 10)
        setOrders(result.orders)
        setMeta(result.meta)
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load orders",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadOrders()
  }, [page, isAuthenticated, router, toast])

  if (!isAuthenticated) {
    return null
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

  // Render mobile layout on mobile devices
  if (isMobile) {
    return <MobileOrdersPage />
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Order History</h1>
        <p className="text-muted-foreground mb-2">View and track your orders</p>
        <p className="text-sm text-muted-foreground max-w-2xl">
          All your LuxeNest purchases in one place. Track delivery status, access order details, and manage 
          returns. Need help? Our customer service team is available 24/7 at support@luxenest.com or 1-800-LUXENEST.
        </p>
      </div>

      {orders.length === 0 ? (
        <Card className="luxury-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="luxury-card hover:shadow-elevated transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <CardDescription>
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn("text-sm px-4 py-2", status.bgColor, status.color)}
                      >
                        <StatusIcon className="mr-2 h-4 w-4" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Order Items Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex gap-3">
                            <div className="relative aspect-square w-16 h-16 rounded-md border overflow-hidden bg-muted/50">
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="h-full w-full"
                              >
                                <Image
                                  src={item.product.images[0] || "/placeholder.svg"}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                  loading="lazy"
                                  sizes="64px"
                                />
                              </motion.div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-lg font-semibold">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/orders/${order.id}`}>
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= meta.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


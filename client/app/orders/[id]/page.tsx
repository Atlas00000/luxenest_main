"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Package, Truck, Clock, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrderById, type Order } from "@/lib/api/orders"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { MobileOrderDetailPage } from "@/components/pages/orders/mobile-order-detail-page"
import { useMobile } from "@/hooks/use-mobile"

const statusConfig = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  PROCESSING: {
    label: "Processing",
    icon: Package,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  SHIPPED: {
    label: "Shipped",
    icon: Truck,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isMobile = useMobile()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const loadOrder = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const orderData = await getOrderById(id)
        setOrder(orderData)
      } catch (error: any) {
        setError(error.message || "Order not found")
        if (error.statusCode === 404) {
          notFound()
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadOrder()
  }, [id, isAuthenticated, router])

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
    return <MobileOrderDetailPage orderId={id} />
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <p className="text-muted-foreground mb-6">{error || "The order you're looking for doesn't exist."}</p>
          <Button onClick={() => router.push("/orders")}>View All Orders</Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[order.status]
  const StatusIcon = status.icon

  return (
    <div className="container mx-auto px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/orders")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Order Confirmation</h1>
              <p className="text-muted-foreground mt-2">Order #{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Badge
              variant="outline"
              className={cn("text-sm px-4 py-2", status.bgColor, status.borderColor, status.color)}
            >
              <StatusIcon className="mr-2 h-4 w-4" />
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Success Message */}
        {order.status === "PENDING" && (
          <Card className="luxury-card mb-8 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">Order Placed Successfully!</h3>
                  <p className="text-sm text-green-700">
                    Thank you for your purchase. We'll send you a confirmation email shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Items */}
            <Card className="luxury-card">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>{order.items.length} items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative aspect-square w-20 h-20 rounded-md border overflow-hidden bg-muted/50">
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
                        sizes="80px"
                      />
                    </motion.div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} × ${Number(item.price).toFixed(2)}
                    </div>
                  </div>
                  <div className="font-medium">
                    ${(Number(item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
            <Card className="luxury-card">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Order placed on {new Date(order.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{Number(order.shipping) === 0 ? "Free" : `$${Number(order.shipping).toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(order.tax).toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-medium">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod.replace("-", " ")}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  )
}


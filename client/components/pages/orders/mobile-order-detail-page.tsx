"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getOrderById, type Order } from "@/lib/api/orders"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileOrderDetailHeader } from "./mobile-order-detail-header"
import { MobileOrderDetailItems } from "./mobile-order-detail-items"
import { MobileOrderDetailSummary } from "./mobile-order-detail-summary"

interface MobileOrderDetailPageProps {
  orderId: string
}

export function MobileOrderDetailPage({ orderId }: MobileOrderDetailPageProps) {
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
        const orderData = await getOrderById(orderId)
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
  }, [orderId, isAuthenticated, router])

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

  if (error || !order) {
    return (
      <MobilePageLayout>
        <MobilePageContent>
          <div className="text-center py-12">
            <h2 className="text-xl font-bold mb-4">Order not found</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              {error || "The order you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/orders")} size="sm">
              View All Orders
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
        <Button variant="ghost" onClick={() => router.push("/orders")} size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </MobileSection>

      {/* Header */}
      <MobileSection>
        <MobileOrderDetailHeader order={order} />
      </MobileSection>

      {/* Success Message */}
      {order.status === "PENDING" && (
        <MobileSection>
          <div className="luxury-card p-4 rounded-xl border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 text-sm">Order Placed Successfully!</h3>
                <p className="text-xs text-green-700 mt-1">
                  Thank you for your purchase. We'll send you a confirmation email shortly.
                </p>
              </div>
            </div>
          </div>
        </MobileSection>
      )}

      {/* Order Items */}
      <MobileSection>
        <MobileOrderDetailItems items={order.items} />
      </MobileSection>

      {/* Order Summary */}
      <MobileSection>
        <MobileOrderDetailSummary order={order} />
      </MobileSection>

      {/* Action Buttons */}
      <MobileSection>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full" size="lg">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild className="w-full" size="lg">
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </MobileSection>
    </MobilePageLayout>
  )
}


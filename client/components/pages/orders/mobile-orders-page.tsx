"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getUserOrders, type Order } from "@/lib/api/orders"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { MobilePageLayout, MobilePageHeader, MobilePageContent, MobileSection } from "@/components/layouts/mobile-page-layout"
import { MobileOrderCard } from "./mobile-order-card"
import { MobileOrdersEmptyState } from "./mobile-orders-empty-state"

export function MobileOrdersPage() {
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
      <MobilePageLayout>
        <MobilePageContent>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </MobilePageContent>
      </MobilePageLayout>
    )
  }

  return (
    <MobilePageLayout>
      <MobilePageHeader
        title="Order History"
        subtitle="View and track your orders"
        eyebrow="Orders"
      />

      <MobileSection>
        <p className="text-xs text-muted-foreground">
          All your LuxeNest purchases in one place. Track delivery status, access order details, and
          manage returns.
        </p>
      </MobileSection>

      <MobilePageContent>
        {orders.length === 0 ? (
          <MobileOrdersEmptyState />
        ) : (
          <div className="space-y-3">
            {orders.map((order, index) => (
              <MobileOrderCard key={order.id} order={order} index={index} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
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
      </MobilePageContent>
    </MobilePageLayout>
  )
}


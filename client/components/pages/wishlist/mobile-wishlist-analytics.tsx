"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MobileWishlistAnalyticsProps {
  analytics: {
    totalItems: number
    categories: Record<string, number>
    priceRanges: Record<string, number>
    averagePrice: number
    totalValue: number
  }
}

export function MobileWishlistAnalytics({ analytics }: MobileWishlistAnalyticsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card className="luxury-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Items</CardTitle>
            <CardDescription className="text-xs">In your wishlist</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Value</CardTitle>
            <CardDescription className="text-xs">Of wishlist items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Average Price</CardTitle>
            <CardDescription className="text-xs">Per item</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.averagePrice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Categories</CardTitle>
            <CardDescription className="text-xs">Item distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {Object.entries(analytics.categories).slice(0, 3).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Price Distribution</CardTitle>
            <CardDescription className="text-xs">By price range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.priceRanges).map(([range, count]) => (
                <div key={range}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{range}</span>
                    <span className="text-xs font-medium">{count} items</span>
                  </div>
                  <Progress value={(count / analytics.totalItems) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Category Distribution</CardTitle>
            <CardDescription className="text-xs">By category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics.categories).map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{category}</span>
                    <span className="text-xs font-medium">{count} items</span>
                  </div>
                  <Progress value={(count / analytics.totalItems) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


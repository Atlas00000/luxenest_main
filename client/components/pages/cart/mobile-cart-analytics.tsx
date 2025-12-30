"use client"

import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface MobileCartAnalyticsProps {
  analytics: {
    totalSpent: number
    averageOrderValue: number
    itemsPurchased: number
    savings: number
    freeShippingThreshold: number
    currentSpend: number
  }
  progressToFreeShipping: number
}

export function MobileCartAnalytics({
  analytics,
  progressToFreeShipping,
}: MobileCartAnalyticsProps) {
  return (
    <div className="space-y-4">
      <div className="luxury-card p-4 rounded-xl">
        <h3 className="text-base font-medium mb-4">Shopping Stats</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total Spent</span>
              <span className="font-medium">${analytics.totalSpent.toFixed(2)}</span>
            </div>
            <Progress value={75} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Average Order Value</span>
              <span className="font-medium">${analytics.averageOrderValue.toFixed(2)}</span>
            </div>
            <Progress value={60} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Items Purchased</span>
              <span className="font-medium">{analytics.itemsPurchased}</span>
            </div>
            <Progress value={80} className="h-1.5" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total Savings</span>
              <span className="font-medium text-destructive">${analytics.savings.toFixed(2)}</span>
            </div>
            <Progress value={90} className="h-1.5" />
          </div>
        </div>
      </div>

      <div className="luxury-card p-4 rounded-xl">
        <h3 className="text-base font-medium mb-4">Free Shipping Progress</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Current Spend</span>
              <span className="font-medium">${analytics.currentSpend.toFixed(2)}</span>
            </div>
            <Progress value={progressToFreeShipping} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-2">
              Add ${(analytics.freeShippingThreshold - analytics.currentSpend).toFixed(2)} more to
              get free shipping
            </p>
          </div>
          <div className="pt-2">
            <h4 className="text-xs font-medium mb-2">Quick Add Items</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Gift Card
              </Button>
              <Button variant="outline" size="sm" className="w-full text-xs">
                Accessories
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


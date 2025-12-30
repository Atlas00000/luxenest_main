"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { ShippingAddress } from "@/lib/api/orders"

interface MobileCheckoutShippingFormProps {
  shippingAddress: ShippingAddress
  onInputChange: (field: keyof ShippingAddress, value: string) => void
}

export function MobileCheckoutShippingForm({
  shippingAddress,
  onInputChange,
}: MobileCheckoutShippingFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fullName" className="text-sm">
          Full Name *
        </Label>
        <Input
          id="fullName"
          placeholder="John Doe"
          value={shippingAddress.fullName}
          onChange={(e) => onInputChange("fullName", e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="address" className="text-sm">
          Address *
        </Label>
        <Input
          id="address"
          placeholder="123 Main Street"
          value={shippingAddress.address}
          onChange={(e) => onInputChange("address", e.target.value)}
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city" className="text-sm">
            City *
          </Label>
          <Input
            id="city"
            placeholder="New York"
            value={shippingAddress.city}
            onChange={(e) => onInputChange("city", e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="state" className="text-sm">
            State *
          </Label>
          <Input
            id="state"
            placeholder="NY"
            value={shippingAddress.state}
            onChange={(e) => onInputChange("state", e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="zipCode" className="text-sm">
            Zip Code *
          </Label>
          <Input
            id="zipCode"
            placeholder="10001"
            value={shippingAddress.zipCode}
            onChange={(e) => onInputChange("zipCode", e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="country" className="text-sm">
            Country *
          </Label>
          <Input
            id="country"
            placeholder="United States"
            value={shippingAddress.country}
            onChange={(e) => onInputChange("country", e.target.value)}
            required
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm">
          Phone (Optional)
        </Label>
        <Input
          id="phone"
          placeholder="+1 (555) 123-4567"
          value={shippingAddress.phone || ""}
          onChange={(e) => onInputChange("phone", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  )
}


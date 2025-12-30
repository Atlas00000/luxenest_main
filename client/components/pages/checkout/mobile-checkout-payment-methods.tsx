"use client"

import { CreditCard } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const paymentMethods = [
  {
    id: "credit-card",
    name: "Credit Card",
    icon: CreditCard,
    description: "Pay with your credit card",
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: CreditCard,
    description: "Pay with your PayPal account",
  },
]

interface MobileCheckoutPaymentMethodsProps {
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
}

export function MobileCheckoutPaymentMethods({
  paymentMethod,
  onPaymentMethodChange,
}: MobileCheckoutPaymentMethodsProps) {
  return (
    <RadioGroup value={paymentMethod} onValueChange={onPaymentMethodChange} className="space-y-3">
      {paymentMethods.map((method) => {
        const Icon = method.icon
        return (
          <div
            key={method.id}
            className={`flex items-center space-x-3 rounded-lg border p-3 ${
              paymentMethod === method.id ? "border-primary bg-primary/5" : ""
            }`}
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{method.name}</div>
                    <div className="text-xs text-muted-foreground">{method.description}</div>
                  </div>
                </div>
              </div>
            </Label>
          </div>
        )
      })}
    </RadioGroup>
  )
}


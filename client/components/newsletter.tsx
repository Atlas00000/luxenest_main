"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Send, CheckCircle } from "lucide-react"
import { SectionShell } from "@/components/section-shell"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Success!",
      description: "You've been subscribed to our newsletter.",
    })

    setIsSubmitted(true)
    setEmail("")
    setIsSubmitting(false)

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <SectionShell
      eyebrow="Stay Updated"
      title="Join Our Community"
      subtitle="Join over 75,000 design enthusiasts who receive our weekly newsletter. Get exclusive early access to new collections, member-only pricing, design tips from our in-house stylists, and stories from the artisans behind your favorite pieces. Plus, subscribers get 10% off their first order."
    >
      <motion.div
        ref={containerRef}
        style={{ opacity, y }}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto"
      >
        <div className="luxury-card rounded-2xl p-8 md:p-10 text-center bg-gradient-to-br from-primary/5 via-primary/8 to-primary/5">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`pr-10 h-12 ${isSubmitted ? "border-green-500" : ""}`}
                disabled={isSubmitting || isSubmitted}
              />
              {isSubmitted && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
              )}
            </div>
            <Button type="submit" disabled={isSubmitting || isSubmitted} className="h-12 px-6">
              {isSubmitting ? (
                "Subscribing..."
              ) : isSubmitted ? (
                "Subscribed!"
              ) : (
                <>
                  Subscribe
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </motion.div>
    </SectionShell>
  )
}

"use client"

import Link from "next/link"
import { motion, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { SectionShell } from "@/components/section-shell"
import { SustainabilityFeaturesGrid } from "./sustainability/sustainability-features-grid"
import { useSafeScroll } from "@/hooks/use-safe-scroll"

export function SustainabilitySection() {
  const { containerRef, scrollYProgress } = useSafeScroll({
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, 100])

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      <SectionShell
        title="Sustainable Living"
        subtitle="At LuxeNest, sustainability isn't an afterthought—it's woven into every decision we make. From our carbon-neutral shipping to our partnerships with Fair Trade certified suppliers, we're building a future where luxury and environmental responsibility are inseparable. Join over 50,000 conscious consumers who choose LuxeNest for beautiful, sustainable living."
      >
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-primary/5"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div style={{ opacity, y }}>
        {/* Header */}
        <motion.div
          className="mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Sustainable Living
          </h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Building a sustainable future
          </p>
        </motion.div>

        {/* Features Grid */}
        <SustainabilityFeaturesGrid />

        {/* CTA Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button asChild size="lg" className="rounded-full">
              <Link href="/products?sustainable=true">
                Explore Our Sustainable Collection
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
      </SectionShell>
    </div>
  )
}

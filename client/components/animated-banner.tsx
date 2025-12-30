"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AnimatedBanner() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8])

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity, scale }}
      className="relative py-10 md:py-12"
    >
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-r from-background via-background/90 to-background/80 luxury-card">
          <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_rgba(191,149,63,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(24,24,27,0.85),_transparent_55%)]" />

          <div className="relative grid md:grid-cols-[1.5fr_minmax(0,1fr)] gap-10 p-8 md:p-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="space-y-4"
              >
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-primary">
                  Limited Season Drop
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Summer Collection 2025
                </h2>
                <p className="text-sm md:text-base text-muted-foreground max-w-xl">
                  Introducing our most anticipated collection yet—featuring handwoven textiles from Morocco, reclaimed teak furniture from Indonesia, and minimalist lighting from Danish designers. Each piece celebrates warm weather living with sustainable materials and timeless elegance.
                </p>
                <Button asChild className="mt-4 px-7">
                  <Link href="/products" className="group">
                    <span className="flex items-center">
                      Shop the Collection
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Button>
              </motion.div>
            </div>

            <div className="flex justify-center md:justify-end">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative h-44 w-44 md:h-60 md:w-60"
              >
                <div className="absolute inset-0 rounded-full border border-primary/40 bg-primary/5 backdrop-blur-sm" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 via-transparent to-amber-100/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-medium uppercase tracking-[0.25em] text-primary/80">
                    Up to
                  </span>
                  <span className="mt-1 text-4xl md:text-5xl font-semibold text-primary">
                    30% Off
                  </span>
                  <span className="mt-2 text-xs text-muted-foreground">
                    Selected summer pieces
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

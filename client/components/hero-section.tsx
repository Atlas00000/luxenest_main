"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { HeroSlide } from "./hero/hero-slide"
import { HeroIndicators } from "./hero/hero-indicators"

const slides = [
  {
    id: 1,
    title: "Elevate Your Living Space",
    description:
      "Since 2018, LuxeNest has been curating exceptional furniture and home decor from master artisans worldwide. Each piece in our collection is selected for its timeless design, superior craftsmanship, and ability to transform ordinary spaces into extraordinary sanctuaries of comfort and style.",
    image: "/images/hero/slide1.jpg",
    cta: "Shop Collection",
    link: "/products",
    color: "from-primary/25 via-primary/5 to-amber-100/20",
  },
  {
    id: 2,
    title: "Artisan Crafted Luxury",
    description:
      "We partner with over 200 skilled craftspeople across Europe, Asia, and the Americas—from family-owned workshops in Northern Italy to sustainable cooperatives in Scandinavia. Every LuxeNest piece carries the signature of its maker, ensuring authenticity and exceptional quality that endures for generations.",
    image: "/images/hero/slide2.jpg",
    cta: "Explore Artisan",
    link: "/products",
    color: "from-emerald-400/18 via-emerald-500/5 to-teal-200/15",
  },
  {
    id: 3,
    title: "Sustainable Living",
    description:
      "LuxeNest is committed to carbon-neutral operations by 2026. We source 85% of our materials from certified sustainable suppliers, use 100% renewable energy in our warehouses, and have eliminated single-use plastics from our packaging. Beautiful design and environmental responsibility go hand in hand.",
    image: "/images/hero/slide3.jpg",
    cta: "Shop Sustainable",
    link: "/products?sustainable=true",
    color: "from-emerald-300/18 via-lime-200/8 to-primary/18",
  },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
    layoutEffect: false,
  })

  // Parallax scroll effects
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 1.15])

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 7000) // 7 seconds per slide for better appreciation
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="relative w-full h-[100vh] min-h-[600px] overflow-hidden bg-background"
    >
      {/* Slides Container */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait" initial={false}>
          {slides.map(
            (slide, index) =>
              index === current && (
                <HeroSlide
                  key={`${slide.id}-${current}`}
                  slide={slide}
                  isActive={index === current}
                  index={index}
                />
              )
          )}
        </AnimatePresence>
      </div>

      {/* Slide Indicators */}
      <HeroIndicators slides={slides} current={current} onSelect={setCurrent} />
    </motion.section>
  )
}

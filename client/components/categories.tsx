"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { getCategories, type Category } from "@/lib/api/categories"
import { SectionShell } from "@/components/section-shell"
import { CategoriesGrid } from "./categories/categories-grid"
import { Loader2 } from "lucide-react"

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
    layoutEffect: false,
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 1], [80, -30])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories(true) // Get only featured categories
        setCategories(cats)
      } catch (error) {
        console.error("Failed to load categories:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadCategories()
  }, [])

  if (isLoading) {
    return (
      <SectionShell eyebrow="Explore" title="Shop by Category">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      eyebrow="Explore"
      title="Shop by Category"
      subtitle="From handcrafted furniture to artisanal lighting, each category represents years of curation and partnerships with master craftspeople. Our team travels globally to discover exceptional pieces that combine timeless design with modern functionality."
    >
      <motion.div
        ref={containerRef}
        style={{ opacity, y }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <CategoriesGrid categories={categories} />
      </motion.div>
    </SectionShell>
  )
}

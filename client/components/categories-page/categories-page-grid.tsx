"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CategoryPageCard } from "./category-page-card"
import type { Category } from "@/lib/api/categories"

interface CategoriesPageGridProps {
  categories: Category[]
}

export function CategoriesPageGrid({ categories }: CategoriesPageGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No categories found.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {categories.map((category, index) => (
          <CategoryPageCard key={category.id} category={category} index={index} />
        ))}
      </AnimatePresence>
    </div>
  )
}


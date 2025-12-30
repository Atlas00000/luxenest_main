"use client"

import { motion } from "framer-motion"
import { CategoryCard } from "./category-card"
import type { Category } from "@/lib/api/categories"

interface CategoriesGridProps {
  categories: Category[]
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No categories available</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 md:gap-8">
      {categories.map((category, index) => (
        <CategoryCard key={category.id} category={category} index={index} />
      ))}
    </div>
  )
}


"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import type { Category } from "@/lib/api/categories"

interface MobileCategoryHeaderProps {
  category: Category
}

export function MobileCategoryHeader({ category }: MobileCategoryHeaderProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted/50">
        <motion.div
          key={category.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={category.image || "/placeholder.svg"}
            alt={category.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-2xl font-bold text-white mb-2">{category.name}</h1>
          {category.description && (
            <p className="text-white/90 text-sm">{category.description}</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}


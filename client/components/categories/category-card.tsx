"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import type { Category } from "@/lib/api/categories"
import { cn } from "@/lib/utils"

interface CategoryCardProps {
  category: Category
  index: number
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Parallax transforms
  const imageX = useTransform(x, (value) => (value - 50) * 0.15)
  const imageY = useTransform(y, (value) => (value - 50) * 0.15)
  const contentY = useTransform(y, (value) => (value - 50) * 0.05)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100)
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100)
  }

  const handleMouseLeave = () => {
    mouseX.set(50)
    mouseY.set(50)
    setIsHovered(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: "transform" }}
    >
      <Link href={`/categories/${category.slug}`} className="block">
        {/* Organic Container - Not boxy */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            borderRadius: "2rem",
            clipPath: isHovered
              ? "polygon(0% 0%, 100% 0%, 100% 95%, 95% 100%, 0% 100%)"
              : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          animate={
            isHovered
              ? {
                  scale: 1.02,
                  boxShadow: "0 20px 60px rgba(191, 149, 63, 0.3)",
                }
              : {
                  scale: 1,
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                }
          }
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background Gradient Overlay */}
          <motion.div
            className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
            initial={{ opacity: 0.7 }}
            animate={{
              opacity: isHovered ? 0.6 : 0.7,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Luxury Gold Accent Glow */}
          <motion.div
            className="absolute inset-0 z-10"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, 
                rgba(191, 149, 63, 0.2) 0%, 
                transparent 70%)`,
            }}
            animate={{
              opacity: isHovered ? [0.3, 0.6, 0.3] : 0.2,
              scale: isHovered ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 3,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          {/* Image with Parallax */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted/50">
            <motion.div
              style={{ x: imageX, y: imageY }}
              animate={isHovered ? { scale: 1.15 } : { scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <motion.div
                key={`img-${category.id}`}
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
                  loading={index < 3 ? "eager" : "lazy"}
                  priority={index < 3}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              </motion.div>
            </motion.div>

            {/* Animated Mesh Overlay */}
            <motion.div
              className="absolute inset-0 z-10"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(191, 149, 63, 0.1) 0%, 
                  transparent 50%,
                  rgba(191, 149, 63, 0.05) 100%)`,
              }}
              initial={{ opacity: 0.2, rotate: 0 }}
              animate={
                isHovered && imageLoaded
                  ? {
                      opacity: [0.3, 0.6, 0.3],
                      rotate: [0, 5, 0],
                    }
                  : { opacity: 0.2, rotate: 0 }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Content with Parallax */}
          <motion.div
            className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8"
            style={{ y: contentY }}
          >
            {/* Category Name */}
            <motion.h3
              className="font-semibold text-2xl md:text-3xl text-white mb-3"
              animate={{
                y: isHovered ? -5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {category.name}
            </motion.h3>

            {/* Animated Accent Line */}
            <motion.div
              className="h-[3px] bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full mb-4"
              initial={{ width: 0 }}
              whileInView={{ width: "4rem" }}
              viewport={{ once: true }}
              animate={isHovered ? { width: "6rem" } : { width: "4rem" }}
              transition={{ duration: 0.4 }}
            />

            {/* Description with Reveal */}
            {category.description && (
              <motion.p
                className="text-sm md:text-base text-white/90 leading-relaxed mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                animate={
                  isHovered
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0.8, y: 10 }
                }
                transition={{ duration: 0.4 }}
              >
                {category.description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.div
              animate={{
                y: isHovered ? -8 : 0,
                opacity: isHovered ? 1 : 0.9,
              }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 text-primary font-medium text-sm md:text-base group/btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Explore</span>
                <motion.div
                  animate={isHovered ? { x: [0, 4, 0] } : { x: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                </motion.div>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    <Sparkles className="h-4 w-4 text-primary" />
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Product Count Badge */}
            {category._count?.products && (
              <motion.div
                className="absolute top-4 right-4 z-30"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                animate={isHovered ? { scale: 1.1, rotate: [0, 5, -5, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
                  <span className="text-xs font-medium text-primary">
                    {category._count.products} items
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  )
}


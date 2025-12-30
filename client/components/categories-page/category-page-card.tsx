"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Category } from "@/lib/api/categories"

interface CategoryPageCardProps {
  category: Category
  index: number
}

export function CategoryPageCard({ category, index }: CategoryPageCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 3D tilt and parallax transforms
  const rotateX = useTransform(y, (value) => (value - 50) * 0.1)
  const rotateY = useTransform(x, (value) => (50 - value) * 0.1)
  const imageX = useTransform(x, (value) => (value - 50) * 0.2)
  const imageY = useTransform(y, (value) => (value - 50) * 0.2)
  const contentX = useTransform(x, (value) => (value - 50) * 0.1)
  const contentY = useTransform(y, (value) => (value - 50) * 0.1)

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
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.8,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative h-full"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
      }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        animate={
          isHovered
            ? {
                scale: 1.05,
                z: 25,
              }
            : {
                scale: 1,
                z: 0,
              }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full"
      >
        {/* Organic Container */}
        <motion.div
          className="relative overflow-hidden bg-background h-full"
          style={{
            borderRadius: "2.5rem",
            clipPath: isHovered
              ? "polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)"
              : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          animate={
            isHovered
              ? {
                  boxShadow: "0 35px 100px rgba(191, 149, 63, 0.3)",
                }
              : {
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }
          }
          transition={{ duration: 0.5 }}
        >
          <Link href={`/categories/${category.slug}`} className="block h-full">
            {/* Image Container with Parallax */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted/50">
              <motion.div
                style={{ x: imageX, y: imageY }}
                animate={isHovered ? { scale: 1.3 } : { scale: 1 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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

              {/* Luxury Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"
                animate={{
                  opacity: isHovered ? 0.5 : 0.6,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Animated Gold Glow */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 50% 50%, 
                    rgba(191, 149, 63, 0.2) 0%, 
                    transparent 70%)`,
                }}
                animate={{
                  opacity: isHovered ? [0.4, 0.7, 0.4] : 0.3,
                  scale: isHovered ? [1, 1.4, 1] : 1,
                }}
                transition={{
                  duration: 3,
                  repeat: isHovered ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />

              {/* Animated Mesh Overlay */}
              <motion.div
                className="absolute inset-0 z-10"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(191, 149, 63, 0.2) 0%, 
                    transparent 50%,
                    rgba(191, 149, 63, 0.1) 100%)`,
                }}
                animate={
                  isHovered && imageLoaded
                    ? {
                        opacity: [0.4, 0.8, 0.4],
                        rotate: [0, 15, 0],
                      }
                    : { opacity: 0.3, rotate: 0 }
                }
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Featured Badge */}
              {category.featured && (
                <motion.div
                  className="absolute top-4 left-4 z-20"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  animate={
                    isHovered
                      ? {
                          scale: [1, 1.2, 1],
                        }
                      : { scale: 1 }
                  }
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                    <Badge className="px-3 py-1.5 text-xs font-semibold bg-primary/90 shadow-lg">
                      Featured
                    </Badge>
                  </div>
                </motion.div>
              )}

              {/* Content Overlay */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-20"
                style={{ x: contentX, y: contentY }}
                animate={{
                  y: isHovered ? -10 : 0,
                }}
                transition={{ duration: 0.5 }}
              >
                <motion.h2
                  className="text-2xl md:text-3xl font-bold text-white mb-3"
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {category.name}
                </motion.h2>

                {category.description && (
                  <motion.p
                    className="text-white/90 text-sm md:text-base mb-6 line-clamp-2 leading-relaxed"
                    animate={{
                      opacity: isHovered ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    {category.description}
                  </motion.p>
                )}

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="secondary"
                    className="group/btn rounded-full bg-background/95 backdrop-blur-sm hover:bg-background border border-primary/20 hover:border-primary/40 shadow-lg"
                  >
                    <span>Shop Now</span>
                    <motion.div
                      animate={isHovered ? { x: 5 } : { x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </motion.div>
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}


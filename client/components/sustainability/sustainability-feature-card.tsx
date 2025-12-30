"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { LucideIcon, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SustainabilityFeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  link: string
  index: number
  color?: string
}

export function SustainabilityFeatureCard({
  icon: Icon,
  title,
  description,
  link,
  index,
  color = "primary",
}: SustainabilityFeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 3D tilt and parallax transforms
  const rotateX = useTransform(y, (value) => (value - 50) * 0.08)
  const rotateY = useTransform(x, (value) => (50 - value) * 0.08)
  const iconX = useTransform(x, (value) => (value - 50) * 0.15)
  const iconY = useTransform(y, (value) => (value - 50) * 0.15)

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
        delay: index * 0.15,
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
                z: 20,
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
          className="relative overflow-hidden bg-background/80 backdrop-blur-sm h-full"
          style={{
            borderRadius: "2rem",
            clipPath: isHovered
              ? "polygon(3% 0%, 100% 0%, 97% 100%, 0% 100%)"
              : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          animate={
            isHovered
              ? {
                  boxShadow: "0 25px 80px rgba(191, 149, 63, 0.2)",
                }
              : {
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }
          }
          transition={{ duration: 0.5 }}
        >
          {/* Background Gradient Overlay */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, 
                rgba(191, 149, 63, 0.1) 0%, 
                transparent 70%)`,
            }}
            animate={{
              opacity: isHovered ? [0.3, 0.6, 0.3] : 0.2,
              scale: isHovered ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 3,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          {/* Animated Mesh Overlay */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, 
                rgba(191, 149, 63, 0.12) 0%, 
                transparent 50%,
                rgba(191, 149, 63, 0.06) 100%)`,
            }}
            animate={
              isHovered
                ? {
                    opacity: [0.4, 0.7, 0.4],
                    rotate: [0, 10, 0],
                  }
                : { opacity: 0.3, rotate: 0 }
            }
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
            {/* Icon */}
            <motion.div
              className="mb-6"
              style={{ x: iconX, y: iconY }}
              animate={
                isHovered
                  ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0, ease: "easeInOut" }}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="relative h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Icon className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h3
              className={cn(
                "text-xl md:text-2xl font-semibold mb-3 md:mb-4 transition-colors",
                isHovered ? "text-primary" : "text-foreground"
              )}
              animate={{
                y: isHovered ? -2 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h3>

            {/* Description */}
            <motion.p
              className="text-muted-foreground mb-6 flex-1 leading-relaxed"
              animate={{
                opacity: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
            >
              {description}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="link"
                asChild
                className="p-0 group/btn self-start"
              >
                <Link href={link} className="flex items-center gap-2">
                  <span>Learn more</span>
                  <motion.div
                    animate={isHovered ? { x: 5 } : { x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}


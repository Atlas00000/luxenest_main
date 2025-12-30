"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Quote, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  quote: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
  index: number
  isActive: boolean
}

export function TestimonialCard({ testimonial, index, isActive }: TestimonialCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 25, stiffness: 200 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // 3D tilt and parallax transforms
  const rotateX = useTransform(y, (value) => (value - 50) * 0.06)
  const rotateY = useTransform(x, (value) => (50 - value) * 0.06)
  const quoteX = useTransform(x, (value) => (value - 50) * 0.1)
  const quoteY = useTransform(y, (value) => (value - 50) * 0.1)

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
      initial={{ opacity: 0, scale: 0.9, y: 60 }}
      animate={
        isActive
          ? {
              opacity: 1,
              scale: 1,
              y: 0,
            }
          : {
              opacity: 0,
              scale: 0.9,
              y: 60,
            }
      }
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="relative w-full"
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
          isHovered && isActive
            ? {
                scale: 1.02,
                z: 15,
              }
            : {
                scale: 1,
                z: 0,
              }
        }
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        {/* Organic Container */}
        <motion.div
          className="relative overflow-hidden bg-background"
          style={{
            borderRadius: "2.5rem",
            clipPath: isHovered && isActive
              ? "polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%)"
              : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          }}
          animate={
            isHovered && isActive
              ? {
                  boxShadow: "0 30px 90px rgba(191, 149, 63, 0.25)",
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
                rgba(191, 149, 63, 0.08) 0%, 
                transparent 70%)`,
            }}
            animate={{
              opacity: isHovered && isActive ? [0.3, 0.6, 0.3] : 0.2,
              scale: isHovered && isActive ? [1, 1.2, 1] : 1,
            }}
            transition={{
              duration: 4,
              repeat: isHovered && isActive ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          {/* Animated Mesh Overlay */}
          <motion.div
            className="absolute inset-0 z-0"
            style={{
              background: `linear-gradient(135deg, 
                rgba(191, 149, 63, 0.1) 0%, 
                transparent 50%,
                rgba(191, 149, 63, 0.05) 100%)`,
            }}
            animate={
              isHovered && isActive
                ? {
                    opacity: [0.4, 0.7, 0.4],
                    rotate: [0, 5, 0],
                  }
                : { opacity: 0.3, rotate: 0 }
            }
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Content */}
          <div className="relative z-10 p-8 md:p-12 lg:p-16">
            {/* Quote Icon */}
            <motion.div
              className="mb-6"
              animate={
                isHovered && isActive
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Quote className="relative h-12 w-12 md:h-16 md:w-16 text-primary/40" />
              </div>
            </motion.div>

            {/* Quote Text */}
            <motion.blockquote
              style={{ x: quoteX, y: quoteY }}
              className={cn(
                "text-xl md:text-2xl lg:text-3xl font-medium italic mb-8 md:mb-12 leading-relaxed transition-colors",
                isHovered && isActive ? "text-primary" : "text-foreground"
              )}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                "{testimonial.quote}"
              </motion.span>
            </motion.blockquote>

            {/* Author Section */}
            <motion.div
              className="flex items-center gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Avatar with Glow */}
              <motion.div
                className="relative"
                animate={
                  isHovered && isActive
                    ? {
                        scale: 1.1,
                        rotate: [0, 5, -5, 0],
                      }
                    : { scale: 1, rotate: 0 }
                }
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full" />
                <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-2 border-primary/30">
                  <Image
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Sparkles around avatar */}
                {isHovered && isActive && (
                  <motion.div
                    className="absolute -top-2 -right-2"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1, 0], rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5 text-primary" />
                  </motion.div>
                )}
              </motion.div>

              {/* Author Info */}
              <div className="flex-1">
                <motion.div
                  className={cn(
                    "font-semibold text-lg md:text-xl mb-1 transition-colors",
                    isHovered && isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {testimonial.name}
                </motion.div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}


"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"

interface HeroBackgroundProps {
  image: string
  gradientColor: string
  isActive: boolean
}

export function HeroBackground({ image, gradientColor, isActive }: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring for mouse tracking
  const springConfig = { damping: 30, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Parallax transforms
  const imageX = useTransform(x, (value) => (value - 50) * 0.02)
  const imageY = useTransform(y, (value) => (value - 50) * 0.02)
  const gradientX = useTransform(x, (value) => (value - 50) * 0.03)
  const gradientY = useTransform(y, (value) => (value - 50) * 0.03)

  useEffect(() => {
    if (!isActive) return

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        mouseX.set(((clientX - rect.left) / rect.width) * 100)
        mouseY.set(((clientY - rect.top) / rect.height) * 100)
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isActive, mouseX, mouseY])

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Base Image with Parallax */}
      <motion.div
        className="absolute inset-0 bg-muted/50"
        style={{ x: imageX, y: imageY }}
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imageLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="h-full w-full"
        >
          <Image
            src={image || "/placeholder.svg"}
            alt="Hero background"
            fill
            className="object-cover"
            priority
            quality={90}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        </motion.div>
      </motion.div>

      {/* Animated Gradient Overlay with Parallax */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${gradientColor} mix-blend-multiply`}
        style={{ x: gradientX, y: gradientY }}
        animate={
          isActive
            ? {
                opacity: [0.3, 0.5, 0.3],
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }
            : { opacity: 0.3 }
        }
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Depth Layers - Multiple gradient overlays for richness */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 via-background/30 to-transparent"
        animate={
          isActive
            ? {
                opacity: [0.85, 0.9, 0.85],
              }
            : { opacity: 0.85 }
        }
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Luxury Glow Effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, 
            rgba(191, 149, 63, 0.08) 0%, 
            transparent 60%)`,
        }}
        animate={
          isActive
            ? {
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1],
              }
            : { opacity: 0.4, scale: 1 }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Organic Light Rays */}
      <motion.div
        className="absolute inset-0 opacity-20"
        style={{
          background: `conic-gradient(from 0deg at 30% 50%, 
            transparent 0deg, 
            rgba(191, 149, 63, 0.1) 60deg, 
            transparent 120deg, 
            rgba(191, 149, 63, 0.05) 180deg, 
            transparent 240deg)`,
        }}
        animate={
          isActive
            ? {
                rotate: [0, 360],
                opacity: [0.1, 0.25, 0.1],
              }
            : { rotate: 0, opacity: 0.1 }
        }
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}


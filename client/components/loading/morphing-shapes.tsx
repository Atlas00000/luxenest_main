"use client"

import { motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

export function MorphingShapes() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Only generate shapes on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Create multiple morphing shapes - only on client
  const shapes = isMounted
    ? Array.from({ length: 6 }, (_, i) => ({
        id: i,
        size: 200 + Math.random() * 300,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 8 + Math.random() * 4,
        delay: i * 0.5,
      }))
    : []

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            borderRadius: [
              "30% 70% 70% 30% / 30% 30% 70% 70%",
              "70% 30% 30% 70% / 70% 70% 30% 30%",
              "30% 70% 70% 30% / 30% 30% 70% 70%",
            ],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: shape.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: shape.delay,
          }}
        >
          <motion.div
            className="h-full w-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, 
                rgba(191, 149, 63, 0.15), 
                rgba(191, 149, 63, 0.05),
                transparent 70%)`,
              filter: "blur(40px)",
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: shape.duration * 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}


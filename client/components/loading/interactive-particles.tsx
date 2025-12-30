"use client"

import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion"
import { useEffect, useState } from "react"

function Particle({
  particle,
  index,
  influence,
  mouseX,
  mouseY,
}: {
  particle: { id: number; x: number; y: number; size: number }
  index: number
  influence: number
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const offsetX = useTransform(mouseX, (value) => value * influence * 0.3)
  const offsetY = useTransform(mouseY, (value) => value * influence * 0.3)

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: particle.size,
        height: particle.size,
        x: offsetX,
        y: offsetY,
        background: "rgba(191, 149, 63, 0.4)",
        boxShadow: "0 0 10px rgba(191, 149, 63, 0.5)",
      }}
      animate={{
        opacity: [0.3, 0.7, 0.3],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.1,
      }}
    />
  )
}

export function InteractiveParticles() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const [isMounted, setIsMounted] = useState(false)

  // Smooth spring animation for mouse tracking
  const springConfig = { damping: 50, stiffness: 100 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)

  // Only create particles on client to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
    }))
    setParticles(newParticles)
  }, [])

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      mouseX.set((clientX / window.innerWidth) * 100)
      mouseY.set((clientY / window.innerHeight) * 100)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  // Transform particles based on mouse position
  const particleX = useTransform(x, (value) => value - 50)
  const particleY = useTransform(y, (value) => value - 50)

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, index) => {
        const influence = 1 - index / particles.length
        return (
          <Particle
            key={particle.id}
            particle={particle}
            index={index}
            influence={influence}
            mouseX={particleX}
            mouseY={particleY}
          />
        )
      })}

      {/* Central Glow Effect */}
      <motion.div
        className="absolute rounded-full"
        style={{
          left: "50%",
          top: "50%",
          width: 300,
          height: 300,
          x: useTransform(x, (value) => (value - 50) * 2),
          y: useTransform(y, (value) => (value - 50) * 2),
          background: "radial-gradient(circle, rgba(191, 149, 63, 0.2) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  )
}


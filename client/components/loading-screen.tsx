"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MorphingShapes } from "./loading/morphing-shapes"
import { FlowingGradients } from "./loading/flowing-gradients"
import { InteractiveParticles } from "./loading/interactive-particles"
import { LoadingBrand } from "./loading/loading-brand"
import { useLoading } from "@/lib/loading-context"

export function LoadingScreen() {
  const { isLoading } = useLoading()
  const [isVisible, setIsVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Only render on client to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true)
    } else {
      // Delay hiding to allow exit animation
      const timer = setTimeout(() => setIsVisible(false), 800)
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  // Don't render on server
  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-background"
          suppressHydrationWarning
        >
          {/* Background Layers */}
          <FlowingGradients />
          
          {/* Interactive Elements */}
          <InteractiveParticles />
          
          {/* Morphing Shapes */}
          <MorphingShapes />
          
          {/* Brand & Content */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <LoadingBrand />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}


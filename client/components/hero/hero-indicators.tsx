"use client"

import { motion } from "framer-motion"

interface HeroIndicatorsProps {
  slides: Array<{ id: number }>
  current: number
  onSelect: (index: number) => void
}

export function HeroIndicators({ slides, current, onSelect }: HeroIndicatorsProps) {
  return (
    <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-3 z-20">
      {slides.map((_, index) => {
        const isActive = index === current
        return (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className="relative group"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Background Circle */}
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors"
              animate={isActive ? { scale: 1.5 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            {/* Active Indicator */}
            <motion.div
              className="relative w-3 h-3 rounded-full bg-primary"
              animate={isActive ? { scale: 1.2 } : { scale: 0.6 }}
              transition={{ duration: 0.3 }}
            >
              {/* Pulse Effect for Active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </motion.div>
          </button>
        )
      })}
    </div>
  )
}


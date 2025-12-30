"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TestimonialCard } from "./testimonial-card"

interface Testimonial {
  id: number
  name: string
  role: string
  image: string
  quote: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000) // 6 seconds per testimonial

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const next = () => {
    setAutoplay(false)
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setAutoplay(false)
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goTo = (index: number) => {
    setAutoplay(false)
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? 100 : -100,
      scale: 0.9,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: direction > 0 ? -100 : 100,
      scale: 0.9,
    }),
  }

  return (
    <div className="relative max-w-5xl mx-auto">
      {/* Carousel Container */}
      <div className="relative min-h-[400px] md:min-h-[500px]">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          {testimonials.map(
            (testimonial, index) =>
              index === current && (
                <motion.div
                  key={`${testimonial.id}-${current}`}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <TestimonialCard
                    testimonial={testimonial}
                    index={index}
                    isActive={index === current}
                  />
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-10">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={prev}
            className="h-12 w-12 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </motion.div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className="relative group"
              aria-label={`Go to testimonial ${index + 1}`}
            >
              <motion.div
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === current
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/30 hover:bg-primary/50"
                )}
                animate={
                  index === current
                    ? {
                        scale: [1, 1.2, 1],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: 2,
                  repeat: index === current ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
              {/* Pulse effect for active dot */}
              {index === current && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={next}
            className="h-12 w-12 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

function cn(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ")
}


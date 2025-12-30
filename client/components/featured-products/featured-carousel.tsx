"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeaturedProductCard } from "./featured-product-card"
import type { Product } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FeaturedCarouselProps {
  products: Product[]
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const productsPerPage = 4
  const totalPages = Math.ceil(products.length / productsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages)
  }

  useEffect(() => {
    controls.start({
      x: `${-currentIndex * 100}%`,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 35,
        mass: 0.8,
      },
    })
  }, [currentIndex, controls])

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">No featured products available</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute -top-16 right-0 z-10 flex gap-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="h-12 w-12 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
            aria-label="Previous products"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentIndex === totalPages - 1}
            className="h-12 w-12 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all"
            aria-label="Next products"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </motion.div>
      </div>

      {/* Carousel Container */}
      <div className="relative overflow-hidden">
        <motion.div
          ref={containerRef}
          className="flex"
          animate={controls}
          initial={{ x: 0 }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 min-w-full"
            >
              {products
                .slice(pageIndex * productsPerPage, (pageIndex + 1) * productsPerPage)
                .map((product, index) => {
                  const productIndex = pageIndex * productsPerPage + index
                  return (
                    <FeaturedProductCard
                      key={product.id}
                      product={product}
                      index={productIndex}
                    />
                  )
                })}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Elegant Pagination Dots */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="relative group"
              aria-label={`Go to slide ${index + 1}`}
            >
              <motion.div
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-primary/30 hover:bg-primary/50"
                )}
                animate={
                  index === currentIndex
                    ? {
                        scale: [1, 1.2, 1],
                      }
                    : { scale: 1 }
                }
                transition={{
                  duration: 2,
                  repeat: index === currentIndex ? Infinity : 0,
                  ease: "easeInOut",
                }}
              />
              {/* Pulse effect for active dot */}
              {index === currentIndex && (
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
      )}
    </div>
  )
}


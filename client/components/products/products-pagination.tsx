"use client"

import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductsPaginationProps) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("ellipsis")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 w-10 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </motion.div>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isActive = pageNum === currentPage

          return (
            <motion.button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "h-10 w-10 rounded-full text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-background border border-primary/30 hover:border-primary hover:bg-primary/10 text-foreground"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={
                isActive
                  ? {
                      scale: [1, 1.1, 1],
                    }
                  : { scale: 1 }
              }
              transition={{
                duration: 2,
                repeat: isActive ? Infinity : 0,
                ease: "easeInOut",
              }}
              aria-label={`Go to page ${pageNum}`}
            >
              {pageNum}
            </motion.button>
          )
        })}
      </div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-10 w-10 rounded-full border-primary/30 hover:border-primary hover:bg-primary/10 transition-all disabled:opacity-50"
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </motion.div>

      <span className="ml-4 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}


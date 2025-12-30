"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Sparkles } from "lucide-react"

interface HeroContentProps {
  title: string
  description: string
  cta: string
  link: string
  isActive: boolean
}

export function HeroContent({ title, description, cta, link, isActive }: HeroContentProps) {
  const words = title.split(" ")

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      exit={{ opacity: 0, y: -60 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl space-y-8 theme-transition"
    >
      {/* Elegant Accent Line with Animation */}
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={isActive ? { width: "5rem", opacity: 1 } : { width: 0, opacity: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-[4px] overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent rounded-full"
          animate={
            isActive
              ? {
                  x: ["-100%", "100%"],
                }
              : { x: "-100%" }
          }
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatDelay: 3 }}
        />
      </motion.div>

      {/* Title with Staggered Word Animation */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.1]">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={
              isActive
                ? {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                  }
                : { opacity: 0, y: 30, filter: "blur(10px)" }
            }
            transition={{
              duration: 0.8,
              delay: 0.5 + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block mr-4 md:mr-6"
          >
            {word}
          </motion.span>
        ))}
      </h1>

      {/* Description with Fade and Slide */}
      <motion.p
        className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl leading-relaxed font-light"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {description}
      </motion.p>

      {/* Enhanced CTA Button */}
      <motion.div
        className="pt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Button
          asChild
          size="lg"
          className="group relative overflow-hidden px-10 py-6 text-base md:text-lg font-medium rounded-full shadow-elevated hover:shadow-2xl transition-all duration-500"
        >
          <Link href={link}>
            <span className="relative z-10 flex items-center gap-3">
              <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span>{cta}</span>
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
            </span>
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary"
              initial={{ x: "-100%" }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={
                isActive
                  ? {
                      x: ["-200%", "200%"],
                    }
                  : { x: "-200%" }
              }
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
            />
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  )
}


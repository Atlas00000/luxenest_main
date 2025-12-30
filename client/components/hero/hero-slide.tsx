"use client"

import { motion } from "framer-motion"
import { HeroBackground } from "./hero-background"
import { HeroContent } from "./hero-content"

interface Slide {
  id: number
  title: string
  description: string
  image: string
  cta: string
  link: string
  color: string
}

interface HeroSlideProps {
  slide: Slide
  isActive: boolean
  index: number
}

export function HeroSlide({ slide, isActive, index }: HeroSlideProps) {
  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      animate={
        isActive
          ? {
              opacity: 1,
              scale: 1,
              filter: "blur(0px)",
            }
          : {
              opacity: 0,
              scale: 1.05,
              filter: "blur(10px)",
            }
      }
      exit={{ opacity: 0, scale: 0.95, filter: "blur(20px)" }}
      transition={{
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="absolute inset-0"
    >
      {/* Background Layer */}
      <HeroBackground
        image={slide.image}
        gradientColor={slide.color}
        isActive={isActive}
      />

      {/* Content Layer */}
      <div className="relative h-full container mx-auto px-4 md:px-6 lg:px-8 flex flex-col justify-end pb-32 md:pb-40 lg:pb-48">
        <HeroContent
          title={slide.title}
          description={slide.description}
          cta={slide.cta}
          link={slide.link}
          isActive={isActive}
        />
      </div>
    </motion.div>
  )
}


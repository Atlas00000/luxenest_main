"use client"

import { motion } from "framer-motion"
import { SectionShell } from "@/components/section-shell"
import { TestimonialCarousel } from "./testimonials/testimonial-carousel"

const testimonials = [
  {
    id: 1,
    name: "Emma Thompson",
    role: "Principal Designer, Thompson Interiors",
    image: "/images/testimonials/profile1.jpg",
    quote:
      "I've been sourcing from LuxeNest for three years, and they've become an essential partner for my high-end residential projects. Their artisan partnerships mean I can offer clients truly unique pieces—not mass-produced items. The quality is museum-grade, and their sustainability credentials give me confidence when working with environmentally conscious clients. Their white-glove delivery service is flawless.",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Homeowner, San Francisco",
    image: "/images/testimonials/profile2.jpg",
    quote:
      "We completely renovated our Victorian home in 2023 and chose LuxeNest for all our major furniture pieces. Three years later, everything still looks brand new. The reclaimed teak dining table has become the heart of our home, and the custom upholstery has held up beautifully with two kids and a dog. Their design consultation service helped us create a cohesive look throughout the house.",
  },
  {
    id: 3,
    name: "Sophia Rodriguez",
    role: "Award-Winning Architect, Rodriguez & Associates",
    image: "/images/testimonials/profile3.jpg",
    quote:
      "LuxeNest understands that great design is about more than aesthetics—it's about responsible sourcing, ethical production, and lasting quality. I've specified their pieces in luxury hotels, corporate headquarters, and private residences. Their commitment to sustainability aligns with our firm's values, and their products consistently exceed client expectations. The level of craftsmanship rivals pieces I've seen in Milan and Copenhagen.",
  },
]

export function Testimonials() {
  return (
    <SectionShell
      eyebrow="Testimonials"
      title="What Our Clients Say"
      subtitle="Join thousands of satisfied customers who have transformed their spaces with LuxeNest. From award-winning architects to discerning homeowners, our community shares their experiences with our premium furniture and exceptional service."
      className="bg-muted/20"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <TestimonialCarousel testimonials={testimonials} />
      </motion.div>
    </SectionShell>
  )
}

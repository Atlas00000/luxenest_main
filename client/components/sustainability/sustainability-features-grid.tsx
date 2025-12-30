"use client"

import { Leaf, Recycle, Droplets } from "lucide-react"
import { SustainabilityFeatureCard } from "./sustainability-feature-card"

const features = [
  {
    icon: Leaf,
    title: "Sustainable Materials",
    description:
      "We exclusively source FSC-certified hardwoods, GOTS-certified organic cotton, and recycled metals. Our textile partners use natural dyes and water-efficient processes, reducing environmental impact by 60% compared to conventional manufacturing. Every material is traceable from source to your home.",
    link: "/products?sustainable=true",
  },
  {
    icon: Recycle,
    title: "Circular Design",
    description:
      "Our design philosophy prioritizes longevity over trends. We offer a lifetime repair guarantee on all furniture, and our take-back program ensures 95% of materials are recycled or repurposed. Since 2020, we've diverted over 2,000 tons of furniture from landfills through our circular economy initiatives.",
    link: "/products?sustainable=true",
  },
  {
    icon: Droplets,
    title: "Water Conservation",
    description:
      "Through closed-loop water systems and innovative dyeing techniques, our production facilities use 70% less water than industry standards. We've invested $2.5M in water treatment infrastructure, ensuring zero wastewater discharge and supporting local communities' access to clean water.",
    link: "/products?sustainable=true",
  },
]

export function SustainabilityFeaturesGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
      {features.map((feature, index) => (
        <SustainabilityFeatureCard
          key={feature.title}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          link={feature.link}
          index={index}
        />
      ))}
    </div>
  )
}


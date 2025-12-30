"use client"

import { HeroSection } from "@/components/hero-section"
import { Categories } from "@/components/categories"
import { FeaturedProductsSection } from "@/components/featured-products-section"
import { TrendingSection } from "@/components/trending-section"
import { Newsletter } from "@/components/newsletter"
import { AiRecommendations } from "@/components/ai-recommendations"
import { SustainabilitySection } from "@/components/sustainability-section"
import { Testimonials } from "@/components/testimonials"
import { ShopTheRoom } from "@/components/shop-the-room"
import { AnimatedBanner } from "@/components/animated-banner"
import { ChatBot } from "@/components/chat-bot"

/**
 * Desktop Homepage Layout
 * Desktop-optimized structure with larger spacing and layouts
 */
export function DesktopHomepage() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <HeroSection />
      <Categories />
      <FeaturedProductsSection />
      <AnimatedBanner />
      <ShopTheRoom />
      <TrendingSection />
      <Testimonials />
      <SustainabilitySection />
      <AiRecommendations />
      <Newsletter />
      <ChatBot />
    </div>
  )
}


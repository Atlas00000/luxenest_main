"use client"

import { MobileLayout, MobileSection } from "@/components/layouts/mobile-layout"
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
 * Mobile Homepage Layout
 * Dedicated mobile-optimized structure using the current mobile view
 * This preserves the mobile-first design that looks good
 */
export function MobileHomepage() {
  return (
    <MobileLayout className="min-h-screen">
      {/* Hero Section - Full width on mobile */}
      <MobileSection fullWidth>
        <HeroSection />
      </MobileSection>

      {/* Categories - Optimized for mobile scrolling */}
      <MobileSection>
        <Categories />
      </MobileSection>

      {/* Featured Products - Mobile carousel */}
      <MobileSection>
        <FeaturedProductsSection />
      </MobileSection>

      {/* Animated Banner - Mobile optimized */}
      <MobileSection fullWidth>
        <AnimatedBanner />
      </MobileSection>

      {/* Shop the Room - Mobile touch-friendly */}
      <MobileSection>
        <ShopTheRoom />
      </MobileSection>

      {/* Trending Products - Mobile grid */}
      <MobileSection>
        <TrendingSection />
      </MobileSection>

      {/* Testimonials - Mobile carousel */}
      <MobileSection>
        <Testimonials />
      </MobileSection>

      {/* Sustainability - Mobile cards */}
      <MobileSection>
        <SustainabilitySection />
      </MobileSection>

      {/* AI Recommendations - Mobile optimized */}
      <MobileSection>
        <AiRecommendations />
      </MobileSection>

      {/* Newsletter - Mobile form */}
      <MobileSection>
        <Newsletter />
      </MobileSection>

      {/* ChatBot - Mobile floating button */}
      <ChatBot />
    </MobileLayout>
  )
}


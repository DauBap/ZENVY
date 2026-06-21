import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { HeroSection } from '@/components/home/hero-section'
import { TrustSection } from '@/components/home/trust-section'
import { FeaturedReaders } from '@/components/home/featured-readers'
import { HowItWorks } from '@/components/home/how-it-works'
import { AITarotSection } from '@/components/home/ai-tarot-section'
import { TestimonialsSection } from '@/components/home/testimonials-section'
import { FAQSection } from '@/components/home/faq-section'

export default function HomePage() {
  return (
    <>
      <CosmicBackground />
      <Header />
      
      <main className="relative">
        <HeroSection />
        <TrustSection />
        <FeaturedReaders />
        <HowItWorks />
        <AITarotSection />
        <TestimonialsSection />
        <FAQSection />
      </main>

      <Footer />
      <MobileNav />
    </>
  )
}

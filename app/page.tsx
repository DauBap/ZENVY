import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { serializeReaders, serializePlatformStat, serializeTestimonials, serializeFAQ } from '@/lib/serializers'
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
import { platformStats as fallbackStats, readers as fallbackReaders, testimonials as fallbackTestimonials, faqData as fallbackFAQ } from '@/lib/data'

// Fallback platform stat shape for serializer
import type { SerializedPlatformStat } from '@/lib/serializers'

function getFallbackPlatformStat(): SerializedPlatformStat {
  return {
    id: 1,
    totalSessions: fallbackStats.totalSessions,
    averageRating: fallbackStats.averageRating,
    verifiedReaders: fallbackStats.verifiedReaders,
    avgResponseTime: fallbackStats.avgResponseTime,
    satisfactionRate: fallbackStats.satisfactionRate,
    onlineReaders: fallbackStats.onlineReaders,
  }
}

export default async function HomePage() {
  redirect('/readers')

  // Fetch all data in parallel, fall back to mock data on DB error
  const [dbReaders, dbStat, dbTestimonials, dbFAQs] = await Promise.allSettled([
    prisma.readerInfo.findMany({
      orderBy: { rating: 'desc' },
      take: 10,
    }),
    prisma.platformStat.findFirst(),
    prisma.testimonial.findMany({ take: 4 }),
    prisma.fAQ.findMany(),
  ])

  const readers = dbReaders.status === 'fulfilled' && (dbReaders as any).value.length > 0
    ? serializeReaders((dbReaders as any).value)
    : fallbackReaders as any

  const platformStat = dbStat.status === 'fulfilled' && (dbStat as any).value
    ? serializePlatformStat((dbStat as any).value)
    : getFallbackPlatformStat()

  const testimonials = dbTestimonials.status === 'fulfilled' && (dbTestimonials as any).value.length > 0
    ? serializeTestimonials((dbTestimonials as any).value)
    : fallbackTestimonials as any

  const faqData = dbFAQs.status === 'fulfilled' && (dbFAQs as any).value.length > 0
    ? serializeFAQ((dbFAQs as any).value)
    : fallbackFAQ.map((f, i) => ({ id: i + 1, ...f })) as any

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative">
        <HeroSection readers={readers} platformStats={platformStat} />
        <TrustSection platformStats={platformStat} />
        <FeaturedReaders readers={readers} />
        <HowItWorks />
        <AITarotSection />
        <TestimonialsSection testimonials={testimonials} />
        <FAQSection faqData={faqData} />
      </main>

      <Footer />
      <MobileNav />
    </>
  )
}

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

import type { SerializedPlatformStat } from '@/lib/serializers'

export default async function HomePage() {
  // Fetch all data in parallel from the database
  const [dbReaders, dbStat, dbTestimonials, dbFAQs] = await Promise.allSettled([
    prisma.readerInfo.findMany({
      where: { verified: true }, // Chỉ lấy readers đã được duyệt
      orderBy: { rating: 'desc' },
      take: 10,
      include: {
        packages: true,
        _count: { select: { reviews: true, session_reviews: true } },
      },
    }),
    prisma.platformStat.findFirst(),
    prisma.testimonial.findMany({ take: 4 }),
    prisma.fAQ.findMany(),
  ])

  const readers = dbReaders.status === 'fulfilled'
    ? serializeReaders((dbReaders as any).value)
    : []

  const platformStat = dbStat.status === 'fulfilled' && (dbStat as any).value
    ? serializePlatformStat((dbStat as any).value)
    : {
        id: 1,
        totalSessions: 0,
        averageRating: 0,
        verifiedReaders: 0,
        avgResponseTime: '0s',
        satisfactionRate: 0,
        onlineReaders: 0,
      }

  const testimonials = dbTestimonials.status === 'fulfilled'
    ? serializeTestimonials((dbTestimonials as any).value)
    : []

  const faqData = dbFAQs.status === 'fulfilled'
    ? serializeFAQ((dbFAQs as any).value)
    : []

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

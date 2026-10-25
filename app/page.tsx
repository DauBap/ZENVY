import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { serializeReaderListings, serializePlatformStat, serializeTestimonials, serializeFAQ } from '@/lib/serializers'
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

export const metadata: Metadata = {
  title: 'Xem Tarot Online & Đặt Lịch Reader Chuyên Nghiệp',
  description: 'Xem tarot online, đặt lịch tư vấn tình yêu và sự nghiệp với Tarot Reader được xác minh. Trải nghiệm AI Tarot miễn phí tại SAGETO.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: 'SAGETO | Xem Tarot Online & Đặt Lịch Reader Chuyên Nghiệp',
    description: 'Xem tarot online, đặt lịch tư vấn với Tarot Reader được xác minh hoặc trải nghiệm AI Tarot miễn phí.',
    siteName: 'SAGETO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAGETO | Xem Tarot Online',
    description: 'Đặt lịch tư vấn với Tarot Reader được xác minh hoặc trải nghiệm AI Tarot miễn phí.',
  },
}

export default async function HomePage() {
  // Fetch all data in parallel from the database
  const [dbReaders, dbStat, dbTestimonials, dbFAQs] = await Promise.allSettled([
    prisma.readerInfo.findMany({
      where: { verified: true }, // Chỉ lấy readers đã được duyệt
      orderBy: { rating: 'desc' },
      take: 10,
      select: {
        id: true,
        display_name: true,
        description: true,
        price_per_session: true,
        rating: true,
        verified: true,
        avatar_url: true,
        specialty: true,
        last_seen_at: true,
        updated_at: true,
        packages: { select: { id: true, price: true } },
        _count: { select: { reviews: true, session_reviews: true } },
      },
    }),
    prisma.platformStat.findFirst(),
    prisma.testimonial.findMany({ take: 4 }),
    prisma.fAQ.findMany(),
  ])

  const readers = dbReaders.status === 'fulfilled'
    ? serializeReaderListings(dbReaders.value)
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

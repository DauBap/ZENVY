import { prisma } from '@/lib/prisma'
import { serializeReaderListings, type SerializedReaderListing } from '@/lib/serializers'
import { specialties as SPECIALTIES } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { ReadersPage } from '@/components/readers/readers-page'

export const metadata = {
  title: 'Đặt Lịch Tarot Online Với Reader Chuyên Nghiệp',
  description: 'Tìm Tarot Reader phù hợp và đặt lịch xem tarot online về tình yêu, sự nghiệp, tài chính. Xem hồ sơ, đánh giá và mức phí trước khi đặt.',
  alternates: {
    canonical: '/readers',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/readers',
    title: 'Đặt Lịch Tarot Online Với Reader Chuyên Nghiệp | SAGETO',
    description: 'Tìm Tarot Reader phù hợp và đặt lịch xem tarot online về tình yêu, sự nghiệp, tài chính.',
    siteName: 'SAGETO',
  },
}

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function ReadersRoutePage() {
  const specialties = SPECIALTIES
  let readers: SerializedReaderListing[] = []

  try {
    const dbReaders = await prisma.readerInfo.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { rating: 'desc' },
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
        _count: {
          select: {
            reviews: true,
            session_reviews: true,
          },
        },
      },
    })

    readers = serializeReaderListings(dbReaders)
  } catch (error) {
    console.error('ReadersRoutePage failed:', error)
  }

  return (
    <>
      <CosmicBackground />
      <Header />
      <ReadersPage readers={readers} specialties={specialties} />
      <Footer />
      <MobileNav />
    </>
  )
}

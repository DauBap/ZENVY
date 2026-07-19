import { prisma } from '@/lib/prisma'
import { serializeReaders } from '@/lib/serializers'
import { recomputeReaderRating } from '@/lib/rating'
import { specialties as SPECIALTIES } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { ReadersPage } from '@/components/readers/readers-page'

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function ReadersRoutePage() {
  let readers: any[] = []
  const specialties = SPECIALTIES

  try {
    const dbReaders = await prisma.readerInfo.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { rating: 'desc' },
      include: {
        packages: true,
        // Fix: _count.select chỉ nhận boolean — không được truyền where vào đây
        // Đếm tổng bookings và session_reviews, không filter theo status
        _count: {
          select: {
            reviews: true,
            session_reviews: true,
            earnings: true,
            bookings: true,
          },
        },
      },
    })

    if (dbReaders.length > 0) {
      // Recompute rating cho tất cả readers từ session_reviews thực tế
      await Promise.all(dbReaders.map(r => recomputeReaderRating(r.id).catch(() => {})))

      // Fetch lại sau khi recompute để có rating đúng
      const updatedReaders = await prisma.readerInfo.findMany({
        where: { status: 'ACTIVE' },
        orderBy: { rating: 'desc' },
        include: {
          packages: true,
          _count: {
            select: {
              reviews: true,
              session_reviews: true,
              earnings: true,
              bookings: true,
            },
          },
        },
      })
      readers = serializeReaders(updatedReaders)
    }
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

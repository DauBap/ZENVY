import { prisma } from '@/lib/prisma'
import { serializeReaders } from '@/lib/serializers'
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
      orderBy: { rating: 'desc' },
      include: {
        packages: true,
        _count: { select: { session_reviews: true } },
      },
    })

    if (dbReaders.length > 0) {
      readers = serializeReaders(dbReaders)
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

import { prisma } from '@/lib/prisma'
import { serializeReaders } from '@/lib/serializers'
import { readers as fallbackReaders, specialties as fallbackSpecialties } from '@/lib/data'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { ReadersPage } from '@/components/readers/readers-page'

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function ReadersRoutePage() {
  let readers: any[]
  let specialties: string[]

  try {
    const dbReaders = await prisma.readerInfo.findMany({
      orderBy: { rating: 'desc' },
      include: { packages: true },
    })

    if (dbReaders.length > 0) {
      readers = serializeReaders(dbReaders)
      specialties = fallbackSpecialties
    } else {
      readers = fallbackReaders as any
      specialties = fallbackSpecialties
    }
  } catch {
    readers = fallbackReaders as any
    specialties = fallbackSpecialties
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

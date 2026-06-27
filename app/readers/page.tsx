import { prisma } from '@/lib/prisma'
import { serializeReaders } from '@/lib/serializers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { ReadersPage } from '@/components/readers/readers-page'

export default async function ReadersRoutePage() {
  const readers = await prisma.reader.findMany({
    orderBy: { rating: 'desc' },
  })

  const serializedReaders = serializeReaders(readers)
  const specialties = Array.from(
    new Set(readers.flatMap((reader) => reader.specialty))
  ).sort()

  return (
    <>
      <CosmicBackground />
      <Header />
      <ReadersPage readers={serializedReaders} specialties={specialties} />
      <Footer />
      <MobileNav />
    </>
  )
}

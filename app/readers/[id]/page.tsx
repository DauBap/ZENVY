import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeReader } from '@/lib/serializers'
import { ReaderProfilePage } from '@/components/readers/reader-profile-page'

interface ReaderRoutePageProps {
  params: {
    id: string
  }
}

export default async function ReaderRoutePage({ params }: ReaderRoutePageProps) {
  const reader = await prisma.reader.findUnique({
    where: { id: params.id },
    include: {
      packages: true,
      reviews: true,
      availability: true,
    },
  })

  if (!reader) {
    return notFound()
  }

  const serializedReader = serializeReader(reader)

  return <ReaderProfilePage reader={serializedReader} />
}


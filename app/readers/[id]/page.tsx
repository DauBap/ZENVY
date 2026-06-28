import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeReader } from '@/lib/serializers'
import { ReaderProfilePage } from '@/components/readers/reader-profile-page'

export default async function ReaderRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const reader = await prisma.readerInfo.findUnique({
    where: { id: Number(id) },
    include: { packages: true, reviews: true, availability: true },
  })

  if (!reader) return notFound()

  return <ReaderProfilePage reader={serializeReader(reader)} />
}

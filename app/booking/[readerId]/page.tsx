import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeReader } from '@/lib/serializers'
import { BookingClient } from '@/components/booking/booking-page'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ readerId: string }>
}) {
  const { readerId } = await params

  const reader = await prisma.readerInfo.findUnique({
    where: { id: Number(readerId) },
    include: { packages: true, availability: true },
  })

  if (!reader) return notFound()

  return <BookingClient reader={serializeReader(reader)} />
}

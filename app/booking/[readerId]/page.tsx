import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeReader } from '@/lib/serializers'
import { BookingClient } from '@/components/booking/booking-page'
import { getSession } from '@/lib/auth'

export default async function BookingPage({
  params,
}: {
  params: Promise<{ readerId: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/readers?login=1')

  const { readerId } = await params

  const reader = await prisma.readerInfo.findUnique({
    where: { id: Number(readerId) },
    include: { packages: true, availability: true },
  })

  if (!reader) return notFound()

  // Các slot đã bị chiếm bởi booking ở mọi trạng thái trừ CANCELLED
  // → ngăn double-booking ở mọi giai đoạn thanh toán
  const confirmed = await prisma.booking.findMany({
    where: {
      reader_id: Number(readerId),
      status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'] },
    },
    select: { date: true, time: true },
  })
  const takenSlots = confirmed.map((b) => `${b.date.toISOString().split('T')[0]} ${b.time}`)

  return <BookingClient reader={serializeReader(reader)} takenSlots={takenSlots} />
}

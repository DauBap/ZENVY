import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { serializeReader } from '@/lib/serializers'
import { recomputeReaderRating } from '@/lib/rating'
import { expireStalePendingBookings } from '@/lib/bookings'
import { ReaderProfilePage } from '@/components/readers/reader-profile-page'

export default async function ReaderRoutePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const reader = await prisma.readerInfo.findUnique({
    where: { id: Number(id) },
    include: { packages: true, availability: true, _count: { select: { reviews: true, session_reviews: true } } },
  })

  if (!reader) return notFound()

  // Recompute rating từ actual reviews trước khi serialize
  await recomputeReaderRating(reader.id).catch(() => {})

  // Fetch lại để có rating mới nhất
  const updatedReader = await prisma.readerInfo.findUnique({
    where: { id: Number(id) },
    include: { packages: true, availability: true, _count: { select: { reviews: true, session_reviews: true } } },
  })
  if (!updatedReader) return notFound()

  // Lấy các slot đã bị đặt (trừ CANCELLED) để loại khỏi lịch trống hiển thị
  const now = new Date()
  const todayVN = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0]
  const currentTimeVN = (() => {
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000)
    return `${String(vnNow.getUTCHours()).padStart(2, '0')}:${String(vnNow.getUTCMinutes()).padStart(2, '0')}`
  })()

  // Giải phóng slot bị giữ bởi booking PENDING quá hạn thanh toán
  await expireStalePendingBookings(updatedReader.user_id).catch(() => {})

  const activeBookings = await prisma.booking.findMany({
    where: {
      provider_id: updatedReader.user_id,
      status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'] },
    },
    select: { date: true, time: true },
  })
  // Set tra cứu nhanh: "YYYY-MM-DD HH:MM"
  const takenSet = new Set(
    activeBookings.map((b) => `${b.date.toISOString().split('T')[0]} ${b.time}`)
  )

  // Lọc availability: bỏ ngày quá khứ, bỏ giờ đã qua hôm nay, bỏ slot đã đặt
  const filteredAvailability = updatedReader.availability
    .map((a) => {
      const dateStr = a.date.toISOString().split('T')[0]
      const slots = a.slots.filter((slot) => {
        if (dateStr < todayVN) return false
        if (dateStr === todayVN && slot <= currentTimeVN) return false
        if (takenSet.has(`${dateStr} ${slot}`)) return false
        return true
      })
      return { ...a, slots }
    })
    .filter((a) => a.slots.length > 0)

  const readerWithFilteredAvailability = { ...updatedReader, availability: filteredAvailability }

  return <ReaderProfilePage reader={serializeReader(readerWithFilteredAvailability)} />
}

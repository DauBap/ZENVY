import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

// POST /api/bookings/[id]/complete — Provider đánh dấu hoàn thành phiên
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const bookingId = Number(id)
    const userId = Number(session.sub)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: true },
    })

    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    if (booking.provider_id !== userId)
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
    if (booking.status === 'COMPLETED')
      return NextResponse.json({ error: 'Phiên đã hoàn thành trước đó.' }, { status: 400 })
    if (booking.status === 'CANCELLED')
      return NextResponse.json({ error: 'Phiên đã bị hủy.' }, { status: 400 })

    // Get provider's reader info
    const providerReaderInfo = await prisma.readerInfo.findUnique({
      where: { user_id: booking.provider_id },
      select: { id: true },
    })
    if (!providerReaderInfo) {
      return NextResponse.json({ error: 'Provider không phải là Reader.' }, { status: 400 })
    }

    // Đánh dấu COMPLETED
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    })

    // Ghi sổ thu nhập (idempotent)
    await prisma.readerEarning.upsert({
      where: { booking_id: bookingId },
      update: {},
      create: {
        booking_id: bookingId,
        reader_id: providerReaderInfo.id,
        amount: booking.package.price ?? 0, // Use actual price
      },
    }).catch(() => {}) // ignore nếu đã có

    createNotification({
      userId: booking.requester_id,
      title: 'Phiên tarot đã hoàn thành 🌙',
      content: 'Phiên hẹn của bạn đã được đánh dấu hoàn thành. Hãy để lại đánh giá cho reader nhé!',
      type: 'BOOKING_COMPLETED',
      link: '/dashboard',
    }).catch(() => {})

    createNotification({
      userId: booking.provider_id,
      title: 'Thu nhập đã được cộng 💰',
      content: 'Phiên hẹn đã hoàn thành và số dư của bạn đã được cập nhật.',
      type: 'BOOKING_COMPLETED',
      link: '/dashboard',
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      booking: { id: updated.id, status: updated.status },
      reviewRequired: true, // frontend biết cần gửi yêu cầu đánh giá
    })
  } catch (e) {
    console.error('Complete booking error:', e)
    return NextResponse.json({ error: 'Thao tác thất bại.' }, { status: 500 })
  }
}

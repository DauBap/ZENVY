import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/bookings/[id]/complete — Reader đánh dấu hoàn thành phiên
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    if (session.role !== 'READER') return NextResponse.json({ error: 'Chỉ reader mới thực hiện được.' }, { status: 403 })

    const { id } = await params
    const bookingId = Number(id)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { reader: { select: { user_id: true } } },
    })

    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    if (booking.reader.user_id !== Number(session.sub))
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
    if (booking.status === 'COMPLETED')
      return NextResponse.json({ error: 'Phiên đã hoàn thành trước đó.' }, { status: 400 })
    if (booking.status === 'CANCELLED')
      return NextResponse.json({ error: 'Phiên đã bị hủy.' }, { status: 400 })

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
        reader_id: booking.reader_id,
        amount: booking.package_id, // sẽ override bên dưới
      },
    }).catch(() => {}) // ignore nếu đã có

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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000      // Vietnam UTC+7, no DST
const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000

// Ghép date (midnight UTC, @db.Date) + time "HH:MM" (giờ địa phương VN) → mốc thời gian thực (UTC instant)
function getAppointmentInstant(date: Date, time: string): Date {
  const [hh, mm] = time.split(':').map((n) => Number(n))
  const asIfUtc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    hh || 0,
    mm || 0,
    0,
    0
  )
  return new Date(asIfUtc - ICT_OFFSET_MS)
}

// PATCH /api/bookings/[id] — xác nhận / hủy lịch
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = Number(id)
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Mã lịch hẹn không hợp lệ.' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const action = body?.action as 'confirm' | 'cancel' | undefined
    const reasonRaw = typeof body?.reason === 'string' ? body.reason.trim() : ''

    if (action !== 'confirm' && action !== 'cancel') {
      return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { user_id: true } },
        reader: { select: { user_id: true } },
      },
    })
    if (!booking) {
      return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    }

    const userId = Number(session.sub)
    const isOwnerCustomer = booking.customer?.user_id === userId
    const isOwnerReader = booking.reader?.user_id === userId

    // ── CUSTOMER: chỉ được hủy lịch của mình, trước giờ hẹn ít nhất 24h ──────────
    if (session.role === 'CUSTOMER') {
      if (!isOwnerCustomer) {
        return NextResponse.json({ error: 'Bạn không có quyền với lịch hẹn này.' }, { status: 403 })
      }
      if (action !== 'cancel') {
        return NextResponse.json({ error: 'Khách hàng chỉ có thể hủy lịch.' }, { status: 403 })
      }
      if (booking.status === 'CANCELLED') {
        return NextResponse.json({ error: 'Lịch hẹn đã được hủy trước đó.' }, { status: 409 })
      }
      if (booking.status === 'COMPLETED') {
        return NextResponse.json({ error: 'Không thể hủy lịch hẹn đã hoàn thành.' }, { status: 409 })
      }

      const appt = getAppointmentInstant(booking.date, booking.time)
      if (appt.getTime() - Date.now() <= CANCEL_WINDOW_MS) {
        return NextResponse.json(
          { error: 'Chỉ có thể hủy lịch trước giờ hẹn ít nhất 24 giờ.' },
          { status: 422 }
        )
      }

      const result = await prisma.booking.updateMany({
        where: { id: bookingId, status: booking.status },
        data: { status: 'CANCELLED', cancel_reason: null },
      })
      if (result.count === 0) {
        return NextResponse.json({ error: 'Trạng thái lịch hẹn đã thay đổi. Vui lòng tải lại.' }, { status: 409 })
      }
      return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CANCELLED' } })
    }

    // ── READER: xác nhận lịch PENDING, hoặc hủy lịch PENDING/CONFIRMED kèm lý do ──
    if (session.role === 'READER') {
      if (!isOwnerReader) {
        return NextResponse.json({ error: 'Bạn không có quyền với lịch hẹn này.' }, { status: 403 })
      }

      if (action === 'confirm') {
        if (booking.status !== 'PENDING') {
          return NextResponse.json({ error: 'Chỉ có thể xác nhận lịch đang chờ.' }, { status: 409 })
        }
        const result = await prisma.booking.updateMany({
          where: { id: bookingId, status: 'PENDING' },
          data: { status: 'CONFIRMED' },
        })
        if (result.count === 0) {
          return NextResponse.json({ error: 'Trạng thái lịch hẹn đã thay đổi. Vui lòng tải lại.' }, { status: 409 })
        }
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CONFIRMED' } })
      }

      // action === 'cancel'
      if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
        return NextResponse.json(
          { error: 'Chỉ có thể hủy lịch đang chờ hoặc đã xác nhận.' },
          { status: 409 }
        )
      }
      if (!reasonRaw) {
        return NextResponse.json({ error: 'Vui lòng nhập lý do hủy.' }, { status: 400 })
      }
      const result = await prisma.booking.updateMany({
        where: { id: bookingId, status: booking.status },
        data: { status: 'CANCELLED', cancel_reason: reasonRaw },
      })
      if (result.count === 0) {
        return NextResponse.json({ error: 'Trạng thái lịch hẹn đã thay đổi. Vui lòng tải lại.' }, { status: 409 })
      }
      return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CANCELLED' } })
    }

    return NextResponse.json({ error: 'Vai trò không được hỗ trợ.' }, { status: 403 })
  } catch (error) {
    console.error('Booking PATCH error:', error)
    return NextResponse.json({ error: 'Cập nhật lịch hẹn thất bại.' }, { status: 500 })
  }
}

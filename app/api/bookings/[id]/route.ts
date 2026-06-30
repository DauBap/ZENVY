import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// ===========================================================================
// FLOW:
//   PENDING (user đặt)
//   → PAYMENT_CONFIRMED  (admin xác nhận đã nhận tiền)
//   → CONFIRMED          (reader xác nhận sẽ thực hiện)
//   → COMPLETED          (reader đánh dấu hoàn thành + ghi sổ thu)
//   → CANCELLED          (ai cũng có thể hủy, reader/admin cần lý do)
// ===========================================================================

const ICT_OFFSET_MS = 7 * 60 * 60 * 1000
const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000

function getAppointmentInstant(date: Date, time: string): Date {
  const [hh, mm] = time.split(':').map(Number)
  const asIfUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), hh || 0, mm || 0)
  return new Date(asIfUtc - ICT_OFFSET_MS)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const bookingId = Number(id)
    if (!Number.isInteger(bookingId) || bookingId <= 0)
      return NextResponse.json({ error: 'Mã lịch hẹn không hợp lệ.' }, { status: 400 })

    const body = await request.json().catch(() => null)
    const action = body?.action as string | undefined
    const reasonRaw = typeof body?.reason === 'string' ? body.reason.trim() : ''

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { user_id: true } },
        reader: { select: { user_id: true } },
      },
    })
    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })

    const userId = Number(session.sub)
    const isCustomer = booking.customer?.user_id === userId
    const isReader   = booking.reader?.user_id === userId

    // ── CUSTOMER ─────────────────────────────────────────────────────────────
    if (session.role === 'CUSTOMER') {
      if (!isCustomer)
        return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })
      if (action !== 'cancel')
        return NextResponse.json({ error: 'Khách hàng chỉ có thể hủy lịch.' }, { status: 403 })
      if (booking.status === 'CANCELLED')
        return NextResponse.json({ error: 'Lịch đã hủy trước đó.' }, { status: 409 })
      if (booking.status === 'COMPLETED')
        return NextResponse.json({ error: 'Không thể hủy lịch đã hoàn thành.' }, { status: 409 })

      // Mọi trạng thái còn hiệu lực đều chỉ hủy được khi còn > 24h tới giờ hẹn
      const appt = getAppointmentInstant(booking.date, booking.time)
      if (appt.getTime() - Date.now() <= CANCEL_WINDOW_MS)
        return NextResponse.json({ error: 'Chỉ có thể hủy lịch trước giờ hẹn ít nhất 24 giờ.' }, { status: 422 })

      await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', cancel_reason: null } })
      return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CANCELLED' } })
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    if (session.role === 'ADMIN') {
      if (action === 'payment_confirm') {
        // Admin xác nhận đã nhận tiền → chuyển PENDING → PAYMENT_CONFIRMED
        if (booking.status !== 'PENDING')
          return NextResponse.json({ error: 'Chỉ xác nhận thanh toán cho lịch đang chờ.' }, { status: 409 })
        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'PAYMENT_CONFIRMED' } })
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'PAYMENT_CONFIRMED' } })
      }

      if (action === 'cancel') {
        if (booking.status === 'COMPLETED')
          return NextResponse.json({ error: 'Không thể hủy lịch đã hoàn thành.' }, { status: 409 })
        if (!reasonRaw)
          return NextResponse.json({ error: 'Vui lòng nhập lý do hủy.' }, { status: 400 })
        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', cancel_reason: reasonRaw } })
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CANCELLED' } })
      }

      // Admin có thể force bất kỳ status hợp lệ (từ admin panel)
      const validStatuses = ['PENDING','PAYMENT_CONFIRMED','CONFIRMED','COMPLETED','CANCELLED']
      if (body?.status && validStatuses.includes(body.status)) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: body.status, ...(body.cancel_reason && { cancel_reason: body.cancel_reason }) },
        })
        return NextResponse.json({ success: true, booking: { id: bookingId, status: body.status } })
      }

      return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })
    }

    // ── READER ────────────────────────────────────────────────────────────────
    if (session.role === 'READER') {
      if (!isReader)
        return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

      if (action === 'confirm') {
        // Reader xác nhận booking — chấp nhận cả PENDING (khách vừa đặt)
        // và PAYMENT_CONFIRMED (admin đã duyệt TT) → CONFIRMED
        if (booking.status !== 'PENDING' && booking.status !== 'PAYMENT_CONFIRMED')
          return NextResponse.json({
            error: 'Chỉ xác nhận được lịch đang chờ hoặc đã duyệt thanh toán.',
          }, { status: 409 })

        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CONFIRMED' } })
      }

      if (action === 'complete') {
        if (booking.status !== 'CONFIRMED')
          return NextResponse.json({ error: 'Chỉ hoàn thành được lịch đã xác nhận.' }, { status: 409 })

        // Lấy giá gói — snapshot tại thời điểm hoàn thành (không dùng giá hiện tại)
        const pkg = await prisma.package.findUnique({
          where: { id: booking.package_id },
          select: { price: true },
        })
        const amount = pkg?.price ?? 0

        try {
          await prisma.$transaction(async (tx) => {
            // 1. Cập nhật booking → COMPLETED với optimistic lock (tránh double-complete)
            const r = await tx.booking.updateMany({
              where: { id: bookingId, status: 'CONFIRMED' },
              data: { status: 'COMPLETED' },
            })
            if (r.count === 0) throw new Error('STATUS_CHANGED')

            // 2. Ghi sổ thu nhập — idempotent qua booking_id @unique
            //    amount là snapshot Package.price lúc hoàn thành
            await tx.readerEarning.create({
              data: {
                booking_id: bookingId,
                reader_id: booking.reader_id,
                amount,
              },
            })

            // 3. Cộng tiền vào balance của reader (atomic increment)
            await tx.readerInfo.update({
              where: { id: booking.reader_id },
              data: { balance: { increment: amount } },
            })
          })
        } catch (e) {
          // P2002 = unique constraint → earnings đã ghi rồi (idempotent)
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')
            return NextResponse.json({ success: true, booking: { id: bookingId, status: 'COMPLETED' } })
          if (e instanceof Error && e.message === 'STATUS_CHANGED')
            return NextResponse.json({ error: 'Trạng thái đã thay đổi. Tải lại trang.' }, { status: 409 })
          throw e
        }
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'COMPLETED' }, amount })
      }

      if (action === 'cancel') {
        if (!['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'].includes(booking.status))
          return NextResponse.json({ error: 'Chỉ hủy được lịch chưa hoàn thành.' }, { status: 409 })
        if (!reasonRaw)
          return NextResponse.json({ error: 'Vui lòng nhập lý do hủy.' }, { status: 400 })
        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', cancel_reason: reasonRaw } })
        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'CANCELLED' } })
      }

      return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Vai trò không được hỗ trợ.' }, { status: 403 })
  } catch (error) {
    console.error('Booking PATCH error:', error)
    return NextResponse.json({ error: 'Cập nhật lịch hẹn thất bại.' }, { status: 500 })
  }
}

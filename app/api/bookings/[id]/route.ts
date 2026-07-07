import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

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

        createNotification({
          userId: booking.reader.user_id,
          title: 'Có lịch hẹn mới cần xác nhận',
          content: `Lịch hẹn vào ${booking.date.toISOString().split('T')[0]} lúc ${booking.time} đã được admin duyệt thanh toán. Bạn có thể xác nhận trong dashboard.`,
          type: 'BOOKING_CONFIRMED',
          link: '/dashboard',
        }).catch(() => {})

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

        if (body.status === 'CONFIRMED') {
          createNotification({
            userId: booking.customer.user_id,
            title: 'Lịch hẹn đã được xác nhận ✅',
            content: `Lịch hẹn của bạn đã được cập nhật sang trạng thái đã xác nhận.`,
            type: 'BOOKING_CONFIRMED',
            link: '/dashboard',
          }).catch(() => {})
        }

        if (body.status === 'COMPLETED') {
          createNotification({
            userId: booking.customer.user_id,
            title: 'Phiên tarot đã hoàn thành 🌙',
            content: `Phiên hẹn đã được đánh dấu hoàn thành. Hãy để lại đánh giá cho reader nhé!`,
            type: 'BOOKING_COMPLETED',
            link: '/dashboard',
          }).catch(() => {})

          createNotification({
            userId: booking.reader.user_id,
            title: 'Thu nhập đã được cộng 💰',
            content: `Phiên hẹn đã được hoàn thành và số dư của bạn đã được cập nhật.`,
            type: 'BOOKING_COMPLETED',
            link: '/dashboard',
          }).catch(() => {})
        }

        return NextResponse.json({ success: true, booking: { id: bookingId, status: body.status } })
      }

      return NextResponse.json({ error: 'Hành động không hợp lệ.' }, { status: 400 })
    }

    // ── READER ────────────────────────────────────────────────────────────────
    if (session.role === 'READER') {
      if (!isReader)
        return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

      if (action === 'confirm') {
        // Reader chỉ được xác nhận sau khi admin đã duyệt thanh toán
        if (booking.status !== 'PAYMENT_CONFIRMED')
          return NextResponse.json({
            error: 'Chỉ xác nhận được lịch đã được admin duyệt thanh toán.',
          }, { status: 409 })

        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CONFIRMED' } })

        // Thông báo cho customer
        createNotification({
          userId: booking.customer.user_id,
          title: 'Lịch hẹn đã được xác nhận ✅',
          content: `Reader đã xác nhận lịch hẹn của bạn vào ${booking.date.toISOString().split('T')[0]} lúc ${booking.time}.`,
          type: 'BOOKING_CONFIRMED',
          link: '/dashboard',
        }).catch(() => {})

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

        // Thông báo cho customer: phiên đã hoàn thành
        createNotification({
          userId: booking.customer.user_id,
          title: 'Phiên tarot đã hoàn thành 🌙',
          content: `Phiên hẹn ngày ${booking.date.toISOString().split('T')[0]} lúc ${booking.time} đã hoàn thành. Hãy để lại đánh giá nhé!`,
          type: 'BOOKING_COMPLETED',
          link: '/dashboard',
        }).catch(() => {})

        // Thông báo cho reader: đã ghi nhận thu nhập
        createNotification({
          userId: booking.reader.user_id,
          title: 'Thu nhập đã được cộng 💰',
          content: `Phiên hẹn ngày ${booking.date.toISOString().split('T')[0]} lúc ${booking.time} hoàn thành. ${(amount / 1000).toFixed(0)}k₫ đã được cộng vào số dư.`,
          type: 'BOOKING_COMPLETED',
          link: '/dashboard',
        }).catch(() => {})

        return NextResponse.json({ success: true, booking: { id: bookingId, status: 'COMPLETED' }, amount })
      }

      if (action === 'cancel') {
        if (!['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'].includes(booking.status))
          return NextResponse.json({ error: 'Chỉ hủy được lịch chưa hoàn thành.' }, { status: 409 })
        if (!reasonRaw)
          return NextResponse.json({ error: 'Vui lòng nhập lý do hủy.' }, { status: 400 })
        await prisma.booking.update({ where: { id: bookingId }, data: { status: 'CANCELLED', cancel_reason: reasonRaw } })

        // Thông báo cho customer khi reader hủy
        createNotification({
          userId: booking.customer.user_id,
          title: 'Lịch hẹn đã bị hủy ❌',
          content: `Lịch hẹn ngày ${booking.date.toISOString().split('T')[0]} lúc ${booking.time} đã bị hủy. Lý do: ${reasonRaw}`,
          type: 'BOOKING_CANCELLED',
          link: '/dashboard',
        }).catch(() => {})

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

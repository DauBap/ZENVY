import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { createNotificationForAdmins } from '@/lib/notifications'
import { notifyAdminNewBooking } from '@/lib/email'

// POST /api/bookings — tạo booking mới
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { readerId, packageId, date, time } = await request.json()

    if (!readerId || !packageId || !date || !time) {
      return NextResponse.json({ error: 'Thiếu thông tin đặt lịch.' }, { status: 400 })
    }

    // Lấy customer_info từ user
    const customerInfo = await prisma.customerInfo.findUnique({
      where: { user_id: Number(session.sub) },
    })

    if (!customerInfo) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin khách hàng.' }, { status: 404 })
    }

    // Chỉ cho đặt vào ngày + giờ reader đã bật (lịch trống)
    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: 'Ngày đặt lịch không hợp lệ.' }, { status: 400 })
    }
    const avail = await prisma.availability.findFirst({
      where: { reader_id: Number(readerId), date: bookingDate },
      select: { slots: true },
    })
    if (!avail || !avail.slots.includes(time)) {
      return NextResponse.json(
        { error: 'Khung giờ này không còn trống. Vui lòng chọn lại.' },
        { status: 409 }
      )
    }

    // Chặn đặt slot đã qua giờ (theo giờ VN UTC+7)
    const ICT_OFFSET_MS = 7 * 60 * 60 * 1000
    const [bhh, bmm] = String(time).split(':').map(Number)
    const slotStartMs =
      Date.UTC(bookingDate.getUTCFullYear(), bookingDate.getUTCMonth(), bookingDate.getUTCDate(), bhh || 0, bmm || 0) - ICT_OFFSET_MS
    if (slotStartMs <= Date.now()) {
      return NextResponse.json(
        { error: 'Khung giờ này đã qua. Vui lòng chọn lại.' },
        { status: 409 }
      )
    }

    // Chặn nếu slot (ngày + giờ) đã có booking CONFIRMED cho khách khác
    const taken = await prisma.booking.findFirst({
      where: { reader_id: Number(readerId), date: bookingDate, time, status: 'CONFIRMED' },
      select: { id: true },
    })
    if (taken) {
      return NextResponse.json(
        { error: 'Khung giờ này đã có người đặt. Vui lòng chọn lại.' },
        { status: 409 }
      )
    }

    // Chống trùng: khách này đã có booking đang chờ/đã xác nhận cho đúng slot này
    const dup = await prisma.booking.findFirst({
      where: {
        customer_id: customerInfo.id,
        reader_id: Number(readerId),
        date: bookingDate,
        time,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    })
    if (dup) {
      return NextResponse.json(
        { error: 'Bạn đã đặt khung giờ này rồi.' },
        { status: 409 }
      )
    }

    const bookingCreatePayload = {
      data: {
        customer_id: customerInfo.id,
        reader_id: Number(readerId),
        package_id: Number(packageId),
        date: new Date(date),
        time,
        status: 'PENDING' as const,
      },
      include: {
        reader: { select: { display_name: true, avatar_url: true, user_id: true } },
        package: { select: { name: true, duration: true, price: true } },
        customer: { select: { user: { select: { id: true } } } },
      },
    }

    let booking
    try {
      booking = await prisma.booking.create(bookingCreatePayload)
    } catch (error) {
      const errorCode = (error as { code?: string }).code
      const metaTarget = (error as { meta?: { target?: unknown } }).meta?.target
      const isIdConflict =
        errorCode === 'P2002' &&
        ((Array.isArray(metaTarget) && metaTarget.includes('id')) ||
          (typeof metaTarget === 'string' && metaTarget.includes('id')) ||
          (error instanceof Error && error.message.includes('Unique constraint failed on the fields: (`id`)')))

      if (!isIdConflict) {
        throw error
      }

      await prisma.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"bookings"', 'id'), COALESCE((SELECT MAX(id) + 1 FROM "bookings"), 1), false)`
      )
      booking = await prisma.booking.create(bookingCreatePayload)
    }

    // Gửi thông báo cho admin để duyệt trước khi booking được chuyển tới reader
    createNotificationForAdmins({
      title: 'Có lịch hẹn mới cần duyệt',
      content: `Khách hàng vừa đặt lịch cho gói ${booking.package.name} vào ${new Date(booking.date).toLocaleDateString('vi-VN')} lúc ${booking.time}. `,
      type: 'SYSTEM',
      link: '/admin/bookings',
    }).catch(() => {})

    // ✅ Gửi email thông báo cho admin
    const user = await prisma.user.findUnique({
      where: { id: Number(session.sub) },
      select: { name: true },
    })

    await notifyAdminNewBooking({
      customerName: user?.name || customerInfo.fullname || 'Guest',
      readerName: booking.reader.display_name || 'Unknown Reader',
      date: new Date(booking.date).toISOString().split('T')[0],
      time: booking.time,
      bookingId: booking.id,
      adminEmail: process.env.ADMIN_EMAIL || 'sageto.support@gmail.com',
    }).catch((err) => console.error('Email error:', err))

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Đặt lịch thất bại.', detail: msg }, { status: 500 })
  }
}

// GET /api/bookings — lấy danh sách booking của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerInfo = await prisma.customerInfo.findUnique({
      where: { user_id: Number(session.sub) },
    })

    if (!customerInfo) {
      return NextResponse.json({ bookings: [] })
    }

    const bookings = await prisma.booking.findMany({
      where: { customer_id: customerInfo.id },
      include: {
        reader: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
        package: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    // Serialize dates
    const serialized = bookings.map((b) => ({
      ...b,
      date: b.date.toISOString().split('T')[0],
      created_at: b.created_at.toISOString(),
      updated_at: b.updated_at.toISOString(),
    }))

    return NextResponse.json({ bookings: serialized })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

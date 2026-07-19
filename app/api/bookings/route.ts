import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { expireStalePendingBookings } from '@/lib/bookings'

// POST /api/bookings — tạo booking mới
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { readerId, providerId, packageId, date, time, couponCode } = await request.json()

    if (!packageId || !date || !time) {
      return NextResponse.json({ error: 'Thiếu thông tin đặt lịch.' }, { status: 400 })
    }

    const requesterId = Number(session.sub)
    let providerUserId: number

    // Support both old readerId and new providerId
    if (providerId) {
      providerUserId = Number(providerId)
    } else if (readerId) {
      // Convert old ReaderInfo.id to User.id
      const readerInfo = await prisma.readerInfo.findUnique({
        where: { id: Number(readerId) },
        select: { user_id: true },
      })
      if (!readerInfo) {
        return NextResponse.json({ error: 'Không tìm thấy Reader.' }, { status: 404 })
      }
      providerUserId = readerInfo.user_id
    } else {
      return NextResponse.json({ error: 'Thiếu thông tin Provider.' }, { status: 400 })
    }

    if (requesterId === providerUserId) {
      return NextResponse.json({ error: 'Không thể đặt lịch với chính mình.' }, { status: 400 })
    }

    // Get provider reader info
    const providerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: providerUserId },
      select: { id: true, display_name: true, avatar_url: true },
    })

    if (!providerInfo) {
      return NextResponse.json({ error: 'Người dùng không phải là Reader.' }, { status: 400 })
    }

    // Giải phóng các slot bị giữ bởi booking PENDING quá hạn thanh toán trước khi kiểm tra
    await expireStalePendingBookings(providerUserId).catch(() => {})

    // Chỉ cho đặt vào ngày + giờ reader đã bật (lịch trống)
    const bookingDate = new Date(date)
    if (isNaN(bookingDate.getTime())) {
      return NextResponse.json({ error: 'Ngày đặt lịch không hợp lệ.' }, { status: 400 })
    }
    const avail = await prisma.availability.findFirst({
      where: { reader_id: providerInfo.id, date: bookingDate },
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

    // Nếu CHÍNH khách này đã có booking cho đúng slot:
    //  - PENDING còn hạn giữ chỗ → tái dùng booking cũ (client sẽ lấy lại QR cũ), KHÔNG tạo mới
    //  - PAYMENT_CONFIRMED/CONFIRMED → đã trả tiền rồi → báo đã đặt
    // (PENDING quá hạn đã bị expireStalePendingBookings hủy ở trên → không lọt vào đây)
    const own = await prisma.booking.findFirst({
      where: {
        requester_id: requesterId,
        provider_id: providerUserId,
        date: bookingDate,
        time,
        status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'] },
      },
      select: { id: true, status: true },
    })
    if (own) {
      if (own.status === 'PENDING') {
        return NextResponse.json({ success: true, booking: { id: own.id }, reused: true }, { status: 200 })
      }
      return NextResponse.json({ error: 'Bạn đã đặt khung giờ này rồi.' }, { status: 409 })
    }

    // Chặn nếu slot đã bị giữ bởi khách KHÁC (kể cả PENDING đang chờ trả tiền)
    const taken = await prisma.booking.findFirst({
      where: {
        provider_id: providerUserId,
        date: bookingDate,
        time,
        status: { in: ['PENDING', 'PAYMENT_CONFIRMED', 'CONFIRMED'] },
        requester_id: { not: requesterId },
      },
      select: { id: true },
    })
    if (taken) {
      return NextResponse.json(
        { error: 'Khung giờ này đã có người đặt. Vui lòng chọn lại.' },
        { status: 409 }
      )
    }

    // Validate coupon nếu có
    let couponId: number | null = null
    let discountAmount = 0
    let finalPrice: number | null = null

    if (couponCode && typeof couponCode === 'string') {
      const code = couponCode.trim().toUpperCase()
      const coupon = await prisma.coupon.findUnique({ where: { code } })

      if (!coupon) {
        return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại.' }, { status: 400 })
      }
      if (!coupon.active) {
        return NextResponse.json({ error: 'Mã khuyến mãi đã bị vô hiệu hóa.' }, { status: 400 })
      }
      const now = new Date()
      if (coupon.start_date && coupon.start_date > now) {
        return NextResponse.json({ error: 'Mã khuyến mãi chưa đến ngày hiệu lực.' }, { status: 400 })
      }
      if (coupon.end_date && coupon.end_date < now) {
        return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn.' }, { status: 400 })
      }
      if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
        return NextResponse.json({ error: 'Mã khuyến mãi đã hết lượt sử dụng.' }, { status: 400 })
      }

      // Lấy giá gói để tính discount
      const pkg = await prisma.package.findUnique({ where: { id: Number(packageId) }, select: { price: true } })
      const originalPrice = pkg?.price ?? 0

      if (coupon.discount_type === 'PERCENTAGE') {
        discountAmount = Math.floor(originalPrice * coupon.discount_value / 100)
      } else {
        discountAmount = Math.min(coupon.discount_value, originalPrice)
      }
      finalPrice = Math.max(0, originalPrice - discountAmount)
      couponId = coupon.id
    }

    const bookingCreatePayload = {
      data: {
        requester_id: requesterId,
        provider_id: providerUserId,
        requester_role: 'CUSTOMER',
        provider_role: 'READER',
        package_id: Number(packageId),
        date: new Date(date),
        time,
        status: 'PENDING' as const,
        ...(couponId !== null && {
          coupon_id: couponId,
          discount_amount: discountAmount,
          final_price: finalPrice,
        }),
      },
      include: {
        provider: { select: { email: true } },
        package: { select: { name: true, duration: true, price: true } },
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

    // Lưu ý: KHÔNG tăng used_count coupon và KHÔNG báo admin ở đây.
    // Booking mới chỉ là "giữ chỗ chờ thanh toán" (PENDING) — mọi side-effect
    // (tăng lượt coupon, thông báo admin) được dời sang confirmBookingPaid,
    // chạy khi PayOS xác nhận đã trả tiền. Tránh tiêu lượt coupon cho lịch chưa trả.

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

    const userId = Number(session.sub)

    // Fix: dùng include trực tiếp thay vì N+1 query (1 query thay vì N+1)
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { requester_id: userId },
          { provider_id: userId },
        ],
      },
      include: {
        provider: {
          select: {
            id: true,
            reader_info: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
          },
        },
        requester: {
          select: {
            id: true,
            reader_info: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
          },
        },
        package: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
      // Giới hạn 200 booking gần nhất để tránh phình bộ nhớ
      take: 200,
    })

    const serialized = bookings.map((b) => {
      const isRequester = b.requester_id === userId
      const other = isRequester ? b.provider : b.requester
      return {
        ...b,
        // payos_order_code là BigInt → JSON.stringify sẽ throw; đổi sang Number (an toàn < 2^53)
        payos_order_code: b.payos_order_code !== null ? Number(b.payos_order_code) : null,
        otherUserId: other?.id,
        otherUserName: other?.reader_info?.display_name || 'Unknown',
        otherUserAvatar: other?.reader_info?.avatar_url || null,
        otherUserVerified: other?.reader_info?.verified || false,
        date: b.date.toISOString().split('T')[0],
        created_at: b.created_at.toISOString(),
        updated_at: b.updated_at.toISOString(),
      }
    })

    return NextResponse.json({ bookings: serialized })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

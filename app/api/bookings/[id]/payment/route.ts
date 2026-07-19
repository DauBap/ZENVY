import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import {
  payos,
  isPayosConfigured,
  generateOrderCode,
  buildPaymentDescription,
  markBookingPaidByOrderCode,
  confirmBookingPaid,
} from '@/lib/payos'
import { PAYMENT_HOLD_MS } from '@/lib/bookings'

// ===========================================================================
// POST /api/bookings/[id]/payment
//   Tạo (hoặc lấy lại) payment link PayOS cho booking đang PENDING.
//   Trả về { checkoutUrl } để client redirect sang trang thanh toán PayOS.
//
// GET  /api/bookings/[id]/payment
//   Đồng bộ trạng thái từ PayOS (dùng khi user quay lại từ returnUrl,
//   phòng khi webhook chưa kịp tới — đặc biệt ở môi trường dev).
// ===========================================================================

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { package: { select: { name: true, price: true } } },
    })
    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })

    // Chỉ khách hàng đặt lịch mới được thanh toán
    if (booking.requester_id !== Number(session.sub))
      return NextResponse.json({ error: 'Bạn không có quyền thanh toán lịch hẹn này.' }, { status: 403 })

    if (booking.status !== 'PENDING')
      return NextResponse.json({ error: 'Lịch hẹn này không ở trạng thái chờ thanh toán.' }, { status: 409 })

    // Số tiền phải trả: ưu tiên giá sau giảm (coupon), fallback giá gói.
    // amount < 0 là dữ liệu lỗi; amount = 0 là gói miễn phí (xử lý bên dưới).
    const amount = booking.final_price ?? booking.package.price
    if (amount < 0)
      return NextResponse.json({ error: 'Số tiền thanh toán không hợp lệ.' }, { status: 400 })

    // Mốc hết hạn giữ chỗ (epoch ms) — bám theo created_at để tái dùng không reset đồng hồ
    const expiresAt = booking.created_at.getTime() + PAYMENT_HOLD_MS

    // Gói miễn phí (hoặc coupon giảm 100%) → bỏ qua PayOS, xác nhận luôn
    if (amount === 0) {
      await confirmBookingPaid(bookingId)
      return NextResponse.json({ free: true, status: 'PAYMENT_CONFIRMED' })
    }

    // Từ đây trở đi cần cổng thanh toán
    if (!isPayosConfigured) {
      return NextResponse.json(
        { error: 'Cổng thanh toán chưa được cấu hình. Vui lòng liên hệ quản trị viên.' },
        { status: 503 }
      )
    }

    // Nếu đã có link còn hiệu lực → tái sử dụng, tránh tạo trùng orderCode
    if (booking.payos_order_code && booking.payos_checkout_url && booking.payos_qr) {
      try {
        const existing = await payos.paymentRequests.get(Number(booking.payos_order_code))
        if (existing.status === 'PENDING') {
          return NextResponse.json({
            checkoutUrl: booking.payos_checkout_url,
            qrCode: booking.payos_qr,
            accountNumber: booking.payos_account_no,
            accountName: booking.payos_account_name,
            bin: booking.payos_bin,
            amount: booking.payos_amount ?? amount,
            description: buildPaymentDescription(bookingId),
            expiresAt,
          })
        }
      } catch {
        // link cũ không lấy được → tạo link mới bên dưới
      }
    }

    const orderCode = generateOrderCode()

    // QR hết hạn cùng lúc với thời gian giữ chỗ (PENDING tự hủy sau PAYMENT_HOLD_MS)
    const expiredAt = Math.floor((Date.now() + PAYMENT_HOLD_MS) / 1000)

    const link = await payos.paymentRequests.create({
      orderCode,
      amount,
      description: buildPaymentDescription(bookingId),
      returnUrl: `${APP_URL}/booking/return?bookingId=${bookingId}`,
      cancelUrl: `${APP_URL}/booking/return?bookingId=${bookingId}&cancelled=1`,
      expiredAt,
    })

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        payos_order_code: BigInt(orderCode),
        payos_checkout_url: link.checkoutUrl,
        payos_link_id: link.paymentLinkId,
        payos_qr: link.qrCode,
        payos_account_no: link.accountNumber,
        payos_account_name: link.accountName,
        payos_bin: link.bin,
        payos_amount: link.amount,
      },
    })

    return NextResponse.json({
      checkoutUrl: link.checkoutUrl,
      qrCode: link.qrCode,
      accountNumber: link.accountNumber,
      accountName: link.accountName,
      bin: link.bin,
      amount: link.amount,
      description: link.description,
      expiresAt,
    })
  } catch (error) {
    console.error('PayOS create payment error:', error)
    return NextResponse.json({ error: 'Không tạo được liên kết thanh toán.' }, { status: 500 })
  }
}

export async function GET(
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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, requester_id: true, status: true, payos_order_code: true },
    })
    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    if (booking.requester_id !== Number(session.sub))
      return NextResponse.json({ error: 'Không có quyền.' }, { status: 403 })

    // Nếu vẫn PENDING và có PayOS order → hỏi PayOS xem đã trả tiền chưa (fallback cho webhook)
    if (booking.status === 'PENDING' && booking.payos_order_code && isPayosConfigured) {
      try {
        const link = await payos.paymentRequests.get(Number(booking.payos_order_code))
        if (link.status === 'PAID') {
          await markBookingPaidByOrderCode(booking.payos_order_code)
          return NextResponse.json({ status: 'PAYMENT_CONFIRMED' })
        }
        return NextResponse.json({ status: booking.status, payosStatus: link.status })
      } catch {
        // không lấy được → trả trạng thái hiện tại
      }
    }

    return NextResponse.json({ status: booking.status })
  } catch (error) {
    console.error('PayOS sync payment error:', error)
    return NextResponse.json({ error: 'Không kiểm tra được trạng thái thanh toán.' }, { status: 500 })
  }
}

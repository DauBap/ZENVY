import { PayOS } from '@payos/node'
import { prisma } from '@/lib/prisma'
import { createNotification, createNotificationForAdmins } from '@/lib/notifications'

// ── PayOS client (singleton) ─────────────────────────────────────────────────
// Credentials lấy tại https://my.payos.vn → Kênh thanh toán → Thông tin xác thực API
const clientId = process.env.PAYOS_CLIENT_ID
const apiKey = process.env.PAYOS_API_KEY
const checksumKey = process.env.PAYOS_CHECKSUM_KEY

const globalForPayos = globalThis as unknown as { payos?: PayOS }

export const isPayosConfigured = Boolean(clientId && apiKey && checksumKey)

function createPayos(): PayOS {
  if (!isPayosConfigured) {
    throw new Error(
      'PayOS chưa được cấu hình. Thiếu PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY trong môi trường.'
    )
  }
  return new PayOS({ clientId, apiKey, checksumKey })
}

export const payos: PayOS = globalForPayos.payos ?? (isPayosConfigured ? createPayos() : (undefined as unknown as PayOS))

if (process.env.NODE_ENV !== 'production' && isPayosConfigured) {
  globalForPayos.payos = payos
}

// ── Tiện ích ──────────────────────────────────────────────────────────────────

/**
 * Tạo orderCode duy nhất cho PayOS.
 * PayOS yêu cầu orderCode là số nguyên dương, duy nhất theo từng kênh thanh toán.
 * Dùng epoch (giây) + 3 chữ số ngẫu nhiên để tránh trùng khi tạo gần nhau.
 */
export function generateOrderCode(): number {
  const seconds = Math.floor(Date.now() / 1000)
  const rand = Math.floor(Math.random() * 1000)
  // 10 chữ số epoch * 1000 + rand → vẫn nằm trong khoảng an toàn của Number/BigInt
  return seconds * 1000 + rand
}

/**
 * PayOS giới hạn description tối đa 25 ký tự.
 */
export function buildPaymentDescription(bookingId: number): string {
  const desc = `SAGETO #${bookingId}`
  return desc.length > 25 ? desc.slice(0, 25) : desc
}

/**
 * Chuyển booking PENDING → PAYMENT_CONFIRMED theo bookingId + gửi thông báo/email.
 * Idempotent nhờ optimistic lock (chỉ update khi đang PENDING).
 * Dùng chung cho: thanh toán PayOS thành công, và gói miễn phí (amount = 0).
 * Trả về true nếu lần gọi này thực sự chuyển trạng thái.
 */
export async function confirmBookingPaid(bookingId: number): Promise<boolean> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      provider_id: true,
      date: true,
      time: true,
      status: true,
      coupon_id: true,
      package: { select: { name: true } },
    },
  })
  if (!booking) return false

  // Chỉ chuyển khi đang PENDING — optimistic lock tránh double-fire (webhook + return)
  const r = await prisma.booking.updateMany({
    where: { id: booking.id, status: 'PENDING' },
    data: { status: 'PAYMENT_CONFIRMED' },
  })
  if (r.count === 0) return false // đã xử lý trước đó hoặc không còn ở PENDING

  const dateStr = booking.date.toISOString().split('T')[0]

  // Tăng lượt dùng coupon — chỉ khi đã thực sự trả tiền (không tiêu lượt cho lịch bỏ dở)
  if (booking.coupon_id !== null) {
    prisma.coupon.update({
      where: { id: booking.coupon_id },
      data: { used_count: { increment: 1 } },
    }).catch(() => {})
  }

  // Thông báo cho reader: có lịch đã thanh toán, chờ xác nhận
  createNotification({
    userId: booking.provider_id,
    title: 'Có lịch hẹn mới cần xác nhận',
    content: `Lịch hẹn vào ${dateStr} lúc ${booking.time} đã được thanh toán. Bạn có thể xác nhận trong dashboard.`,
    type: 'BOOKING_CONFIRMED',
    link: '/dashboard',
  }).catch(() => {})

  // Thông báo cho admin: có lịch đã thanh toán cần theo dõi
  createNotificationForAdmins({
    title: 'Có lịch hẹn mới đã thanh toán',
    content: `Khách hàng vừa thanh toán gói ${booking.package.name} vào ${dateStr} lúc ${booking.time}.`,
    type: 'SYSTEM',
    link: '/admin/bookings',
  }).catch(() => {})

  return true
}

/**
 * Đánh dấu booking đã thanh toán theo orderCode PayOS (từ webhook / sync-on-return).
 */
export async function markBookingPaidByOrderCode(orderCode: number | bigint): Promise<boolean> {
  const booking = await prisma.booking.findUnique({
    where: { payos_order_code: BigInt(orderCode) },
    select: { id: true },
  })
  if (!booking) return false
  return confirmBookingPaid(booking.id)
}

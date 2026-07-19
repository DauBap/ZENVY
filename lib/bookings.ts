import { prisma } from '@/lib/prisma'

// Thời gian giữ chỗ cho booking PENDING (chưa thanh toán).
// Quá hạn này mà chưa trả tiền → tự hủy, trả slot lại cho người khác.
export const PAYMENT_HOLD_MS = 15 * 60 * 1000

/**
 * Tự hủy các booking PENDING quá hạn giữ chỗ (lazy cleanup — không cần cron).
 * Gọi trước khi hiển thị lịch trống / trước khi tạo booking mới để giải phóng slot.
 * @param providerId Giới hạn theo 1 reader (tối ưu); bỏ trống = quét toàn bộ.
 */
export async function expireStalePendingBookings(providerId?: number): Promise<number> {
  const cutoff = new Date(Date.now() - PAYMENT_HOLD_MS)
  const r = await prisma.booking.updateMany({
    where: {
      status: 'PENDING',
      created_at: { lt: cutoff },
      ...(providerId ? { provider_id: providerId } : {}),
    },
    data: { status: 'CANCELLED', cancel_reason: 'Hết hạn thanh toán — tự động hủy.' },
  })
  return r.count
}

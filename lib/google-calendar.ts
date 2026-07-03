/**
 * Google Calendar Quick Add Link Generator
 *
 * Tạo URL dạng https://calendar.google.com/calendar/render?action=TEMPLATE&...
 * để mở sẵn form tạo event trên Google Calendar — không cần OAuth hay API key.
 *
 * Format thời gian Google Calendar yêu cầu: YYYYMMDDTHHMMSSZ (UTC)
 */

export interface CalendarEventParams {
  /** Ngày hẹn dạng "YYYY-MM-DD" */
  date: string
  /** Giờ bắt đầu dạng "HH:MM" (theo múi giờ VN = UTC+7) */
  time: string
  /** Thời lượng phiên (phút) — để tính giờ kết thúc */
  durationMinutes: number
  /** Tên reader hoặc khách hàng (đối tác trong phiên) */
  partnerName: string
  /** Tên gói dịch vụ */
  packageName: string
  /** ID booking để reference */
  bookingId: number
}

/**
 * Chuyển "YYYY-MM-DD" + "HH:MM" (VN UTC+7) sang UTC timestamp dạng Date
 */
function toUTC(dateStr: string, timeStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  // Giờ VN = UTC+7 → trừ 7h để ra UTC
  return new Date(Date.UTC(y, m - 1, d, (hh || 0) - 7, mm || 0, 0))
}

/**
 * Format Date thành chuỗi YYYYMMDDTHHMMSSZ cho Google Calendar URL
 */
function formatGCalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Tạo Google Calendar Quick Add URL cho một booking đã xác nhận
 */
export function generateGoogleCalendarLink(params: CalendarEventParams): string {
  const startUTC = toUTC(params.date, params.time)
  const endUTC = new Date(startUTC.getTime() + params.durationMinutes * 60 * 1000)

  const startStr = formatGCalDate(startUTC)
  const endStr = formatGCalDate(endUTC)

  const title = `ZENVY: ${params.packageName} với ${params.partnerName}`
  const details = [
    `📅 Lịch hẹn ZENVY #${params.bookingId}`,
    `🔮 Gói dịch vụ: ${params.packageName}`,
    `👤 Đối tác: ${params.partnerName}`,
    `⏱ Thời lượng: ${params.durationMinutes} phút`,
    '',
    'Xem chi tiết tại: https://zenvy.vn/dashboard',
  ].join('\n')

  const params_ = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${startStr}/${endStr}`,
    details,
    sf: 'true',
    output: 'xml',
  })

  return `https://calendar.google.com/calendar/render?${params_.toString()}`
}

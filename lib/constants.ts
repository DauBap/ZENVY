// Các khung giờ hẹn hợp lệ dùng chung cho booking + quản lý lịch trống của reader
// Đủ 24 khung giờ trong ngày (00:00 → 23:00)
export const TIME_SLOTS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`) as readonly string[]


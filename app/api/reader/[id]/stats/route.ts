import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reader/[id]/stats — thống kê thực của reader
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const readerId = Number(id)

    const [
      followCount,
      totalBookings,
      completedBookings,
      sessionReviewCount,
      legacyReviewCount,
    ] = await Promise.all([
      // Số người theo dõi
      prisma.readerFavorite.count({ where: { reader_id: readerId } }),

      // Tổng số lịch hẹn (không tính CANCELLED)
      prisma.booking.count({
        where: { reader_id: readerId, status: { not: 'CANCELLED' } },
      }),

      // Số phiên hoàn thành
      prisma.booking.count({
        where: { reader_id: readerId, status: 'COMPLETED' },
      }),

      // Số review phiên
      prisma.sessionReview.count({ where: { reader_id: readerId } }),

      // Số review cũ (legacy)
      prisma.review.count({ where: { reader_id: readerId } }),
    ])

    const completionRate = totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0

    // Lượt đánh giá = gộp cả 2 nguồn; điểm rating đọc thẳng từ cột reader_info.rating
    const reviewCount = sessionReviewCount + legacyReviewCount
    const reader = await prisma.readerInfo.findUnique({
      where: { id: readerId },
      select: { rating: true },
    })
    const avgRating = reader ? Number(reader.rating) : 0

    return NextResponse.json({
      followCount,
      totalBookings,
      completedBookings,
      completionRate,
      avgRating,
      reviewCount,
    })
  } catch (e) {
    console.error('Reader stats error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

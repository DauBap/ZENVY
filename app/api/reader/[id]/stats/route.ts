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
      ratingAgg,
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

      // Rating trung bình từ session reviews
      prisma.sessionReview.aggregate({
        where: { reader_id: readerId },
        _avg: { rating: true },
        _count: true,
      }),
    ])

    const completionRate = totalBookings > 0
      ? Math.round((completedBookings / totalBookings) * 100)
      : 0

    const avgRating = ratingAgg._avg.rating
      ? Math.round(ratingAgg._avg.rating * 100) / 100
      : 0

    return NextResponse.json({
      followCount,
      totalBookings,
      completedBookings,
      completionRate,
      avgRating,
      reviewCount: ratingAgg._count,
    })
  } catch (e) {
    console.error('Reader stats error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

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
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.readerFavorite.count({ where: { reader_id: readerId } }),
      prisma.booking.count({ where: { reader_id: readerId, status: 'COMPLETED' } }),
      prisma.booking.count({ where: { reader_id: readerId, status: 'CANCELLED' } }),
    ])

    // Cách C: COMPLETED / (COMPLETED + CANCELLED)
    // Phản ánh đúng uy tín: trong các booking đã kết thúc, bao nhiêu % hoàn thành
    const closedBookings = completedBookings + cancelledBookings
    const completionRate = closedBookings > 0
      ? Math.round((completedBookings / closedBookings) * 100)
      : 100 // chưa có booking nào kết thúc → mặc định 100%

    // Tính avgRating chỉ từ session_reviews
    const sessionAgg = await prisma.sessionReview.aggregate({
      where: { reader_id: readerId },
      _avg: { rating: true },
      _count: true,
    })

    const reviewCount = sessionAgg._count ?? 0
    const avgRating = reviewCount > 0
      ? Math.round((sessionAgg._avg.rating ?? 0) * 10) / 10
      : 0

    return NextResponse.json({
      followCount,
      totalBookings: completedBookings + cancelledBookings,
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

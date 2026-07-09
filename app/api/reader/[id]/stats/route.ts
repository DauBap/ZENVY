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

    // Lấy user_id từ ReaderInfo để query Booking.provider_id
    const readerInfo = await prisma.readerInfo.findUnique({
      where: { id: readerId },
      select: { user_id: true },
    })
    const providerUserId = readerInfo?.user_id

    const [
      followCount,
      completedBookings,
      cancelledBookings,
    ] = await Promise.all([
      prisma.readerFavorite.count({ where: { reader_id: readerId } }),
      providerUserId
        ? prisma.booking.count({ where: { provider_id: providerUserId, status: 'COMPLETED' } })
        : Promise.resolve(0),
      providerUserId
        ? prisma.booking.count({ where: { provider_id: providerUserId, status: 'CANCELLED' } })
        : Promise.resolve(0),
    ])

    // Cách C: COMPLETED / (COMPLETED + CANCELLED)
    // Phản ánh đúng uy tín: trong các booking đã kết thúc, bao nhiêu % hoàn thành
    const closedBookings = completedBookings + cancelledBookings
    const completionRate = closedBookings > 0
      ? Math.round((completedBookings / closedBookings) * 100)
      : 0 // chưa có booking nào kết thúc → mặc định 0%

    // Tính avgRating và reviewCount gộp cả legacy reviews và session reviews
    const [legacyAgg, sessionAgg] = await Promise.all([
      prisma.reviews.aggregate({
        where: { reader_id: readerId },
        _count: { _all: true },
        _sum: { rating: true },
      }),
      prisma.sessionReview.aggregate({
        where: { reader_id: readerId },
        _count: { _all: true },
        _sum: { rating: true },
      }),
    ])

    const reviewCount = (legacyAgg._count._all ?? 0) + (sessionAgg._count._all ?? 0)
    const totalRatingSum = (legacyAgg._sum.rating ?? 0) + (sessionAgg._sum.rating ?? 0)
    const avgRating = reviewCount > 0
      ? Math.round((totalRatingSum / reviewCount) * 10) / 10
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

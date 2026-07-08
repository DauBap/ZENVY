import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const PAGE_SIZE = 10

// GET /api/reader/[id]/reviews?page=1
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const readerId = Number(id)
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page') ?? 1))

    const [reviews, totalCount, agg] = await Promise.all([
      prisma.sessionReview.findMany({
        where: { reader_id: readerId },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          booking: {
            include: {
              requester: {
                include: {
                  customer_info: { select: { fullname: true, avatar_url: true } },
                },
              },
              package: { select: { name: true, duration: true } },
            },
          },
        },
      }),
      prisma.sessionReview.count({ where: { reader_id: readerId } }),
      prisma.sessionReview.groupBy({
        by: ['rating'],
        where: { reader_id: readerId },
        _count: true,
      }),
    ])

    const items = reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at.toISOString(),
      packageName: r.booking.package.name,
      packageDuration: r.booking.package.duration,
      customer: {
        name: r.booking.requester.customer_info?.fullname ?? 'Khách hàng',
        avatar: r.booking.requester.customer_info?.avatar_url ?? null,
      },
    }))

    const countByStar = new Map(agg.map(g => [g.rating, g._count]))
    const totalSum = agg.reduce((s, g) => s + g.rating * g._count, 0)
    const stats = totalCount > 0 ? {
      count: totalCount,
      average: Math.round((totalSum / totalCount) * 10) / 10,
      distribution: [5, 4, 3, 2, 1].map(s => ({ star: s, count: countByStar.get(s) ?? 0 })),
    } : { count: 0, average: 0, distribution: [] }

    return NextResponse.json({
      reviews: items,
      stats,
      page,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
      totalCount,
    })
  } catch (e) {
    console.error('Get reviews error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

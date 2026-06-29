import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reader/[id]/reviews — Lấy reviews của reader (public)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const readerId = Number(id)

    const reviews = await prisma.sessionReview.findMany({
      where: { reader_id: readerId },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        booking: {
          include: {
            customer: {
              select: { fullname: true, avatar_url: true },
            },
            package: { select: { name: true, duration: true } },
          },
        },
      },
    })

    const items = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at.toISOString(),
      packageName: r.booking.package.name,
      packageDuration: r.booking.package.duration,
      customer: {
        name: r.booking.customer.fullname ?? 'Khách hàng',
        avatar: r.booking.customer.avatar_url ?? null,
      },
    }))

    // Tổng hợp rating
    const stats = reviews.length > 0 ? {
      count: reviews.length,
      average: Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10,
      distribution: [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: reviews.filter((r) => r.rating === s).length,
      })),
    } : { count: 0, average: 0, distribution: [] }

    return NextResponse.json({ reviews: items, stats })
  } catch (e) {
    console.error('Get reviews error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

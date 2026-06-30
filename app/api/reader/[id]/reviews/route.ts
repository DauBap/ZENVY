import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reader/[id]/reviews?page=1 — Lấy reviews của reader (public), 10/trang
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const readerId = Number(id)

    const PAGE_SIZE = 10
    const pageParam = Number(request.nextUrl.searchParams.get('page'))
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
    const fetchN = page * PAGE_SIZE // đủ để cửa sổ trang N nằm trong top fetchN của mỗi bảng

    // Review từ phiên đã hoàn thành (bảng mới)
    const sessionReviews = await prisma.sessionReview.findMany({
      where: { reader_id: readerId },
      orderBy: { created_at: 'desc' },
      take: fetchN,
      include: {
        booking: {
          include: {
            customer: { select: { fullname: true, avatar_url: true } },
            package: { select: { name: true, duration: true } },
          },
        },
      },
    })

    // Review cũ (seed/legacy) — không gắn booking/gói
    const legacyReviews = await prisma.review.findMany({
      where: { reader_id: readerId },
      orderBy: { date: 'desc' },
      take: fetchN,
    })

    const sessionItems = sessionReviews.map((r) => ({
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

    const legacyItems = legacyReviews.map((r) => ({
      id: -r.id, // tránh trùng key với session review
      rating: r.rating,
      comment: r.comment,
      createdAt: r.date.toISOString(),
      packageName: null as string | null,
      packageDuration: null as number | null,
      customer: {
        name: r.userName,
        avatar: r.userAvatar || null,
      },
    }))

    // Gộp + sắp xếp mới nhất trước, rồi cắt đúng cửa sổ trang
    const merged = [...sessionItems, ...legacyItems]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const items = merged.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

    // Thống kê tính trên TOÀN BỘ review (groupBy theo số sao, không bị giới hạn)
    const [sessionGroups, legacyGroups] = await Promise.all([
      prisma.sessionReview.groupBy({
        by: ['rating'], where: { reader_id: readerId }, _count: true,
      }),
      prisma.review.groupBy({
        by: ['rating'], where: { reader_id: readerId }, _count: true,
      }),
    ])

    const countByStar = new Map<number, number>()
    for (const g of [...sessionGroups, ...legacyGroups]) {
      countByStar.set(g.rating, (countByStar.get(g.rating) ?? 0) + g._count)
    }
    let totalCount = 0
    let totalSum = 0
    for (const [star, count] of countByStar) {
      totalCount += count
      totalSum += star * count
    }
    const stats = totalCount > 0 ? {
      count: totalCount,
      average: Math.round((totalSum / totalCount) * 10) / 10,
      distribution: [5, 4, 3, 2, 1].map((s) => ({
        star: s,
        count: countByStar.get(s) ?? 0,
      })),
    } : { count: 0, average: 0, distribution: [] }

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

    return NextResponse.json({ reviews: items, stats, page, totalPages, totalCount })
  } catch (e) {
    console.error('Get reviews error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

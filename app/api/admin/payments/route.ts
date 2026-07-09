import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const page     = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit    = Math.min(50, Number(searchParams.get('limit') ?? 20))
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo') ?? ''
    const search   = searchParams.get('search')?.trim() ?? ''

    const where: any = {
      ...(dateFrom && { created_at: { gte: new Date(dateFrom) } }),
      ...(dateTo && { created_at: { lte: new Date(dateTo + 'T23:59:59') } }),
      ...(search && {
        reader: { display_name: { contains: search, mode: 'insensitive' } },
      }),
    }

    const [earnings, total, totalRevenue] = await Promise.all([
      prisma.readerEarning.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          reader: { select: { display_name: true, avatar_url: true } },
          booking: {
            include: {
              requester: {
                include: {
                  customer_info: {
                    select: { fullname: true },
                  },
                },
              },
              package: { select: { name: true, price: true } },
            },
          },
        },
      }),
      prisma.readerEarning.count({ where }),
      prisma.readerEarning.aggregate({ _sum: { amount: true } }),
    ])

    // Revenue by reader (top earners)
    const readerRevenue = await prisma.readerEarning.groupBy({
      by: ['reader_id'],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    })

    const topReaders = await Promise.all(
      readerRevenue.map(async (r) => {
        const info = await prisma.readerInfo.findUnique({
          where: { id: r.reader_id },
          select: { display_name: true, avatar_url: true },
        })
        return {
          readerId: r.reader_id,
          name: info?.display_name ?? '—',
          avatar: info?.avatar_url ?? null,
          totalEarnings: r._sum.amount ?? 0,
          sessionCount: r._count,
        }
      })
    )

    const items = earnings.map(e => ({
      id: e.id,
      bookingId: e.booking_id,
      amount: e.amount,
      createdAt: e.created_at.toISOString(),
      reader: { name: e.reader.display_name ?? '—', avatar: e.reader.avatar_url },
      customer: { name: e.booking.requester.customer_info?.fullname ?? '—' },
      package: e.booking.package,
    }))

    return NextResponse.json({
      earnings: items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      totalRevenue: totalRevenue._sum.amount ?? 0,
      topReaders,
    })
  } catch (e) {
    console.error('Admin payments error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

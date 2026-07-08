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
    const status   = searchParams.get('status') ?? ''
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo') ?? ''
    const search   = searchParams.get('search')?.trim() ?? ''

    const where: any = {
      ...(status && { status }),
      ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
      ...(dateTo && { date: { lte: new Date(dateTo) } }),
      ...(search && {
        OR: [
          { requester: { email: { contains: search, mode: 'insensitive' } } },
          { requester: { customer_info: { fullname: { contains: search, mode: 'insensitive' } } } },
          { provider: { reader_info: { display_name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          requester: { 
            select: { 
              email: true,
              customer_info: { 
                select: { fullname: true } 
              } 
            } 
          },
          provider: { 
            select: { 
              reader_info: { 
                select: { display_name: true, avatar_url: true } 
              } 
            } 
          },
          package: { select: { name: true, duration: true, price: true } },
          review: { select: { rating: true, comment: true } },
        },
      }),
      prisma.booking.count({ where }),
    ])

    const items = bookings.map(b => ({
      id: b.id,
      date: b.date.toISOString().split('T')[0],
      time: b.time,
      status: b.status,
      cancelReason: b.cancel_reason,
      createdAt: b.created_at.toISOString(),
      customer: { 
        name: b.requester.customer_info?.fullname ?? '—', 
        email: b.requester.email ?? '' 
      },
      reader: { 
        name: b.provider.reader_info?.display_name ?? '—', 
        avatar: b.provider.reader_info?.avatar_url 
      },
      package: b.package,
      review: b.review,
    }))

    return NextResponse.json({ bookings: items, total, page, totalPages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('Admin bookings error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

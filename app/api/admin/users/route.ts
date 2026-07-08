import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const page   = Math.max(1, Number(searchParams.get('page') ?? 1))
    const limit  = Math.min(50, Number(searchParams.get('limit') ?? 20))
    const search = searchParams.get('search')?.trim() ?? ''
    const status = searchParams.get('status') ?? ''
    const role   = searchParams.get('role') ?? ''
    const pending = searchParams.get('pending') === 'true'

    const pendingWhere: any = {
      role: { name: 'READER' },
      reader_info: { is: { status: 'PENDING' } },
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { reader_info: { is: { display_name: { contains: search, mode: 'insensitive' } } } },
        ],
      }),
    }

    const where: any = pending
      ? pendingWhere
      : {
          ...(status && { status }),
          ...(role && { role: { name: role } }),
          ...(search && {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { customer_info: { fullname: { contains: search, mode: 'insensitive' } } },
              { reader_info: { is: { display_name: { contains: search, mode: 'insensitive' } } } },
            ],
          }),
          NOT: {
            reader_info: { is: { status: 'PENDING' } },
          },
        }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          role: { select: { name: true } },
          customer_info: { select: { fullname: true, avatar_url: true } },
          reader_info: { select: { display_name: true, avatar_url: true, verified: true, rating: true } },
          _count: { select: { refresh_tokens: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    const items = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role.name,
      status: u.status,
      name: u.reader_info?.display_name ?? u.customer_info?.fullname ?? '—',
      avatar: u.reader_info?.avatar_url ?? u.customer_info?.avatar_url ?? null,
      verified: u.reader_info?.verified ?? false,
      rating: u.reader_info?.rating ? Number(u.reader_info.rating) : null,
      createdAt: u.created_at.toISOString(),
    }))

    return NextResponse.json({ users: items, total, page, totalPages: Math.ceil(total / limit) })
  } catch (e) {
    console.error('Admin users error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

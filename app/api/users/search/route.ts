import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/users/search?q=name — tìm user để tag
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ users: [] })

    const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    if (q.length < 1) return NextResponse.json({ users: [] })

    const results = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        id: { not: Number(session.sub) },   // không gợi ý chính mình
        OR: [
          { customer_info: { fullname: { contains: q, mode: 'insensitive' } } },
          { reader_info:   { display_name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      take: 8,
      include: { customer_info: true, reader_info: true },
    })

    const users = results.map((u) => ({
      id: u.id,
      name: u.reader_info?.display_name ?? u.customer_info?.fullname ?? u.email.split('@')[0],
      avatar: u.reader_info?.avatar_url ?? u.customer_info?.avatar_url ?? null,
      isReader: !!u.reader_info,
    }))

    return NextResponse.json({ users })
  } catch (e) {
    console.error('User search error:', e)
    return NextResponse.json({ users: [] })
  }
}

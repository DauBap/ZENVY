import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { serializeReaders } from '@/lib/serializers'

// GET /api/readers/favorites — reader yêu thích của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const userId = Number(session.sub)
    const favs = await prisma.readerFavorite.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        reader: { include: { packages: true, _count: { select: { reviews: true, session_reviews: true } } } },
      },
    })

    const readers = serializeReaders(favs.map(f => f.reader))
    return NextResponse.json({ readers })
  } catch (e) {
    console.error('Get favorites error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

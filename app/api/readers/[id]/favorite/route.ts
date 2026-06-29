import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

type ReaderFavoriteDelegate = {
  count(args: { where: { reader_id: number } }): Promise<number>
  findUnique(args: {
    where: { user_id_reader_id: { user_id: number; reader_id: number } }
    select: { id: true }
  }): Promise<{ id: number } | null>
  delete(args: { where: { id: number } }): Promise<unknown>
  create(args: { data: { user_id: number; reader_id: number } }): Promise<unknown>
}

const readerFavorite = (prisma as PrismaClient & { readerFavorite: ReaderFavoriteDelegate }).readerFavorite

// GET /api/readers/[id]/favorite — lấy trạng thái theo dõi của user hiện tại
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const readerId = Number(id)

    if (!Number.isInteger(readerId) || readerId <= 0) {
      return NextResponse.json({ error: 'Reader không hợp lệ.' }, { status: 400 })
    }

    const reader = await prisma.readerInfo.findUnique({ where: { id: readerId }, select: { id: true } })
    if (!reader) return NextResponse.json({ error: 'Reader không tồn tại.' }, { status: 404 })

    const session = await getSession()
    const userId = session ? Number(session.sub) : null

    const [count, existing] = await Promise.all([
      readerFavorite.count({ where: { reader_id: readerId } }),
      userId
        ? readerFavorite.findUnique({
            where: { user_id_reader_id: { user_id: userId, reader_id: readerId } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ])

    return NextResponse.json({ success: true, favorited: Boolean(existing), count })
  } catch (e) {
    console.error('Get favorite status error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/readers/[id]/favorite — toggle yêu thích reader
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const readerId = Number(id)

    if (!Number.isInteger(readerId) || readerId <= 0) {
      return NextResponse.json({ error: 'Reader không hợp lệ.' }, { status: 400 })
    }

    const reader = await prisma.readerInfo.findUnique({ where: { id: readerId }, select: { id: true } })
    if (!reader) return NextResponse.json({ error: 'Reader không tồn tại.' }, { status: 404 })

    const userId = Number(session.sub)
    const existing = await readerFavorite.findUnique({
      where: { user_id_reader_id: { user_id: userId, reader_id: readerId } },
      select: { id: true },
    })

    let favorited: boolean
    if (existing) {
      await readerFavorite.delete({ where: { id: existing.id } })
      favorited = false
    } else {
      await readerFavorite.create({ data: { user_id: userId, reader_id: readerId } })
      favorited = true
    }

    const count = await readerFavorite.count({ where: { reader_id: readerId } })
    return NextResponse.json({ success: true, favorited, count })
  } catch (e) {
    console.error('Toggle favorite error:', e)
    return NextResponse.json({ error: 'Thao tác thất bại.' }, { status: 500 })
  }
}

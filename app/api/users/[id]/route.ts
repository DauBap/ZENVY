import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/users/[id] — thông tin công khai để hiển thị popup khi bấm vào mention
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { id } = await params
    const userId = Number(id)
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'ID không hợp lệ.' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { customer_info: true, reader_info: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
    }

    const isReader = !!user.reader_info
    return NextResponse.json({
      userId: user.id,
      name: user.reader_info?.display_name ?? user.customer_info?.fullname ?? user.email.split('@')[0],
      avatar: user.reader_info?.avatar_url ?? user.customer_info?.avatar_url ?? null,
      isReader,
      isVerified: user.reader_info?.verified ?? false,
      specialty: user.reader_info?.specialty ?? [],
      rating: user.reader_info ? Number(user.reader_info.rating) : null,
      readerInfoId: user.reader_info?.id ?? null,
      customerInfoId: user.customer_info?.id ?? null,
    })
  } catch (e) {
    console.error('Get user profile error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

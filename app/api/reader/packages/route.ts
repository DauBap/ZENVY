import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/reader/packages — tạo gói dịch vụ mới
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    if (session.role !== 'READER') {
      return NextResponse.json({ error: 'Chỉ reader mới quản lý được gói dịch vụ.' }, { status: 403 })
    }

    const reader = await prisma.readerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { id: true },
    })
    if (!reader) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ reader.' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'Vui lòng nhập tên gói.' }, { status: 400 })
    }

    const duration = Number(body.duration)
    if (!Number.isFinite(duration) || duration <= 0) {
      return NextResponse.json({ error: 'Thời lượng không hợp lệ.' }, { status: 400 })
    }

    const price = Number(body.price)
    if (!Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: 'Giá không hợp lệ.' }, { status: 400 })
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        duration: Math.floor(duration),
        price: Math.floor(price),
        description: typeof body.description === 'string' ? body.description.trim() : '',
        popular: body.popular === true,
        reader_id: reader.id,
      },
    })

    return NextResponse.json({ success: true, package: pkg }, { status: 201 })
  } catch (error) {
    console.error('Create package error:', error)
    return NextResponse.json({ error: 'Tạo gói thất bại.' }, { status: 500 })
  }
}

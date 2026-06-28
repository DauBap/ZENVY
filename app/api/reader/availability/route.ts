import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { TIME_SLOTS } from '@/lib/constants'

const VALID_SLOTS = new Set<string>(TIME_SLOTS)

// PUT /api/reader/availability — thay toàn bộ lịch trống (replace-all)
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    if (session.role !== 'READER') {
      return NextResponse.json({ error: 'Chỉ reader mới quản lý được lịch trống.' }, { status: 403 })
    }

    const reader = await prisma.readerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { id: true },
    })
    if (!reader) {
      return NextResponse.json({ error: 'Không tìm thấy hồ sơ reader.' }, { status: 404 })
    }

    const body = await request.json().catch(() => null)
    const items = body?.items
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    // Chuẩn hóa + validate từng ngày
    const rows: { date: Date; slots: string[]; reader_id: number }[] = []
    for (const item of items) {
      if (!item || typeof item.date !== 'string') continue
      const d = new Date(item.date)
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: `Ngày không hợp lệ: ${item.date}` }, { status: 400 })
      }
      const slots = Array.isArray(item.slots)
        ? Array.from(new Set(item.slots.filter((s: unknown): s is string => typeof s === 'string' && VALID_SLOTS.has(s))))
        : []
      // Bỏ qua ngày không có khung giờ nào
      if (slots.length === 0) continue
      // Sắp xếp slot theo thứ tự thời gian
      slots.sort()
      rows.push({ date: d, slots, reader_id: reader.id })
    }

    // Replace-all trong transaction (Availability không bị FK tham chiếu → an toàn)
    await prisma.$transaction([
      prisma.availability.deleteMany({ where: { reader_id: reader.id } }),
      ...(rows.length > 0 ? [prisma.availability.createMany({ data: rows })] : []),
    ])

    return NextResponse.json({ success: true, count: rows.length })
  } catch (error) {
    console.error('Update availability error:', error)
    return NextResponse.json({ error: 'Cập nhật lịch trống thất bại.' }, { status: 500 })
  }
}

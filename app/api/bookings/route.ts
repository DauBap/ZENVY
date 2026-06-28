import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/bookings — tạo booking mới
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { readerId, packageId, date, time } = await request.json()

    if (!readerId || !packageId || !date || !time) {
      return NextResponse.json({ error: 'Thiếu thông tin đặt lịch.' }, { status: 400 })
    }

    // Lấy customer_info từ user
    const customerInfo = await prisma.customerInfo.findUnique({
      where: { user_id: Number(session.sub) },
    })

    if (!customerInfo) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin khách hàng.' }, { status: 404 })
    }

    const booking = await prisma.booking.create({
      data: {
        customer_id: customerInfo.id,
        reader_id: Number(readerId),
        package_id: Number(packageId),
        date: new Date(date),
        time,
        status: 'PENDING',
      },
      include: {
        reader: { select: { display_name: true, avatar_url: true } },
        package: { select: { name: true, duration: true, price: true } },
      },
    })

    return NextResponse.json({ success: true, booking }, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    const msg = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Đặt lịch thất bại.', detail: msg }, { status: 500 })
  }
}

// GET /api/bookings — lấy danh sách booking của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const customerInfo = await prisma.customerInfo.findUnique({
      where: { user_id: Number(session.sub) },
    })

    if (!customerInfo) {
      return NextResponse.json({ bookings: [] })
    }

    const bookings = await prisma.booking.findMany({
      where: { customer_id: customerInfo.id },
      include: {
        reader: { select: { id: true, display_name: true, avatar_url: true, verified: true } },
        package: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    // Serialize dates
    const serialized = bookings.map((b) => ({
      ...b,
      date: b.date.toISOString().split('T')[0],
      created_at: b.created_at.toISOString(),
      updated_at: b.updated_at.toISOString(),
    }))

    return NextResponse.json({ bookings: serialized })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

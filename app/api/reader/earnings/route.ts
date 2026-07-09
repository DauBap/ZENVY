import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/reader/earnings — tổng thu + danh sách của reader hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    if (session.role !== 'READER') {
      return NextResponse.json({ error: 'Chỉ reader mới xem được thu nhập.' }, { status: 403 })
    }

    const reader = await prisma.readerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { id: true },
    })
    if (!reader) {
      return NextResponse.json({ total: 0, count: 0, earnings: [] })
    }

    const earnings = await prisma.readerEarning.findMany({
      where: { reader_id: reader.id },
      orderBy: { created_at: 'desc' },
      // Giới hạn 100 giao dịch gần nhất — tránh load toàn bộ khi dữ liệu lớn
      take: 100,
      include: {
        booking: {
          select: {
            id: true,
            date: true,
            time: true,
            requester: {
              select: {
                customer_info: {
                  select: {
                    fullname: true,
                  },
                },
              },
            },
            package: { select: { name: true } },
          },
        },
      },
    })

    // Tính tổng thu nhập chính xác bằng aggregate (không phụ thuộc vào take: 100)
    const totalAgg = await prisma.readerEarning.aggregate({
      where: { reader_id: reader.id },
      _sum: { amount: true },
      _count: true,
    })

    return NextResponse.json({
      total: totalAgg._sum.amount ?? 0,
      count: totalAgg._count,
      earnings: earnings.map((e) => ({
        id: e.id,
        amount: e.amount,
        createdAt: e.created_at.toISOString(),
        bookingId: e.booking_id,
        date: e.booking?.date.toISOString().split('T')[0] ?? null,
        time: e.booking?.time ?? null,
        customerName: e.booking?.requester?.customer_info?.fullname ?? 'Khách hàng',
        packageName: e.booking?.package?.name ?? '',
      })),
    })
  } catch (error) {
    console.error('Get earnings error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = request.nextUrl
    const dateFrom = searchParams.get('dateFrom') ?? ''
    const dateTo   = searchParams.get('dateTo') ?? ''

    const earnings = await prisma.readerEarning.findMany({
      where: {
        ...(dateFrom && { created_at: { gte: new Date(dateFrom) } }),
        ...(dateTo && { created_at: { lte: new Date(dateTo + 'T23:59:59') } }),
      },
      orderBy: { created_at: 'desc' },
      include: {
        reader: { select: { display_name: true } },
        booking: {
          include: {
            customer: { select: { fullname: true, user: { select: { email: true } } } },
            package: { select: { name: true, price: true, duration: true } },
          },
        },
      },
    })

    // Build CSV
    const headers = ['ID','Booking ID','Reader','Khách hàng','Email khách','Gói dịch vụ','Thời lượng','Số tiền','Ngày']
    const rows = earnings.map(e => [
      e.id,
      e.booking_id,
      e.reader.display_name ?? '',
      e.booking.customer.fullname ?? '',
      e.booking.customer.user?.email ?? '',
      e.booking.package.name,
      `${e.booking.package.duration} phút`,
      e.amount,
      new Date(e.created_at).toLocaleDateString('vi-VN'),
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (e) {
    console.error('Export error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

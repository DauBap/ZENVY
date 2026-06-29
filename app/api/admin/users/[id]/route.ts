import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        role: true,
        customer_info: true,
        reader_info: { include: { packages: true, session_reviews: { take: 5, orderBy: { created_at: 'desc' } } } },
        _count: { select: { refresh_tokens: true } },
      },
    })
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Booking count
    const bookingCount = user.role.name === 'CUSTOMER'
      ? await prisma.booking.count({ where: { customer: { user_id: user.id } } })
      : await prisma.booking.count({ where: { reader: { user_id: user.id } } })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      status: user.status,
      createdAt: user.created_at.toISOString(),
      customerInfo: user.customer_info,
      readerInfo: user.reader_info ? {
        ...user.reader_info,
        rating: Number(user.reader_info.rating),
        price_per_session: Number(user.reader_info.price_per_session),
      } : null,
      bookingCount,
    })
  } catch (e) {
    console.error('Admin user detail error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { status, verified } = body

    const updates: any = {}
    if (status && ['ACTIVE', 'INACTIVE', 'BANNED'].includes(status)) {
      updates.status = status
    }

    const user = await prisma.user.update({ where: { id: Number(id) }, data: updates })

    // Toggle reader verified
    if (typeof verified === 'boolean') {
      await prisma.readerInfo.updateMany({
        where: { user_id: Number(id) },
        data: { verified },
      })
    }

    return NextResponse.json({ success: true, status: user.status })
  } catch (e) {
    console.error('Admin update user error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin delete user error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
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
      ? await prisma.booking.count({ where: { requester_id: user.id } })
      : await prisma.booking.count({ where: { provider_id: user.id } })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      status: user.status,
      createdAt: user.created_at.toISOString(),
      avatar: user.reader_info?.avatar_url ?? user.customer_info?.avatar_url ?? null,
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
    const { status, verified, approve, reason } = body

    const updates: any = {}
    if (status && ['ACTIVE', 'INACTIVE', 'BANNED'].includes(status)) {
      updates.status = status
    }

    const user = await prisma.user.update({ where: { id: Number(id) }, data: updates })

    // If admin approves, activate reader_info status only — verified must be set manually
    if (approve) {
      await prisma.readerInfo.updateMany({ where: { user_id: Number(id) }, data: { status: 'ACTIVE' } })
    }

    // Toggle reader verified manually if provided
    if (typeof verified === 'boolean') {
      await prisma.readerInfo.updateMany({ where: { user_id: Number(id) }, data: { verified } })
    }

    // Notify user when admin provides a reason on approval
    try {
      if (approve) {
        const uid = Number(id)
        await createNotification({
          userId: uid,
          title: 'Yêu cầu Reader đã được duyệt',
          content: reason ? `Yêu cầu của bạn đã được duyệt. Ghi chú: ${reason}` : 'Yêu cầu của bạn đã được duyệt.',
          type: 'SYSTEM',
          link: '/profile',
        })
      }
    } catch (err) {
      console.error('Notify user on approve failed:', err)
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
    // read optional reason from body to notify user
    const body = await _req.json().catch(() => ({}))
    const reason: string | undefined = body?.reason
    try {
      if (reason) {
        const uid = Number(id)
        await createNotification({
          userId: uid,
          title: 'Yêu cầu Reader bị từ chối',
          content: `Yêu cầu của bạn đã bị từ chối. Lý do: ${reason}`,
          type: 'SYSTEM',
          link: '/profile',
        })
      }
    } catch (err) {
      console.error('Notify user on reject failed:', err)
    }

    // Instead of deleting the user, mark reader_info status as SUSPENDED so user account remains usable
    await prisma.readerInfo.updateMany({ where: { user_id: Number(id) }, data: { status: 'SUSPENDED' } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Admin delete user error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

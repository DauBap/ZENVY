import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await params
    const { status, cancel_reason } = await request.json()

    if (!['PENDING','CONFIRMED','COMPLETED','CANCELLED'].includes(status))
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status,
        ...(cancel_reason && { cancel_reason }),
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (e) {
    console.error('Admin update booking error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

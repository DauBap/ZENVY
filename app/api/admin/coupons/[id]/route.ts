import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const coupon = await prisma.coupon.findUnique({
      where: { id: Number(id) },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Không tìm thấy mã giảm giá' }, { status: 404 })
    }

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Get coupon error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const couponId = Number(id)
    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy mã giảm giá' }, { status: 404 })
    }

    const updateData: any = {}

    if (body.code !== undefined) {
      const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
      if (!code) {
        return NextResponse.json({ error: 'Mã giảm giá không được để trống' }, { status: 400 })
      }

      // Check unique code
      const duplicate = await prisma.coupon.findFirst({
        where: {
          code,
          id: { not: couponId },
        },
      })
      if (duplicate) {
        return NextResponse.json({ error: 'Mã giảm giá đã tồn tại' }, { status: 409 })
      }
      updateData.code = code
    }

    if (body.discount_type !== undefined) {
      if (body.discount_type !== 'PERCENTAGE' && body.discount_type !== 'FIXED') {
        return NextResponse.json({ error: 'Loại giảm giá không hợp lệ' }, { status: 400 })
      }
      updateData.discount_type = body.discount_type
    }

    if (body.discount_value !== undefined) {
      const val = Number(body.discount_value)
      if (isNaN(val) || val <= 0) {
        return NextResponse.json({ error: 'Giá trị giảm giá phải lớn hơn 0' }, { status: 400 })
      }
      
      const type = updateData.discount_type || existing.discount_type
      if (type === 'PERCENTAGE' && val > 100) {
        return NextResponse.json({ error: 'Giảm giá theo phần trăm không được quá 100%' }, { status: 400 })
      }
      updateData.discount_value = val
    }

    if (body.max_uses !== undefined) {
      updateData.max_uses = body.max_uses !== null ? Number(body.max_uses) : null
    }

    if (body.start_date !== undefined) {
      updateData.start_date = body.start_date ? new Date(body.start_date) : null
    }

    if (body.end_date !== undefined) {
      updateData.end_date = body.end_date ? new Date(body.end_date) : null
    }

    if (body.active !== undefined) {
      updateData.active = Boolean(body.active)
    }

    const updated = await prisma.coupon.update({
      where: { id: couponId },
      data: updateData,
    })

    return NextResponse.json({ coupon: updated })
  } catch (error) {
    console.error('Update coupon error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const couponId = Number(id)

    const existing = await prisma.coupon.findUnique({
      where: { id: couponId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy mã giảm giá' }, { status: 404 })
    }

    // Soft delete or hard delete? Since Coupon doesn't have a deleted_at, hard delete it.
    // Or we could check if it has bookings. If it is already used in bookings, we can set active to false instead or let it delete (but since booking links to coupon, we should check relations)
    // Wait, the Coupon model in schema.prisma has `bookings Booking[]`. If there are bookings referencing this coupon, hard delete might fail or delete cascades.
    // Let's see: Coupon has `bookings Booking[]`. Booking has `coupon Coupon? @relation(fields: [coupon_id], references: [id])`. Since it doesn't specify onDelete: Cascade, prisma might prevent it or set null if allowed.
    // To be safe, if there are bookings using this coupon, we can just deactivate it or set coupon_id in bookings to null, or return an error "Mã đã được sử dụng, không thể xóa, vui lòng tắt kích hoạt".
    // That's much safer! Let's check if there are bookings.
    const bookingCount = await prisma.booking.count({
      where: { coupon_id: couponId },
    })

    if (bookingCount > 0) {
      return NextResponse.json({
        error: 'Mã giảm giá đã được sử dụng trong các lịch hẹn. Bạn chỉ có thể tắt kích hoạt (Active = false) thay vì xóa.',
      }, { status: 400 })
    }

    await prisma.coupon.delete({
      where: { id: couponId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete coupon error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
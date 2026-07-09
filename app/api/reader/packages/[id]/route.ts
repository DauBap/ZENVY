import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// Xác thực reader + quyền sở hữu package; trả về { error, status } hoặc { readerId }
async function authorizePackage(packageId: number) {
  const session = await getSession()
  if (!session) return { error: 'Vui lòng đăng nhập.', status: 401 as const }
  if (session.role !== 'READER') {
    return { error: 'Chỉ reader mới quản lý được gói dịch vụ.', status: 403 as const }
  }
  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true },
  })
  if (!reader) return { error: 'Không tìm thấy hồ sơ reader.', status: 404 as const }

  const pkg = await prisma.package.findUnique({ where: { id: packageId }, select: { reader_id: true } })
  if (!pkg) return { error: 'Không tìm thấy gói dịch vụ.', status: 404 as const }
  if (pkg.reader_id !== reader.id) {
    return { error: 'Bạn không có quyền với gói này.', status: 403 as const }
  }
  return { readerId: reader.id }
}

// PATCH /api/reader/packages/[id] — cập nhật gói
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const packageId = Number(id)
    if (!Number.isInteger(packageId) || packageId <= 0) {
      return NextResponse.json({ error: 'Mã gói không hợp lệ.' }, { status: 400 })
    }

    const auth = await authorizePackage(packageId)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
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
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: 'Giá không hợp lệ.' }, { status: 400 })
    }

    const pkg = await prisma.package.update({
      where: { id: packageId },
      data: {
        name,
        duration: Math.floor(duration),
        price: Math.floor(price),
        description: typeof body.description === 'string' ? body.description.trim() : '',
        popular: body.popular === true,
      },
    })

    return NextResponse.json({ success: true, package: pkg })
  } catch (error) {
    console.error('Update package error:', error)
    return NextResponse.json({ error: 'Cập nhật gói thất bại.' }, { status: 500 })
  }
}

// DELETE /api/reader/packages/[id] — xóa gói (chặn nếu còn booking)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const packageId = Number(id)
    if (!Number.isInteger(packageId) || packageId <= 0) {
      return NextResponse.json({ error: 'Mã gói không hợp lệ.' }, { status: 400 })
    }

    const auth = await authorizePackage(packageId)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Chặn xóa nếu gói còn lịch hẹn (Booking.package_id onDelete: Cascade → tránh xóa ngầm booking)
    const bookingCount = await prisma.booking.count({ where: { package_id: packageId } })
    if (bookingCount > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa gói đang có lịch hẹn. Hãy hủy các lịch liên quan trước.' },
        { status: 409 }
      )
    }

    await prisma.package.delete({ where: { id: packageId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete package error:', error)
    return NextResponse.json({ error: 'Xóa gói thất bại.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { recomputeReaderRating } from '@/lib/rating'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { id } = await params
    const bookingId = Number(id)
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ error: 'Mã lịch hẹn không hợp lệ.' }, { status: 400 })
    }

    const userId = Number(session.sub)

    // Check booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    }

    // Only the customer who booked can review
    if (booking.requester_id !== userId) {
      return NextResponse.json({ error: 'Bạn không có quyền đánh giá phiên này.' }, { status: 403 })
    }

    // Can only review completed sessions
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Chỉ có thể đánh giá phiên đã hoàn thành.' }, { status: 400 })
    }

    // Check if review already exists
    const existingReview = await prisma.sessionReview.findUnique({
      where: { booking_id: bookingId },
    })
    if (existingReview) {
      return NextResponse.json({ error: 'Bạn đã đánh giá phiên này rồi.' }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const rating = Number(body?.rating)
    const comment = typeof body?.comment === 'string' ? body.comment.trim() : null

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Đánh giá phải từ 1 đến 5 sao.' }, { status: 400 })
    }

    // Find ReaderInfo ID
    const readerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: booking.provider_id },
      select: { id: true },
    })

    if (!readerInfo) {
      return NextResponse.json({ error: 'Không tìm thấy thông tin Reader.' }, { status: 400 })
    }

    const review = await prisma.sessionReview.create({
      data: {
        booking_id: bookingId,
        reader_id: readerInfo.id,
        rating,
        comment,
      },
    })

    await recomputeReaderRating(readerInfo.id)

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
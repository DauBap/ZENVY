import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/bookings/[id]/review — User gửi đánh giá sau phiên
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const bookingId = Number(id)

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, review: true },
    })

    if (!booking) return NextResponse.json({ error: 'Không tìm thấy lịch hẹn.' }, { status: 404 })
    if (booking.customer.user_id !== Number(session.sub))
      return NextResponse.json({ error: 'Bạn không phải khách hàng của phiên này.' }, { status: 403 })
    if (booking.status !== 'COMPLETED')
      return NextResponse.json({ error: 'Chỉ đánh giá được phiên đã hoàn thành.' }, { status: 400 })
    if (booking.review)
      return NextResponse.json({ error: 'Bạn đã đánh giá phiên này rồi.' }, { status: 409 })

    const body = await request.json().catch(() => null)
    const rating = Number(body?.rating)
    const comment = typeof body?.comment === 'string' ? body.comment.trim() : ''

    if (!Number.isInteger(rating) || rating < 1 || rating > 5)
      return NextResponse.json({ error: 'Số sao phải từ 1 đến 5.' }, { status: 400 })

    // Tạo review
    const review = await prisma.sessionReview.create({
      data: {
        booking_id: bookingId,
        reader_id: booking.reader_id,
        rating,
        comment: comment || null,
      },
    })

    // Cập nhật rating trung bình của reader
    const agg = await prisma.sessionReview.aggregate({
      where: { reader_id: booking.reader_id },
      _avg: { rating: true },
      _count: true,
    })
    const newRating = agg._avg.rating ?? rating
    await prisma.readerInfo.update({
      where: { id: booking.reader_id },
      data: { rating: Math.round(newRating * 10) / 10 }, // làm tròn 1 chữ số thập phân
    })

    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch (e) {
    console.error('Review error:', e)
    return NextResponse.json({ error: 'Gửi đánh giá thất bại.' }, { status: 500 })
  }
}

// GET /api/bookings/[id]/review — Kiểm tra user đã đánh giá chưa
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ reviewed: false, review: null })

    const { id } = await params
    const review = await prisma.sessionReview.findUnique({
      where: { booking_id: Number(id) },
    })

    return NextResponse.json({ reviewed: !!review, review })
  } catch (e) {
    return NextResponse.json({ reviewed: false, review: null })
  }
}

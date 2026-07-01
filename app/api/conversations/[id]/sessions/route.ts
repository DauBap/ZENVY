import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isParticipant } from '@/lib/chat'

// GET /api/conversations/[id]/sessions — các phiên (booking) giữa 2 người trong hội thoại
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const { id } = await params
    const conversationId = Number(id)
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json({ error: 'Mã hội thoại không hợp lệ.' }, { status: 400 })
    }

    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
    if (!conv) {
      return NextResponse.json({ error: 'Không tìm thấy hội thoại.' }, { status: 404 })
    }
    if (!isParticipant(conv, Number(session.sub))) {
      return NextResponse.json({ error: 'Bạn không có quyền với hội thoại này.' }, { status: 403 })
    }

    // Booking giữa đúng cặp customer/reader của hội thoại này (bỏ phiên đã hủy)
    const bookings = await prisma.booking.findMany({
      where: {
        customer: { user_id: conv.customer_user_id },
        reader: { user_id: conv.reader_user_id },
        status: { not: 'CANCELLED' },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
      include: { package: { select: { name: true, duration: true } } },
    })

    const now = Date.now()
    const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

    const sessions = bookings.map((b) => {
      // Mốc bắt đầu hẹn (giờ VN UTC+7) để xác định phase
      const [hh, mm] = b.time.split(':').map(Number)
      const startMs =
        Date.UTC(b.date.getUTCFullYear(), b.date.getUTCMonth(), b.date.getUTCDate(), hh || 0, mm || 0) - ICT_OFFSET_MS

      // phase: pending | upcoming (CONFIRMED, chưa tới giờ) | ongoing (CONFIRMED, đã tới giờ) | past (COMPLETED)
      let phase: 'pending' | 'upcoming' | 'ongoing' | 'past'
      if (b.status === 'COMPLETED') {
        phase = 'past'
      } else if (b.status === 'CONFIRMED') {
        phase = now >= startMs ? 'ongoing' : 'upcoming'
      } else {
        phase = 'pending'
      }

      const completedAt = b.status === 'COMPLETED' ? b.updated_at : null
      return {
        bookingId: b.id,
        status: b.status,
        phase,
        date: b.date.toISOString().split('T')[0],
        time: b.time,
        packageName: b.package?.name ?? '',
        duration: b.package?.duration ?? 0,
        completedAt: completedAt?.toISOString() ?? null,
        graceEndsAt: completedAt ? new Date(completedAt.getTime() + 30 * 60 * 1000).toISOString() : null,
      }
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error('List sessions error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { isParticipant } from '@/lib/chat'
import { createNotification } from '@/lib/notifications'

// Lấy conversation + xác thực participant; trả { error, status } hoặc { conv, userId }
async function loadAuthorized(conversationId: number) {
  const session = await getSession()
  if (!session) return { error: 'Vui lòng đăng nhập.', status: 401 as const }
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } })
  if (!conv) return { error: 'Không tìm thấy hội thoại.', status: 404 as const }
  const userId = Number(session.sub)
  if (!isParticipant(conv, userId)) {
    return { error: 'Bạn không có quyền với hội thoại này.', status: 403 as const }
  }
  return { conv, userId }
}

// GET /api/conversations/[id]/messages?since=<id>&limit=50
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversationId = Number(id)
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json({ error: 'Mã hội thoại không hợp lệ.' }, { status: 400 })
    }

    const auth = await loadAuthorized(conversationId)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { conv, userId } = auth

    const sinceParam = request.nextUrl.searchParams.get('since')
    const since = sinceParam ? Number(sinceParam) : 0
    const limitParam = Number(request.nextUrl.searchParams.get('limit'))
    const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100 ? limitParam : 50

    const messages = await prisma.message.findMany({
      where: { conversation_id: conversationId, ...(since > 0 ? { id: { gt: since } } : {}) },
      orderBy: { id: 'asc' },
      take: limit,
    })

    // Side-effect: đánh dấu đã đọc tới tin mới nhất
    if (messages.length > 0) {
      const field = conv.participant_1_id === userId ? 'participant_1_last_read' : 'participant_2_last_read'
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { [field]: new Date() },
      })
      
      // Đánh dấu tất cả NEW_MESSAGE notifications của người dùng này là đã đọc
      // (tức là người dùng đã xem tin nhắn trong cuộc hội thoại này)
      await prisma.notification.updateMany({
        where: {
          user_id: userId,
          type: 'NEW_MESSAGE',
          is_read: false,
        },
        data: { is_read: true },
      })
    }

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        senderUserId: m.sender_user_id,
        bookingId: m.booking_id,
        type: m.type,
        body: m.body,
        mediaUrl: m.media_url,
        createdAt: m.created_at.toISOString(),
        mine: m.sender_user_id === userId,
      })),
    })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/conversations/[id]/messages — gửi tin nhắn
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const conversationId = Number(id)
    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return NextResponse.json({ error: 'Mã hội thoại không hợp lệ.' }, { status: 400 })
    }

    const auth = await loadAuthorized(conversationId)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { conv, userId } = auth

    const body = await request.json().catch(() => null)
    const type = ['TEXT', 'IMAGE', 'AUDIO', 'STICKER'].includes(body?.type) ? body.type : 'TEXT'
    const text = typeof body?.body === 'string' ? body.body.trim() : ''
    const mediaUrl = typeof body?.mediaUrl === 'string' ? body.mediaUrl : null

    // Validate theo loại tin nhắn
    if (type === 'TEXT' || type === 'STICKER') {
      if (!text) {
        return NextResponse.json({ error: 'Nội dung tin nhắn trống.' }, { status: 400 })
      }
      if (text.length > 5000) {
        return NextResponse.json({ error: 'Tin nhắn quá dài.' }, { status: 400 })
      }
    } else {
      // IMAGE / AUDIO cần media
      if (!mediaUrl) {
        return NextResponse.json({ error: 'Thiếu dữ liệu phương tiện.' }, { status: 400 })
      }
      if (mediaUrl.length > 3_500_000) {
        return NextResponse.json({ error: 'Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn.' }, { status: 400 })
      }
    }

    const now = new Date()
    const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

    // bookingId tùy chọn: phải thuộc đúng cặp + đang CONFIRMED + đã tới giờ hẹn
    let bookingId: number | null = null
    if (body?.bookingId != null) {
      const bid = Number(body.bookingId)
      const booking = await prisma.booking.findUnique({
        where: { id: bid },
      })
      if (
        !booking ||
        !((booking.requester_id === conv.participant_1_id && booking.provider_id === conv.participant_2_id) ||
          (booking.requester_id === conv.participant_2_id && booking.provider_id === conv.participant_1_id))
      ) {
        return NextResponse.json({ error: 'Lịch hẹn không hợp lệ.' }, { status: 400 })
      }
      if (booking.status !== 'CONFIRMED') {
        return NextResponse.json({ error: 'Chỉ gắn tin nhắn vào lịch đã xác nhận.' }, { status: 409 })
      }
      // Chặn nhắn khi phiên chưa tới giờ (mục: trước giờ hẹn không cho nhắn)
      const [hh, mm] = booking.time.split(':').map(Number)
      const startMs =
        Date.UTC(booking.date.getUTCFullYear(), booking.date.getUTCMonth(), booking.date.getUTCDate(), hh || 0, mm || 0) - ICT_OFFSET_MS
      if (now.getTime() < startMs) {
        return NextResponse.json({ error: 'Phiên chưa bắt đầu. Vui lòng đợi tới giờ hẹn.' }, { status: 409 })
      }
      bookingId = bid
    }

    const readField = conv.participant_1_id === userId ? 'participant_1_last_read' : 'participant_2_last_read'

    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversation_id: conversationId,
          sender_user_id: userId,
          booking_id: bookingId,
          type,
          body: text,
          media_url: mediaUrl,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: { last_message_at: now, [readField]: now },
      }),
    ])

    // Gửi thông báo cho người nhận tin nhắn
    const counterpartUserId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
    // Không gửi notification cho tin nhắn - chỉ lưu trong DB
    // if (counterpartUserId !== userId) {
    //   createNotification({ ... })
    // }

    return NextResponse.json(
      {
        success: true,
        message: {
          id: message.id,
          senderUserId: message.sender_user_id,
          bookingId: message.booking_id,
          type: message.type,
          body: message.body,
          mediaUrl: message.media_url,
          createdAt: message.created_at.toISOString(),
          mine: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Gửi tin nhắn thất bại.' }, { status: 500 })
  }
}

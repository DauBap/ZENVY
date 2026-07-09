import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { getUserDisplay } from '@/lib/chat'

// GET /api/conversations — danh sách hội thoại của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    const userId = Number(session.sub)

    const convs = await prisma.conversation.findMany({
      where: { OR: [{ participant_1_id: userId }, { participant_2_id: userId }] },
      orderBy: { last_message_at: 'desc' },
      // Giới hạn 100 conversations mới nhất
      take: 100,
      include: {
        messages: { orderBy: { id: 'desc' }, take: 1 },
      },
    })

    // Fix: batch load tất cả counterpart users 1 lần thay vì N+1
    const counterpartIds = convs.map((c) =>
      c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id
    )
    const counterpartUsers = await prisma.user.findMany({
      where: { id: { in: counterpartIds } },
      select: {
        id: true,
        reader_info: { select: { display_name: true, avatar_url: true, last_seen_at: true } },
        customer_info: { select: { fullname: true, avatar_url: true } },
      },
    })
    const userMap = new Map(counterpartUsers.map((u) => [u.id, u]))

    // Fix: batch count unread thay vì N query riêng lẻ
    const unreadCounts = await Promise.all(
      convs.map((c) => {
        const myLastRead = c.participant_1_id === userId ? c.participant_1_last_read : c.participant_2_last_read
        return prisma.message.count({
          where: {
            conversation_id: c.id,
            sender_user_id: { not: userId },
            ...(myLastRead ? { created_at: { gt: myLastRead } } : {}),
          },
        })
      })
    )

    // Fix: 1 query batch tất cả CONFIRMED bookings giữa các cặp thay vì N queries
    const convPairs = convs.map((c) => ({
      p1: c.participant_1_id,
      p2: c.participant_2_id,
    }))
    const allParticipantIds = [...new Set([...convPairs.map((p) => p.p1), ...convPairs.map((p) => p.p2)])]
    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        requester_id: { in: allParticipantIds },
        provider_id: { in: allParticipantIds },
      },
      select: { id: true, requester_id: true, provider_id: true, date: true, time: true },
    })

    const now = Date.now()
    const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

    const items = convs.map((c, i) => {
      const counterpartId = c.participant_1_id === userId ? c.participant_2_id : c.participant_1_id
      const u = userMap.get(counterpartId)
      const name =
        u?.reader_info?.display_name ?? u?.customer_info?.fullname ?? 'Người dùng'
      const avatar =
        u?.reader_info?.avatar_url ?? u?.customer_info?.avatar_url ?? '/placeholder-user.jpg'
      const lastSeen = u?.reader_info?.last_seen_at
      const isOnline = lastSeen ? now - new Date(lastSeen).getTime() < 5 * 60 * 1000 : false

      const hasOngoingSession = confirmedBookings
        .filter(
          (b) =>
            (b.requester_id === c.participant_1_id && b.provider_id === c.participant_2_id) ||
            (b.requester_id === c.participant_2_id && b.provider_id === c.participant_1_id)
        )
        .some((b) => {
          const [hh, mm] = b.time.split(':').map(Number)
          const startMs =
            Date.UTC(b.date.getUTCFullYear(), b.date.getUTCMonth(), b.date.getUTCDate(), hh || 0, mm || 0) - ICT_OFFSET_MS
          return now >= startMs
        })

      const last = c.messages[0]
      return {
        id: c.id,
        counterpartUserId: counterpartId,
        name,
        avatar,
        isOnline,
        lastMessage: last?.body ?? '',
        lastMessageAt: c.last_message_at?.toISOString() ?? null,
        unread: unreadCounts[i],
        hasOngoingSession,
      }
    })

    return NextResponse.json({ conversations: items })
  } catch (error) {
    console.error('List conversations error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/conversations — get-or-create conversation with participant
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    const userId = Number(session.sub)
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    let participant1Id: number
    let participant2Id: number
    let participant1Role: string
    let participant2Role: string

    // Support both old API (customerId/readerId) and new generic API (userId)
    if (body.userId) {
      // New generic participant API
      const participantId = Number(body.userId)
      if (!Number.isInteger(participantId)) {
        return NextResponse.json({ error: 'Thiếu thông tin participant.' }, { status: 400 })
      }
      
      // Get participant user info
      const participantUser = await prisma.user.findUnique({
        where: { id: participantId },
        select: { id: true, reader_info: { select: { status: true } } },
      })
      if (!participantUser) {
        return NextResponse.json({ error: 'Người dùng không tồn tại.' }, { status: 404 })
      }

      if (userId === participantId) {
        return NextResponse.json({ error: 'Không thể tự nhắn tin với chính mình.' }, { status: 400 })
      }

      // Determine roles based on reader status
      const currentUserIsReader = session.role === 'READER' || (session.role !== 'READER' && (await prisma.readerInfo.findUnique({ where: { user_id: userId }, select: { status: true } }))?.status === 'ACTIVE')
      const participantIsReader = participantUser.reader_info?.status === 'ACTIVE'

      // Always put smaller ID first for unique constraint
      if (userId < participantId) {
        participant1Id = userId
        participant2Id = participantId
        participant1Role = currentUserIsReader ? 'READER' : 'CUSTOMER'
        participant2Role = participantIsReader ? 'READER' : 'CUSTOMER'
      } else {
        participant1Id = participantId
        participant2Id = userId
        participant1Role = participantIsReader ? 'READER' : 'CUSTOMER'
        participant2Role = currentUserIsReader ? 'READER' : 'CUSTOMER'
      }
    } else if (body.customerId && body.customerId !== undefined) {
      // Legacy API: reader opens conversation with customer
      const customerId = Number(body.customerId)
      if (!Number.isInteger(customerId)) {
        return NextResponse.json({ error: 'Thiếu thông tin khách hàng.' }, { status: 400 })
      }
      const ci = await prisma.customerInfo.findUnique({ where: { id: customerId }, select: { user_id: true } })
      if (!ci) {
        return NextResponse.json({ error: 'Không tìm thấy khách hàng.' }, { status: 404 })
      }
      const customerUserId = ci.user_id
      if (userId === customerUserId) {
        return NextResponse.json({ error: 'Không thể tự nhắn tin với chính mình.' }, { status: 400 })
      }
      // Customer ID should be smaller for unique constraint
      participant1Id = Math.min(userId, customerUserId)
      participant2Id = Math.max(userId, customerUserId)
      participant1Role = participant1Id === userId ? 'READER' : 'CUSTOMER'
      participant2Role = participant2Id === userId ? 'READER' : 'CUSTOMER'
    } else if (body.readerId) {
      // Legacy API: someone opens conversation with a reader (by ReaderInfo.id)
      const readerId = Number(body.readerId)
      if (!Number.isInteger(readerId)) {
        return NextResponse.json({ error: 'Thiếu thông tin reader.' }, { status: 400 })
      }
      const ri = await prisma.readerInfo.findUnique({ where: { id: readerId }, select: { user_id: true } })
      if (!ri) {
        return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })
      }
      const readerUserId = ri.user_id
      if (userId === readerUserId) {
        return NextResponse.json({ error: 'Không thể tự nhắn tin với chính mình.' }, { status: 400 })
      }
      // Determine current user's actual role
      const currentUserIsReader = session.role === 'READER'
      // Always put smaller ID first for unique constraint
      if (userId < readerUserId) {
        participant1Id = userId
        participant2Id = readerUserId
        participant1Role = currentUserIsReader ? 'READER' : 'CUSTOMER'
        participant2Role = 'READER'
      } else {
        participant1Id = readerUserId
        participant2Id = userId
        participant1Role = 'READER'
        participant2Role = currentUserIsReader ? 'READER' : 'CUSTOMER'
      }
    } else {
      return NextResponse.json({ error: 'Thiếu thông tin participant.' }, { status: 400 })
    }

    const conv = await prisma.conversation.upsert({
      where: { participant_1_id_participant_2_id: { participant_1_id: participant1Id, participant_2_id: participant2Id } },
      update: {},
      create: {
        participant_1_id: participant1Id,
        participant_2_id: participant2Id,
        participant_1_role: participant1Role,
        participant_2_role: participant2Role,
      },
    })

    const counterpartId = conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id
    const display = await getUserDisplay(counterpartId)

    return NextResponse.json({
      conversation: {
        id: conv.id,
        counterpartUserId: counterpartId,
        name: display.name,
        avatar: display.avatar,
      },
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return NextResponse.json({ error: 'Tạo hội thoại thất bại.' }, { status: 500 })
  }
}

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
      where: { OR: [{ customer_user_id: userId }, { reader_user_id: userId }] },
      orderBy: { last_message_at: 'desc' },
      include: {
        messages: { orderBy: { id: 'desc' }, take: 1 },
      },
    })

    const items = await Promise.all(
      convs.map(async (c) => {
        const counterpartId = c.customer_user_id === userId ? c.reader_user_id : c.customer_user_id
        const display = await getUserDisplay(counterpartId)
        const myLastRead = c.customer_user_id === userId ? c.customer_last_read_at : c.reader_last_read_at
        const unread = await prisma.message.count({
          where: {
            conversation_id: c.id,
            sender_user_id: { not: userId },
            ...(myLastRead ? { created_at: { gt: myLastRead } } : {}),
          },
        })
        const last = c.messages[0]
        return {
          id: c.id,
          counterpartUserId: counterpartId,
          name: display.name,
          avatar: display.avatar,
          lastMessage: last?.body ?? '',
          lastMessageAt: c.last_message_at?.toISOString() ?? null,
          unread,
        }
      })
    )

    return NextResponse.json({ conversations: items })
  } catch (error) {
    console.error('List conversations error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/conversations — get-or-create theo counterpart
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

    let customerUserId: number
    let readerUserId: number

    if (session.role === 'READER') {
      // Reader mở hội thoại với một khách hàng (customerId = CustomerInfo.id)
      const customerId = Number(body.customerId)
      if (!Number.isInteger(customerId)) {
        return NextResponse.json({ error: 'Thiếu thông tin khách hàng.' }, { status: 400 })
      }
      const ci = await prisma.customerInfo.findUnique({ where: { id: customerId }, select: { user_id: true } })
      if (!ci) {
        return NextResponse.json({ error: 'Không tìm thấy khách hàng.' }, { status: 404 })
      }
      customerUserId = ci.user_id
      readerUserId = userId
    } else {
      // Khách mở hội thoại với một reader (readerId = ReaderInfo.id)
      const readerId = Number(body.readerId)
      if (!Number.isInteger(readerId)) {
        return NextResponse.json({ error: 'Thiếu thông tin reader.' }, { status: 400 })
      }
      const ri = await prisma.readerInfo.findUnique({ where: { id: readerId }, select: { user_id: true } })
      if (!ri) {
        return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })
      }
      customerUserId = userId
      readerUserId = ri.user_id
    }

    if (customerUserId === readerUserId) {
      return NextResponse.json({ error: 'Không thể tự nhắn tin với chính mình.' }, { status: 400 })
    }

    const conv = await prisma.conversation.upsert({
      where: { customer_user_id_reader_user_id: { customer_user_id: customerUserId, reader_user_id: readerUserId } },
      update: {},
      create: { customer_user_id: customerUserId, reader_user_id: readerUserId },
    })

    const counterpartId = conv.customer_user_id === userId ? conv.reader_user_id : conv.customer_user_id
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

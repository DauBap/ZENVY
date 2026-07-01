import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const userId = Number(session.sub)
    const conversationIds = await prisma.conversation.findMany({
      where: { OR: [{ customer_user_id: userId }, { reader_user_id: userId }] },
      select: { id: true, customer_last_read_at: true, reader_last_read_at: true, customer_user_id: true, reader_user_id: true },
    })

    const counts = await Promise.all(
      conversationIds.map(async (conv) => {
        const myLastRead = conv.customer_user_id === userId ? conv.customer_last_read_at : conv.reader_last_read_at
        return prisma.message.count({
          where: {
            conversation_id: conv.id,
            sender_user_id: { not: userId },
            ...(myLastRead ? { created_at: { gt: myLastRead } } : {}),
          },
        })
      })
    )

    return NextResponse.json({ count: counts.reduce((sum, value) => sum + value, 0) })
  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

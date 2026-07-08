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
      where: { OR: [{ participant_1_id: userId }, { participant_2_id: userId }] },
      select: { id: true, participant_1_last_read: true, participant_2_last_read: true, participant_1_id: true, participant_2_id: true },
    })

    const counts = await Promise.all(
      conversationIds.map(async (conv) => {
        const myLastRead = conv.participant_1_id === userId ? conv.participant_1_last_read : conv.participant_2_last_read
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

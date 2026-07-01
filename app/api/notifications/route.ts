import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/notifications — danh sách + số chưa đọc
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = Number(session.sub)
  const limit = Math.min(50, Number(request.nextUrl.searchParams.get('limit') ?? 20))

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId, is_read: false } }),
  ])

  return NextResponse.json({
    unreadCount,
    notifications: notifications.map(n => ({
      id: n.id,
      title: n.title,
      content: n.content,
      type: n.type,
      isRead: n.is_read,
      link: n.link,
      createdAt: n.created_at.toISOString(),
    })),
  })
}

// PATCH /api/notifications — đánh dấu đã đọc (all hoặc by id)
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = Number(session.sub)
  const body = await request.json().catch(() => ({}))

  if (body?.id) {
    // Đọc một notification cụ thể
    await prisma.notification.updateMany({
      where: { id: Number(body.id), user_id: userId },
      data: { is_read: true },
    })
  } else {
    // Đọc tất cả
    await prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    })
  }

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, is_read: false },
  })
  return NextResponse.json({ success: true, unreadCount })
}

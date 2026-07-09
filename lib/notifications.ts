import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@prisma/client'
import webpush from 'web-push'

// Cấu hình VAPID một lần
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_MAILTO ?? 'mailto:admin@sageto.vn',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  )
}

export interface CreateNotificationOptions {
  userId: number
  title: string
  content: string
  type: NotificationType
  link?: string
}

/**
 * Tạo notification trong DB + gửi Web Push đến tất cả thiết bị đã subscribe
 */
export async function createNotification(opts: CreateNotificationOptions) {
  // 1. Ghi vào DB
  const notification = await prisma.notification.create({
    data: {
      user_id: opts.userId,
      title: opts.title,
      content: opts.content,
      type: opts.type,
      link: opts.link ?? null,
    },
  })

  // 2. Gửi Web Push (fire-and-forget — không throw nếu lỗi)
  if (process.env.VAPID_PRIVATE_KEY) {
    const subs = await prisma.pushSubscription.findMany({
      where: { user_id: opts.userId },
    })

    const payload = JSON.stringify({
      title: opts.title,
      body: opts.content,
      icon: '/icon-light-32x32.png',
      badge: '/icon-dark-32x32.png',
      link: opts.link ?? '/dashboard',
    })

    await Promise.allSettled(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } },
            payload,
          )
        } catch (err: any) {
          // Subscription hết hạn → xóa khỏi DB
          if (err?.statusCode === 410 || err?.statusCode === 404) {
            await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {})
          }
        }
      })
    )
  }

  return notification
}

export async function createNotificationForAdmins(opts: Omit<CreateNotificationOptions, 'userId'>) {
  const admins = await prisma.user.findMany({
    where: { role: { name: 'ADMIN' } },
    select: { id: true },
  })

  await Promise.allSettled(
    admins.map((admin) =>
      createNotification({
        ...opts,
        userId: admin.id,
      }),
    ),
  )
}

/** Lấy số thông báo chưa đọc */
export async function getUnreadCount(userId: number): Promise<number> {
  return prisma.notification.count({ where: { user_id: userId, is_read: false } })
}

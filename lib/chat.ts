import { prisma } from '@/lib/prisma'
import { isReaderOnline } from '@/lib/online'

// Thông tin hiển thị của một user (tên + avatar) tùy theo role
export async function getUserDisplay(userId: number): Promise<{ name: string; avatar: string | null; isOnline: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer_info: true, reader_info: true },
  })
  if (!user) return { name: 'Người dùng', avatar: null, isOnline: false }
  if (user.reader_info) {
    return {
      name: user.reader_info.display_name ?? 'Tarot Reader',
      avatar: user.reader_info.avatar_url ?? null,
      isOnline: isReaderOnline(user.reader_info.last_seen_at),
    }
  }
  return {
    name: user.customer_info?.fullname ?? user.email.split('@')[0],
    avatar: user.customer_info?.avatar_url ?? null,
    isOnline: false,
  }
}

// Kiểm tra userId có phải participant của conversation không
export function isParticipant(
  conv: { participant_1_id: number; participant_2_id: number },
  userId: number
): boolean {
  return conv.participant_1_id === userId || conv.participant_2_id === userId
}

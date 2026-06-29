import { prisma } from '@/lib/prisma'

// Thông tin hiển thị của một user (tên + avatar) tùy theo role
export async function getUserDisplay(userId: number): Promise<{ name: string; avatar: string | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer_info: true, reader_info: true },
  })
  if (!user) return { name: 'Người dùng', avatar: null }
  if (user.reader_info) {
    return {
      name: user.reader_info.display_name ?? 'Tarot Reader',
      avatar: user.reader_info.avatar_url ?? null,
    }
  }
  return {
    name: user.customer_info?.fullname ?? user.email.split('@')[0],
    avatar: user.customer_info?.avatar_url ?? null,
  }
}

// Kiểm tra userId có phải participant của conversation không
export function isParticipant(
  conv: { customer_user_id: number; reader_user_id: number },
  userId: number
): boolean {
  return conv.customer_user_id === userId || conv.reader_user_id === userId
}

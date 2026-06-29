import { prisma } from '@/lib/prisma'
import { getUserDisplay } from '@/lib/chat'

export interface ForumAuthor {
  userId: number | null   // null khi ẩn danh với người xem
  name: string
  avatar: string | null
  isReader: boolean
  isVerified: boolean
}

// Resolve tác giả cho hiển thị. Nếu ẩn danh và viewer KHÔNG phải tác giả → ẩn danh tính.
export async function resolveAuthor(
  authorUserId: number,
  isAnonymous: boolean,
  viewerUserId: number | null
): Promise<ForumAuthor> {
  const isOwner = viewerUserId === authorUserId
  if (isAnonymous && !isOwner) {
    return { userId: null, name: 'Ẩn danh', avatar: null, isReader: false, isVerified: false }
  }
  const user = await prisma.user.findUnique({
    where: { id: authorUserId },
    include: { customer_info: true, reader_info: true },
  })
  const display = await getUserDisplay(authorUserId)
  const label = isAnonymous && isOwner ? `${display.name} (ẩn danh)` : display.name
  return {
    userId: authorUserId,
    name: label,
    avatar: display.avatar,
    isReader: !!user?.reader_info,
    isVerified: user?.reader_info?.verified ?? false,
  }
}

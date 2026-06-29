import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

// GET /api/posts/liked — bài viết đã thích
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const userId = Number(session.sub)
    const likes = await prisma.forumLike.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        post: {
          include: {
            _count: { select: { comments: true, likes: true } },
            saves: { where: { user_id: userId }, select: { id: true } },
          },
        },
      },
    })

    const posts = await Promise.all(
      likes.map(async (l) => ({
        id: l.post.id,
        content: l.post.content,
        imageUrl: l.post.image_url,
        createdAt: l.post.created_at.toISOString(),
        author: await resolveAuthor(l.post.author_user_id, l.post.is_anonymous, userId),
        likeCount: l.post._count.likes,
        commentCount: l.post._count.comments,
        likedByMe: true,
        savedByMe: l.post.saves.length > 0,
        canDelete: userId === l.post.author_user_id,
      }))
    )

    return NextResponse.json({ posts })
  } catch (e) {
    console.error('Liked posts error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

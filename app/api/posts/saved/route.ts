import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

// GET /api/posts/saved — bài viết đã lưu của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const userId = Number(session.sub)
    const saves = await prisma.forumSave.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        post: {
          include: {
            _count: { select: { comments: true, likes: true } },
            likes: { where: { user_id: userId }, select: { id: true } },
          },
        },
      },
    })

    const posts = await Promise.all(
      saves.map(async (s) => ({
        id: s.post.id,
        content: s.post.content,
        imageUrl: s.post.image_url,
        createdAt: s.post.created_at.toISOString(),
        author: await resolveAuthor(s.post.author_user_id, s.post.is_anonymous, userId),
        likeCount: s.post._count.likes,
        commentCount: s.post._count.comments,
        likedByMe: s.post.likes.length > 0,
        savedByMe: true,
        canDelete: userId === s.post.author_user_id,
      }))
    )

    return NextResponse.json({ posts })
  } catch (e) {
    console.error('Saved posts error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

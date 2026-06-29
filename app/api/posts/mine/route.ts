import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

// GET /api/posts/mine — bài viết của user hiện tại
export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const userId = Number(session.sub)
    const posts = await prisma.forumPost.findMany({
      where: { author_user_id: userId },
      orderBy: { id: 'desc' },
      include: {
        _count: { select: { comments: true, likes: true } },
        likes: { where: { user_id: userId }, select: { id: true } },
        saves: { where: { user_id: userId }, select: { id: true } },
      },
    })

    const items = await Promise.all(
      posts.map(async (p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.image_url,
        createdAt: p.created_at.toISOString(),
        author: await resolveAuthor(p.author_user_id, p.is_anonymous, userId),
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        likedByMe: p.likes.length > 0,
        savedByMe: p.saves.length > 0,
        canDelete: true,
        canEdit: true,
      }))
    )

    return NextResponse.json({ posts: items })
  } catch (e) {
    console.error('Mine posts error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/posts/[id]/like — toggle like
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    const { id } = await params
    const postId = Number(id)
    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: 'Mã bài viết không hợp lệ.' }, { status: 400 })
    }

    const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true } })
    if (!post) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
    }

    const userId = Number(session.sub)
    const existing = await prisma.forumLike.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
      select: { id: true },
    })

    let liked: boolean
    if (existing) {
      await prisma.forumLike.delete({ where: { id: existing.id } })
      liked = false
    } else {
      await prisma.forumLike.create({ data: { post_id: postId, user_id: userId } })
      liked = true
    }

    const likeCount = await prisma.forumLike.count({ where: { post_id: postId } })
    return NextResponse.json({ success: true, liked, likeCount })
  } catch (error) {
    console.error('Toggle like error:', error)
    return NextResponse.json({ error: 'Thao tác thất bại.' }, { status: 500 })
  }
}

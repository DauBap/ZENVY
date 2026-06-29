import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

// GET /api/posts/[id]/comments — danh sách bình luận
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    const viewerId = session ? Number(session.sub) : null

    const { id } = await params
    const postId = Number(id)
    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: 'Mã bài viết không hợp lệ.' }, { status: 400 })
    }

    const comments = await prisma.forumComment.findMany({
      where: { post_id: postId },
      orderBy: { id: 'asc' },
    })

    const items = await Promise.all(
      comments.map(async (c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.created_at.toISOString(),
        author: await resolveAuthor(c.author_user_id, c.is_anonymous, viewerId),
      }))
    )

    return NextResponse.json({ comments: items })
  } catch (error) {
    console.error('List comments error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments — bình luận
export async function POST(
  request: NextRequest,
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

    const body = await request.json().catch(() => null)
    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    if (!content) {
      return NextResponse.json({ error: 'Nội dung bình luận trống.' }, { status: 400 })
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: 'Bình luận quá dài.' }, { status: 400 })
    }

    const viewerId = Number(session.sub)
    const isAnonymous = body?.isAnonymous === true
    const comment = await prisma.forumComment.create({
      data: { post_id: postId, author_user_id: viewerId, content, is_anonymous: isAnonymous },
    })

    return NextResponse.json(
      {
        success: true,
        comment: {
          id: comment.id,
          content: comment.content,
          createdAt: comment.created_at.toISOString(),
          author: await resolveAuthor(comment.author_user_id, comment.is_anonymous, viewerId),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json({ error: 'Bình luận thất bại.' }, { status: 500 })
  }
}

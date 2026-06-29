import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

const MAX_IMAGE_LEN = 1_500_000

// GET /api/posts?cursor=<id> — feed phân trang (mới nhất trước)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    const viewerId = session ? Number(session.sub) : null

    const cursorParam = request.nextUrl.searchParams.get('cursor')
    const cursor = cursorParam ? Number(cursorParam) : null
    const limit = 10

    const posts = await prisma.forumPost.findMany({
      where: cursor ? { id: { lt: cursor } } : {},
      orderBy: { id: 'desc' },
      take: limit,
      include: {
        _count: { select: { comments: true, likes: true } },
        likes: viewerId ? { where: { user_id: viewerId }, select: { id: true } } : false,
        saves: viewerId ? { where: { user_id: viewerId }, select: { id: true } } : false,
      },
    })

    const items = await Promise.all(
      posts.map(async (p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.image_url,
        createdAt: p.created_at.toISOString(),
        author: await resolveAuthor(p.author_user_id, p.is_anonymous, viewerId),
        likeCount: p._count.likes,
        commentCount: p._count.comments,
        likedByMe: Array.isArray(p.likes) ? p.likes.length > 0 : false,
        savedByMe: Array.isArray(p.saves) ? p.saves.length > 0 : false,
        canDelete: viewerId === p.author_user_id,
        canEdit: viewerId === p.author_user_id,
      }))
    )

    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null
    return NextResponse.json({ posts: items, nextCursor })
  } catch (error) {
    console.error('List posts error:', error)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

// POST /api/posts — đăng bài (mọi user)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }
    const body = await request.json().catch(() => null)
    const content = typeof body?.content === 'string' ? body.content.trim() : ''
    const imageUrl = typeof body?.imageUrl === 'string' ? body.imageUrl : null

    if (!content && !imageUrl) {
      return NextResponse.json({ error: 'Nội dung bài viết trống.' }, { status: 400 })
    }
    if (content.length > 5000) {
      return NextResponse.json({ error: 'Bài viết quá dài.' }, { status: 400 })
    }
    if (imageUrl && imageUrl.length > MAX_IMAGE_LEN) {
      return NextResponse.json({ error: 'Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.' }, { status: 400 })
    }

    const viewerId = Number(session.sub)
    const isAnonymous = body?.isAnonymous === true
    const post = await prisma.forumPost.create({
      data: { author_user_id: viewerId, content, image_url: imageUrl, is_anonymous: isAnonymous },
    })

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post.id,
          content: post.content,
          imageUrl: post.image_url,
          createdAt: post.created_at.toISOString(),
          author: await resolveAuthor(post.author_user_id, post.is_anonymous, viewerId),
          likeCount: 0,
          commentCount: 0,
          likedByMe: false,
          savedByMe: false,
          canDelete: true,
          canEdit: true,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Đăng bài thất bại.' }, { status: 500 })
  }
}

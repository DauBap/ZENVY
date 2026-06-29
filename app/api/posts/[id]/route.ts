import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { resolveAuthor } from '@/lib/forum'

// DELETE /api/posts/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const postId = Number(id)
    if (!Number.isInteger(postId) || postId <= 0)
      return NextResponse.json({ error: 'ID không hợp lệ.' }, { status: 400 })

    const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { author_user_id: true } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
    if (post.author_user_id !== Number(session.sub))
      return NextResponse.json({ error: 'Bạn không có quyền xóa bài này.' }, { status: 403 })

    await prisma.forumPost.delete({ where: { id: postId } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete post error:', e)
    return NextResponse.json({ error: 'Xóa bài thất bại.' }, { status: 500 })
  }
}

// PATCH /api/posts/[id] — chỉnh sửa bài viết (chỉ tác giả)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })

    const { id } = await params
    const postId = Number(id)
    if (!Number.isInteger(postId) || postId <= 0)
      return NextResponse.json({ error: 'ID không hợp lệ.' }, { status: 400 })

    const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { author_user_id: true } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })
    if (post.author_user_id !== Number(session.sub))
      return NextResponse.json({ error: 'Bạn không có quyền sửa bài này.' }, { status: 403 })

    const body = await request.json().catch(() => null)
    const content = typeof body?.content === 'string' ? body.content.trim() : null
    const imageUrl = body?.imageUrl !== undefined ? (body.imageUrl || null) : undefined

    if (content !== null && content.length > 5000)
      return NextResponse.json({ error: 'Bài viết quá dài.' }, { status: 400 })
    if (!content && imageUrl === null)
      return NextResponse.json({ error: 'Nội dung bài viết trống.' }, { status: 400 })

    const updated = await prisma.forumPost.update({
      where: { id: postId },
      data: {
        ...(content !== null && { content }),
        ...(imageUrl !== undefined && { image_url: imageUrl }),
      },
    })

    const viewerId = Number(session.sub)
    return NextResponse.json({
      success: true,
      post: {
        id: updated.id,
        content: updated.content,
        imageUrl: updated.image_url,
        createdAt: updated.created_at.toISOString(),
        author: await resolveAuthor(updated.author_user_id, updated.is_anonymous, viewerId),
      },
    })
  } catch (e) {
    console.error('Edit post error:', e)
    return NextResponse.json({ error: 'Sửa bài thất bại.' }, { status: 500 })
  }
}

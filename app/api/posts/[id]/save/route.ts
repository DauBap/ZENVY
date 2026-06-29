import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/posts/[id]/save — toggle save
export async function POST(
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

    const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết.' }, { status: 404 })

    const userId = Number(session.sub)
    const existing = await prisma.forumSave.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
      select: { id: true },
    })

    let saved: boolean
    if (existing) {
      await prisma.forumSave.delete({ where: { id: existing.id } })
      saved = false
    } else {
      await prisma.forumSave.create({ data: { post_id: postId, user_id: userId } })
      saved = true
    }

    return NextResponse.json({ success: true, saved })
  } catch (e) {
    console.error('Toggle save error:', e)
    return NextResponse.json({ error: 'Thao tác thất bại.' }, { status: 500 })
  }
}

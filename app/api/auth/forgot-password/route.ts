import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// POST /api/auth/forgot-password — tạo reset token
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Vui lòng nhập email.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

    // Luôn trả 200 để tránh leak email có tồn tại không
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn.' })
    }

    // Xóa token cũ chưa dùng
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id, used: false },
    })

    const token = randomBytes(32).toString('hex')
    const expiredAt = new Date(Date.now() + 60 * 60 * 1000) // 1 giờ

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expired_at: expiredAt },
    })

    // TODO: Gửi email với link reset
    // Tạm thời: trả token trong response (chỉ dùng khi dev/không có email service)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`
    console.log(`[RESET] ${email} → ${resetUrl}`)

    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn.',
      // Chỉ expose trong dev mode
      ...(process.env.NODE_ENV !== 'production' && { resetUrl }),
    })
  } catch (e) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

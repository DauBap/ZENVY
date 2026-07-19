import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

// POST /api/auth/forgot-password — tạo reset token & gửi email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Vui lòng nhập email.' }, { status: 400 })

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })

    // Luôn trả 200 để tránh leak email có tồn tại không
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ success: true, message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' })
    }

    // Xóa token cũ chưa dùng
    await prisma.passwordResetToken.deleteMany({
      where: { user_id: user.id, used: false },
    })

    const token = randomBytes(32).toString('hex')
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000) // 30 phút

    await prisma.passwordResetToken.create({
      data: { user_id: user.id, token, expired_at: expiredAt },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`

    // Gửi email reset password
    const emailSent = await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    })

    if (emailSent) {
      console.log(`[RESET] Email sent to ${email}`)
    } else {
      console.warn(`[RESET] Failed to send email to ${email}, resetUrl: ${resetUrl}`)
    }

    return NextResponse.json({
      success: true,
      message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.',
      // Chỉ expose trong dev mode (fallback khi email chưa cấu hình)
      ...(process.env.NODE_ENV !== 'production' && !emailSent && { resetUrl }),
    })
  } catch (e) {
    console.error('Forgot password error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}
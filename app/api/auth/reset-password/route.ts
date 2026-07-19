import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// POST /api/auth/reset-password — đặt lại mật khẩu bằng token
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password)
      return NextResponse.json({ error: 'Thiếu thông tin.' }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự.' }, { status: 400 })

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, status: true } } },
    })

    if (!resetToken)
      return NextResponse.json({ error: 'Token không hợp lệ.' }, { status: 400 })
    if (resetToken.used)
      return NextResponse.json({ error: 'Token đã được sử dụng.' }, { status: 400 })
    if (resetToken.expired_at < new Date())
      return NextResponse.json({ error: 'Token đã hết hạn. Vui lòng yêu cầu lại.' }, { status: 400 })
    if (resetToken.user.status !== 'ACTIVE')
      return NextResponse.json({ error: 'Tài khoản đã bị khóa.' }, { status: 403 })

    const hash = await bcrypt.hash(password, 10)

    // Update password + bump token_version để invalidate mọi JWT/session cũ
    // (kẻ tấn công giữ token cũ sẽ bị getSession từ chối do lệch token_version)
    const updatedUser = await prisma.user.update({
      where: { id: resetToken.user_id },
      data: {
        password_hash: hash,
        token_version: { increment: 1 },
      },
      select: { id: true, email: true, password_hash: true },
    })

    console.log(`[RESET] Password updated for user ${updatedUser.email}, new hash starts with: ${updatedUser.password_hash?.substring(0, 10)}`)

    // Verify the update was persisted
    const verifyUser = await prisma.user.findUnique({
      where: { id: resetToken.user_id },
      select: { password_hash: true },
    })
    const verifyMatch = await bcrypt.compare(password, verifyUser?.password_hash ?? '')
    console.log(`[RESET] Verification: password match = ${verifyMatch}`)

    if (!verifyMatch) {
      console.error(`[RESET] CRITICAL: Password was not persisted correctly for user ${resetToken.user_id}`)
      return NextResponse.json({ error: 'Lỗi lưu mật khẩu. Vui lòng thử lại.' }, { status: 500 })
    }

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    })

    console.log(`[RESET] Complete. Token marked as used.`)

    return NextResponse.json({ success: true, message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' })
  } catch (e) {
    console.error('Reset password error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

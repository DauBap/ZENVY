import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, cookieOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email và mật khẩu.' },
        { status: 400 }
      )
    }

    // Tìm user kèm role + customer_info
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        role: true,
        customer_info: true,
        reader_info: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng.' },
        { status: 401 }
      )
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.' },
        { status: 403 }
      )
    }

    // So sánh password
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Email hoặc mật khẩu không đúng.' },
        { status: 401 }
      )
    }

    // Lấy tên hiển thị theo role
    const displayName =
      user.customer_info?.fullname ??
      user.reader_info?.display_name ??
      email.split('@')[0]

    // Ký JWT
    const token = await signToken({
      sub: String(user.id),
      email: user.email,
      role: user.role.name,
      name: displayName,
    })

    // Gắn token vào httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
        role: user.role.name,
        avatar: user.customer_info?.avatar_url ?? user.reader_info?.avatar_url ?? null,
      },
    })

    response.cookies.set(cookieOptions.name, token, cookieOptions)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Đăng nhập thất bại. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}

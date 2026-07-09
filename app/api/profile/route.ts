import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, signToken, cookieOptions } from '@/lib/auth'

// Giới hạn kích thước chuỗi avatar (base64) để tránh payload quá lớn (~1.5MB)
const MAX_AVATAR_LEN = 1_500_000

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const userId = Number(session.sub)

    // Validate avatar nếu có gửi
    const avatarRaw = typeof body.avatar_url === 'string' ? body.avatar_url : undefined
    if (avatarRaw !== undefined && avatarRaw.length > MAX_AVATAR_LEN) {
      return NextResponse.json({ error: 'Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn.' }, { status: 400 })
    }

    let newName: string
    let newAvatar: string | null = null
    let readerStatus: string | null = null

    const readerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: userId },
      select: { status: true },
    })
    const isActiveReader = readerInfo?.status === 'ACTIVE'

    // ── CUSTOMER ──────────────────────────────────────────────────────────────
    if (session.role === 'CUSTOMER' && !isActiveReader) {
      const fullname = typeof body.fullname === 'string' ? body.fullname.trim() : ''
      if (!fullname) {
        return NextResponse.json({ error: 'Vui lòng nhập họ tên.' }, { status: 400 })
      }

      let birthday: Date | null = null
      if (typeof body.birthday === 'string' && body.birthday.trim()) {
        const d = new Date(body.birthday)
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: 'Ngày sinh không hợp lệ.' }, { status: 400 })
        }
        birthday = d
      }

      const data: Record<string, unknown> = {
        fullname,
        birthday,
        gender: typeof body.gender === 'string' && body.gender.trim() ? body.gender.trim() : null,
      }
      if (avatarRaw !== undefined) data.avatar_url = avatarRaw || null

      const updated = await prisma.customerInfo.update({
        where: { user_id: userId },
        data,
      })
      newName = updated.fullname ?? session.name
      newAvatar = updated.avatar_url
    }
    // ── READER ──────────────────────────────────────────────────────────────
    else if (session.role === 'READER' || isActiveReader) {
      const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''
      if (!displayName) {
        return NextResponse.json({ error: 'Vui lòng nhập tên hiển thị.' }, { status: 400 })
      }

      const expYear = Number(body.experience_year)
      if (!Number.isFinite(expYear) || expYear < 0) {
        return NextResponse.json({ error: 'Số năm kinh nghiệm không hợp lệ.' }, { status: 400 })
      }

      const price = Number(body.price_per_session)
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'Giá mỗi buổi không hợp lệ.' }, { status: 400 })
      }

      const data: Record<string, unknown> = {
        display_name: displayName,
        description: typeof body.description === 'string' ? body.description.trim() : null,
        experience_year: Math.floor(expYear),
        price_per_session: price,
        // KHÔNG nhận rating / verified — do hệ thống quản lý
      }
      // specialty (tag chuyên môn) — string[], lọc rỗng, trim, tối đa 8 tag
      if (Array.isArray(body.specialty)) {
        data.specialty = body.specialty
          .filter((s: unknown): s is string => typeof s === 'string')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 8)
      }
      if (avatarRaw !== undefined) data.avatar_url = avatarRaw || null

      const updated = await prisma.readerInfo.update({
        where: { user_id: userId },
        data,
      })
      newName = updated.display_name ?? session.name
      newAvatar = updated.avatar_url
      readerStatus = updated.status
    } else {
      return NextResponse.json({ error: 'Vai trò không được hỗ trợ.' }, { status: 403 })
    }

    // Ký lại JWT để cập nhật tên hiển thị (token đang giữ name cũ)
    const token = await signToken({
      sub: session.sub,
      email: session.email,
      role: session.role,
      name: newName,
    })

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: session.email,
        name: newName,
        role: session.role,
        avatar: newAvatar,
        readerStatus,
      },
    })
    response.cookies.set(cookieOptions.name, token, cookieOptions)
    return response
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Cập nhật hồ sơ thất bại.' }, { status: 500 })
  }
}

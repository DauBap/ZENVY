import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession, signToken, cookieOptions } from '@/lib/auth'
import { createNotificationForAdmins } from '@/lib/notifications'
import { notifyAdminReaderRegistration } from '@/lib/email'
import bcrypt from 'bcryptjs'

const MAX_AVATAR_LEN = 1_500_000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
function isValidEmail(value: string) { return EMAIL_REGEX.test(value.trim()) }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const {
      name,
      nickname,
      email,
      password,
      facebookLink,
      facebook,
      phone,
      description,
      experienceYear,
      specialty,
      avatarDataUrl,
      voiceDataUrl,
    } = body as {
      name: string
      nickname?: string
      email: string
      password: string
      facebookLink?: string
      facebook?: string
      phone: string
      description?: string
      experienceYear: number
      specialty: string[]
      avatarDataUrl: string | null
      voiceDataUrl?: string | null
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const normalizedFacebook = (typeof facebookLink === 'string' ? facebookLink : (typeof facebook === 'string' ? facebook : '')).trim()
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
    const normalizedNickname = typeof nickname === 'string' ? nickname.trim() : ''
    const normalizedDescription = typeof description === 'string' ? description.trim() : ''
    const avatarRaw = typeof avatarDataUrl === 'string' ? avatarDataUrl.trim() : ''
    const voiceRaw = typeof voiceDataUrl === 'string' && voiceDataUrl.trim() ? voiceDataUrl.trim() : null
    // display_name (nickname công khai) — fallback về họ tên thật nếu reader không đặt nickname
    const displayName = normalizedNickname || (typeof name === 'string' ? name.trim() : '')

    // If user is logged in, we support submitting reader request for existing account
    const session = await getSession().catch(() => null)
    const isLoggedIn = Boolean(session)

    // Bắt buộc: họ tên thật, SĐT, chuyên đề (multi), năm KN, ảnh đại diện, link FB/Zalo
    // Không bắt buộc: nickname (dùng họ tên nếu trống), giới thiệu, ghi âm
    if (isLoggedIn) {
      if (
        !name ||
        !normalizedPhone ||
        typeof experienceYear !== 'number' ||
        !Array.isArray(specialty) ||
        specialty.length === 0 ||
        !specialty.every(s => typeof s === 'string' && s.trim().length > 0) ||
        !avatarRaw ||
        !normalizedFacebook
      ) {
        return NextResponse.json({ error: 'Thiếu thông tin yêu cầu.' }, { status: 400 })
      }
    } else {
      if (
        !normalizedEmail ||
        !isValidEmail(normalizedEmail) ||
        !password ||
        !name ||
        !normalizedPhone ||
        typeof experienceYear !== 'number' ||
        !Array.isArray(specialty) ||
        specialty.length === 0 ||
        !specialty.every(s => typeof s === 'string' && s.trim().length > 0) ||
        !avatarRaw ||
        !normalizedFacebook
      ) {
        return NextResponse.json({ error: 'Thiếu thông tin yêu cầu.' }, { status: 400 })
      }
    }

    if (avatarRaw.length > MAX_AVATAR_LEN) {
      return NextResponse.json({ error: 'Ảnh chân dung quá lớn. Vui lòng chọn ảnh nhỏ hơn.' }, { status: 400 })
    }

    const readerRole = await prisma.role.upsert({
      where: { name: 'READER' },
      update: {},
      create: { name: 'READER', description: 'Reader role' },
    })

    let user
    if (isLoggedIn) {
      // Attach reader_info to existing user and update role
      const userId = Number(session!.sub)
      const existing = await prisma.user.findUnique({ where: { id: userId }, include: { reader_info: true } })
      if (!existing) return NextResponse.json({ error: 'Không tìm thấy người dùng.' }, { status: 404 })
      if (existing.reader_info) {
        return NextResponse.json({ error: 'Bạn đã gửi yêu cầu hoặc đã là Reader.' }, { status: 409 })
      }

      user = await prisma.user.update({
        where: { id: userId },
        data: {
          role_id: readerRole.id,
          phone: normalizedPhone || undefined,
          reader_info: {
            create: {
              display_name: displayName,
              real_name: name,
              description: normalizedDescription || null,
              experience_year: experienceYear,
              specialty: specialty,
              avatar_url: avatarRaw,
              facebook_link: normalizedFacebook,
              voice_sample: voiceRaw,
              status: 'PENDING',
              verified: false,
            },
          },
        },
        include: { reader_info: true },
      })
    } else {
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existingUser) {
        return NextResponse.json({ error: 'Email hoặc liên kết đã được sử dụng.' }, { status: 409 })
      }

      const saltRounds = 10
      const hashedPassword = await bcrypt.hash(password, saltRounds)

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password_hash: hashedPassword,
          phone: normalizedPhone || null,
          role_id: readerRole.id,
          reader_info: {
            create: {
              display_name: displayName,
              real_name: name,
              description: normalizedDescription || null,
              experience_year: experienceYear,
              specialty: specialty,
              avatar_url: avatarRaw,
              facebook_link: normalizedFacebook,
              voice_sample: voiceRaw,
              status: 'PENDING',
              verified: false,
            },
          },
        },
        include: { reader_info: true },
      })
    }

    await createNotificationForAdmins({
      title: 'Yêu cầu đăng ký Reader mới',
      content: `Có yêu cầu đăng ký reader mới từ ${name} (${normalizedEmail || 'đã đăng nhập'}). `,
      type: 'SYSTEM',
      link: '/admin/readers',
    }).catch(() => {})

    await notifyAdminReaderRegistration({
      readerName: name,
      nickname: displayName,
      email: normalizedEmail || (user && user.email) || '',
      phone: normalizedPhone,
      experienceYear,
      specialties: specialty,
      description: normalizedDescription,
      facebook: normalizedFacebook,
      adminEmail: process.env.ADMIN_EMAIL || 'sageto.support@gmail.com',
    }).catch((err) => console.error('Email error:', err))

    // Re-sign JWT so the new READER role is reflected immediately (no re-login needed)
    // name trong token = nickname công khai (dùng cho chat/dashboard); admin xem tên thật qua real_name
    const newToken = await signToken({
      sub: String(user.id),
      email: user.email,
      role: 'READER',
      name: displayName,
      tokenVersion: user.token_version,
    })

    const res = NextResponse.json({
      success: true,
      message: 'Yêu cầu đăng ký Reader đã được gửi. Admin sẽ duyệt sau.',
      user: { id: user.id, email: user.email },
    }, { status: 201 })

    res.cookies.set({ ...cookieOptions, value: newToken })
    return res
  } catch (error) {
    console.error('Register reader error:', error)
    // Prisma connection errors (e.g., database down or misconfigured DATABASE_URL)
    // have code 'ECONNREFUSED' in this environment. Return 503 to indicate service unavailable.
    const errAny = error as any
    if (errAny && (errAny.code === 'ECONNREFUSED' || (errAny.meta && errAny.meta.code === 'ECONNREFUSED'))) {
      return NextResponse.json({ error: 'Không thể kết nối tới cơ sở dữ liệu. Vui lòng thử lại sau.' }, { status: 503 })
    }
    return NextResponse.json({ error: 'Đăng ký thất bại. Vui lòng thử lại.' }, { status: 500 })
  }
}

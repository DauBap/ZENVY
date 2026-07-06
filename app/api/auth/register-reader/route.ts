import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotificationForAdmins } from '@/lib/notifications'
import bcrypt from 'bcryptjs'

const MAX_AVATAR_LEN = 1_500_000
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FACEBOOK_REGEX = /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[A-Za-z0-9_.]+\/?$/i
function isValidEmail(value: string) { return EMAIL_REGEX.test(value.trim()) }
function isValidFacebook(value: string) { return FACEBOOK_REGEX.test(value.trim()) }

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const {
      name,
      email,
      password,
      facebookLink,
      phone,
      description,
      experienceYear,
      specialty,
      avatarDataUrl,
    } = body as {
      name: string
      email: string
      password: string
      facebookLink: string
      phone: string
      description: string
      experienceYear: number
      specialty: string[]
      avatarDataUrl: string | null
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
    const normalizedFacebook = typeof facebookLink === 'string' ? facebookLink.trim() : ''
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : ''
    const avatarRaw = typeof avatarDataUrl === 'string' ? avatarDataUrl.trim() : ''

    if (
      !normalizedEmail ||
      !isValidEmail(normalizedEmail) ||
      !password ||
      !name ||
      !normalizedFacebook ||
      !isValidFacebook(normalizedFacebook) ||
      !normalizedPhone ||
      !description ||
      typeof experienceYear !== 'number' ||
      !Array.isArray(specialty) ||
      specialty.length === 0 ||
      !specialty.every(s => typeof s === 'string' && s.trim().length > 0) ||
      !avatarRaw
    ) {
      return NextResponse.json({ error: 'Thiếu thông tin yêu cầu.' }, { status: 400 })
    }

    if (avatarRaw.length > MAX_AVATAR_LEN) {
      return NextResponse.json({ error: 'Ảnh chân dung quá lớn. Vui lòng chọn ảnh nhỏ hơn.' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email hoặc liên kết đã được sử dụng.' }, { status: 409 })
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    const readerRole = await prisma.role.upsert({
      where: { name: 'READER' },
      update: {},
      create: { name: 'READER', description: 'Reader role' },
    })

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password_hash: hashedPassword,
        phone: normalizedPhone || null,
        role_id: readerRole.id,
        status: 'INACTIVE',
        reader_info: {
          create: {
            display_name: name,
            description,
            experience_year: experienceYear,
            specialty: specialty,
            avatar_url: avatarRaw,
            facebook_link: normalizedFacebook,
            verified: false,
          },
        },
      },
      include: { reader_info: true },
    })

    await createNotificationForAdmins({
      title: 'Yêu cầu đăng ký Reader mới',
      content: `Có yêu cầu đăng ký reader mới từ ${name} (${normalizedEmail}). `,
      type: 'SYSTEM',
      link: '/admin/readers',
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      message: 'Yêu cầu đăng ký Reader đã được gửi. Admin sẽ duyệt sau.',
      user: { id: user.id, email: user.email },
    }, { status: 201 })
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

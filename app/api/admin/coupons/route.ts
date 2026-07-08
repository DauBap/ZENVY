import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { created_at: 'desc' },
    })

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('List coupons error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    const discount_type = body.discount_type === 'PERCENTAGE' || body.discount_type === 'FIXED' ? body.discount_type : 'PERCENTAGE'
    const discount_value = Number(body.discount_value)
    const max_uses = body.max_uses !== undefined && body.max_uses !== null ? Number(body.max_uses) : null
    const start_date = body.start_date ? new Date(body.start_date) : null
    const end_date = body.end_date ? new Date(body.end_date) : null
    const active = body.active !== undefined ? Boolean(body.active) : true

    if (!code) {
      return NextResponse.json({ error: 'Mã giảm giá không được để trống' }, { status: 400 })
    }

    if (isNaN(discount_value) || discount_value <= 0) {
      return NextResponse.json({ error: 'Giá trị giảm giá phải lớn hơn 0' }, { status: 400 })
    }

    if (discount_type === 'PERCENTAGE' && discount_value > 100) {
      return NextResponse.json({ error: 'Giảm giá theo phần trăm không được quá 100%' }, { status: 400 })
    }

    // Check unique code
    const existing = await prisma.coupon.findUnique({
      where: { code },
    })
    if (existing) {
      return NextResponse.json({ error: 'Mã giảm giá đã tồn tại' }, { status: 409 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        discount_type,
        discount_value,
        max_uses,
        start_date,
        end_date,
        active,
      },
    })

    return NextResponse.json({ coupon })
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
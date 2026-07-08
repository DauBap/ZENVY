import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/coupons/validate — kiểm tra mã khuyến mãi trước khi đặt lịch
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : ''
    const originalPrice = Number(body?.originalPrice)

    if (!code) {
      return NextResponse.json({ error: 'Vui lòng nhập mã khuyến mãi.' }, { status: 400 })
    }

    if (!Number.isFinite(originalPrice) || originalPrice < 0) {
      return NextResponse.json({ error: 'Giá gốc không hợp lệ.' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({ where: { code } })

    if (!coupon) {
      return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại.' }, { status: 404 })
    }

    if (!coupon.active) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã bị vô hiệu hóa.' }, { status: 400 })
    }

    const now = new Date()
    if (coupon.start_date && coupon.start_date > now) {
      return NextResponse.json({ error: 'Mã khuyến mãi chưa đến ngày hiệu lực.' }, { status: 400 })
    }

    if (coupon.end_date && coupon.end_date < now) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn.' }, { status: 400 })
    }

    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết lượt sử dụng.' }, { status: 400 })
    }

    // Tính số tiền giảm
    let discountAmount = 0
    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = Math.floor(originalPrice * coupon.discount_value / 100)
    } else {
      discountAmount = Math.min(coupon.discount_value, originalPrice)
    }
    const finalPrice = Math.max(0, originalPrice - discountAmount)

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discountAmount,
      finalPrice,
    })
  } catch (e) {
    console.error('Validate coupon error:', e)
    return NextResponse.json({ error: 'Lỗi server.' }, { status: 500 })
  }
}

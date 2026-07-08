import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
    }

    const body = await request.json().catch(() => null)
    if (!body || !body.code || !body.packageId) {
      return NextResponse.json({ error: 'Thiếu thông tin kiểm tra mã.' }, { status: 400 })
    }

    const { code, packageId } = body
    const couponCode = String(code).trim().toUpperCase()

    // 1. Find the coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Mã giảm giá không tồn tại.' }, { status: 404 })
    }

    // 2. Check if active
    if (!coupon.active) {
      return NextResponse.json({ error: 'Mã giảm giá này đã ngừng kích hoạt.' }, { status: 400 })
    }

    // 3. Check dates
    const now = new Date()
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return NextResponse.json({ error: 'Mã giảm giá chưa đến thời gian áp dụng.' }, { status: 400 })
    }

    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return NextResponse.json({ error: 'Mã giảm giá đã hết hạn.' }, { status: 400 })
    }

    // 4. Check max uses
    if (coupon.max_uses !== null && coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ error: 'Mã giảm giá đã hết lượt sử dụng.' }, { status: 400 })
    }

    // 5. Get package price
    const pkg = await prisma.package.findUnique({
      where: { id: Number(packageId) },
      select: { price: true },
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Không tìm thấy gói dịch vụ.' }, { status: 404 })
    }

    // 6. Calculate discount
    let discountAmount = 0
    if (coupon.discount_type === 'PERCENTAGE') {
      discountAmount = Math.round((pkg.price * coupon.discount_value) / 100)
    } else {
      discountAmount = coupon.discount_value
    }

    // Discount cannot exceed price
    if (discountAmount > pkg.price) {
      discountAmount = pkg.price
    }

    const discountedPrice = pkg.price - discountAmount

    return NextResponse.json({
      valid: true,
      coupon_id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      original_price: pkg.price,
      discount_amount: discountAmount,
      discounted_price: discountedPrice,
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    return NextResponse.json({ error: 'Không thể kiểm tra mã giảm giá.' }, { status: 500 })
  }
}
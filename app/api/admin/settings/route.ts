import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/admin/settings — lấy cài đặt hệ thống
// Admin: xem toàn bộ | Reader/User: chỉ xem commission_rate
export async function GET() {
  const session = await getSession()
  if (!session)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const settings = await prisma.systemSetting.findMany()
  const map = Object.fromEntries(settings.map(s => [s.key, s.value]))
  return NextResponse.json({ commissionRate: Number(map['commission_rate'] ?? 10) })
}

// PATCH /api/admin/settings — cập nhật commission rate
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  const rate = Number(body?.commissionRate)
  if (!Number.isFinite(rate) || rate < 0 || rate > 100)
    return NextResponse.json({ error: 'commissionRate phải từ 0 đến 100.' }, { status: 400 })

  await prisma.systemSetting.upsert({
    where: { key: 'commission_rate' },
    update: { value: String(rate) },
    create: { key: 'commission_rate', value: String(rate), description: 'Phần trăm hoa hồng hệ thống (%)' },
  })

  return NextResponse.json({ success: true, commissionRate: rate })
}

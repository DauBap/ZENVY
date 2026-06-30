import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/reader/bank — lấy thông tin ngân hàng hiện tại
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true, bank_name: true, bank_account: true, bank_owner_name: true, balance: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  return NextResponse.json({
    bankName: reader.bank_name ?? '',
    bankAccount: reader.bank_account ?? '',
    bankOwnerName: reader.bank_owner_name ?? '',
    balance: Number(reader.balance),
  })
}

// PATCH /api/reader/bank — cập nhật thông tin ngân hàng
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })

  const bankName = typeof body.bankName === 'string' ? body.bankName.trim() : undefined
  const bankAccount = typeof body.bankAccount === 'string' ? body.bankAccount.trim() : undefined
  const bankOwnerName = typeof body.bankOwnerName === 'string' ? body.bankOwnerName.trim() : undefined

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  await prisma.readerInfo.update({
    where: { id: reader.id },
    data: {
      ...(bankName !== undefined && { bank_name: bankName }),
      ...(bankAccount !== undefined && { bank_account: bankAccount }),
      ...(bankOwnerName !== undefined && { bank_owner_name: bankOwnerName }),
    },
  })

  return NextResponse.json({ success: true })
}

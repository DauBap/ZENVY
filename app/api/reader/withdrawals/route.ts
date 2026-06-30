import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

// GET /api/reader/withdrawals — lịch sử rút tiền của reader
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true, balance: true, bank_name: true, bank_account: true, bank_owner_name: true },
  })
  if (!reader) return NextResponse.json({ withdrawals: [], balance: 0 })

  const withdrawals = await prisma.withdrawalRequest.findMany({
    where: { reader_id: reader.id },
    orderBy: { created_at: 'desc' },
    take: 50,
  })

  // Tổng đang pending (đã khóa)
  const pendingTotal = withdrawals
    .filter(w => w.status === 'PENDING')
    .reduce((s, w) => s + Number(w.amount_requested), 0)

  return NextResponse.json({
    balance: Number(reader.balance),
    availableBalance: Number(reader.balance) - pendingTotal,
    bankName: reader.bank_name ?? '',
    bankAccount: reader.bank_account ?? '',
    bankOwnerName: reader.bank_owner_name ?? '',
    withdrawals: withdrawals.map(w => ({
      id: w.id,
      amountRequested: Number(w.amount_requested),
      commissionRate: Number(w.commission_rate),
      amountToPay: Number(w.amount_to_pay),
      bankName: w.bank_name,
      bankAccount: w.bank_account,
      bankOwnerName: w.bank_owner_name,
      status: w.status,
      adminNote: w.admin_note ?? '',
      createdAt: w.created_at.toISOString(),
    })),
  })
}

// POST /api/reader/withdrawals — tạo yêu cầu rút tiền mới
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount < 10000) {
    return NextResponse.json({ error: 'Số tiền tối thiểu là 10,000₫.' }, { status: 400 })
  }

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true, balance: true, bank_name: true, bank_account: true, bank_owner_name: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  // Kiểm tra bank info
  if (!reader.bank_name || !reader.bank_account || !reader.bank_owner_name) {
    return NextResponse.json({ error: 'Vui lòng cập nhật thông tin ngân hàng trước.' }, { status: 422 })
  }

  // Lấy commission rate hiện tại
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'commission_rate' } })
  const commissionRate = setting ? Number(setting.value) : 10

  // Tính số tiền thực nhận
  const amountToPay = Math.floor(amount * (1 - commissionRate / 100))

  // Kiểm tra balance khả dụng (balance - tổng pending)
  const pendingSum = await prisma.withdrawalRequest.aggregate({
    where: { reader_id: reader.id, status: 'PENDING' },
    _sum: { amount_requested: true },
  })
  const locked = Number(pendingSum._sum.amount_requested ?? 0)
  const available = Number(reader.balance) - locked

  if (amount > available) {
    return NextResponse.json({
      error: `Số dư khả dụng không đủ. Khả dụng: ${available.toLocaleString('vi-VN')}₫`,
    }, { status: 422 })
  }

  const withdrawal = await prisma.withdrawalRequest.create({
    data: {
      reader_id: reader.id,
      amount_requested: new Prisma.Decimal(amount),
      commission_rate: new Prisma.Decimal(commissionRate),
      amount_to_pay: new Prisma.Decimal(amountToPay),
      bank_name: reader.bank_name,
      bank_account: reader.bank_account,
      bank_owner_name: reader.bank_owner_name,
      status: 'PENDING',
    },
  })

  return NextResponse.json({ success: true, id: withdrawal.id }, { status: 201 })
}

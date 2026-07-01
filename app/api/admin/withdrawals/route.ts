import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/admin/withdrawals — danh sách yêu cầu rút tiền
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const limit = 20

  const where: any = status ? { status } : {}

  const [items, total] = await Promise.all([
    prisma.withdrawalRequest.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        reader: { select: { display_name: true, avatar_url: true, bank_qr_code: true, user: { select: { email: true } } } },
      },
    }),
    prisma.withdrawalRequest.count({ where }),
  ])

  // Lấy commission rate hiện tại
  const setting = await prisma.systemSetting.findUnique({ where: { key: 'commission_rate' } })
  const commissionRate = setting ? Number(setting.value) : 10

  return NextResponse.json({
    withdrawals: items.map(w => ({
      id: w.id,
      readerId: w.reader_id,
      readerName: w.reader.display_name ?? '—',
      readerAvatar: w.reader.avatar_url ?? null,
      readerEmail: w.reader.user.email,
      amountRequested: Number(w.amount_requested),
      commissionRate: Number(w.commission_rate),
      amountToPay: Number(w.amount_to_pay),
      bankName: w.bank_name,
      bankAccount: w.bank_account,
      bankOwnerName: w.bank_owner_name,
      bankQrCode: w.reader.bank_qr_code ?? null,
      status: w.status,
      adminNote: w.admin_note ?? '',
      createdAt: w.created_at.toISOString(),
    })),
    total,
    totalPages: Math.ceil(total / limit),
    page,
    commissionRate,
  })
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const MAX_QR_LEN = 2_000_000 // ~1.5 MB base64

// GET /api/reader/bank
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true, bank_name: true, bank_account: true, bank_owner_name: true, bank_qr_code: true, balance: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  return NextResponse.json({
    bankName: reader.bank_name ?? '',
    bankAccount: reader.bank_account ?? '',
    bankOwnerName: reader.bank_owner_name ?? '',
    bankQrCode: reader.bank_qr_code ?? null,
    balance: Number(reader.balance),
  })
}

// PATCH /api/reader/bank — lưu thông tin ngân hàng + QR
export async function PATCH(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })

  const bankName      = typeof body.bankName      === 'string' ? body.bankName.trim()      : undefined
  const bankAccount   = typeof body.bankAccount   === 'string' ? body.bankAccount.trim()   : undefined
  const bankOwnerName = typeof body.bankOwnerName === 'string' ? body.bankOwnerName.trim() : undefined
  const bankQrCode    = body.bankQrCode === null ? null
                        : typeof body.bankQrCode === 'string' ? body.bankQrCode : undefined

  if (bankQrCode && typeof bankQrCode === 'string' && bankQrCode.length > MAX_QR_LEN)
    return NextResponse.json({ error: 'Ảnh QR quá lớn. Vui lòng chọn ảnh nhỏ hơn.' }, { status: 400 })

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  await prisma.readerInfo.update({
    where: { id: reader.id },
    data: {
      ...(bankName      !== undefined && { bank_name: bankName }),
      ...(bankAccount   !== undefined && { bank_account: bankAccount }),
      ...(bankOwnerName !== undefined && { bank_owner_name: bankOwnerName }),
      ...(bankQrCode    !== undefined && { bank_qr_code: bankQrCode }),
    },
  })

  return NextResponse.json({ success: true })
}

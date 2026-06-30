import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// PATCH /api/admin/withdrawals/[id] — approve hoặc reject
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const wId = Number(id)
  if (!Number.isInteger(wId) || wId <= 0)
    return NextResponse.json({ error: 'ID không hợp lệ.' }, { status: 400 })

  const body = await request.json().catch(() => null)
  const action = body?.action as string | undefined
  const adminNote = typeof body?.adminNote === 'string' ? body.adminNote.trim() : ''

  if (action !== 'approve' && action !== 'reject')
    return NextResponse.json({ error: 'action phải là approve hoặc reject.' }, { status: 400 })

  const withdrawal = await prisma.withdrawalRequest.findUnique({ where: { id: wId } })
  if (!withdrawal) return NextResponse.json({ error: 'Không tìm thấy yêu cầu.' }, { status: 404 })
  if (withdrawal.status !== 'PENDING')
    return NextResponse.json({ error: 'Yêu cầu đã được xử lý trước đó.' }, { status: 409 })

  if (action === 'approve') {
    // Trừ balance của reader trong transaction
    await prisma.$transaction(async (tx) => {
      await tx.withdrawalRequest.update({
        where: { id: wId },
        data: { status: 'APPROVED', admin_note: adminNote || null },
      })
      await tx.readerInfo.update({
        where: { id: withdrawal.reader_id },
        data: { balance: { decrement: Number(withdrawal.amount_requested) } },
      })
    })
    return NextResponse.json({ success: true, status: 'APPROVED' })
  }

  // reject — không trừ balance, chỉ đổi status
  await prisma.withdrawalRequest.update({
    where: { id: wId },
    data: { status: 'REJECTED', admin_note: adminNote || null },
  })
  return NextResponse.json({ success: true, status: 'REJECTED' })
}

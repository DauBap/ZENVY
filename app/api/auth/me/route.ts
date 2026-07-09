import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  // Lấy thêm avatar mới nhất từ DB
  const user = await prisma.user.findUnique({
    where: { id: Number(session.sub) },
    include: { role: true, customer_info: true, reader_info: true },
  })

  if (!user || user.status !== 'ACTIVE') {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const avatar =
    user.customer_info?.avatar_url ??
    user.reader_info?.avatar_url ??
    null

  const currentRole =
    user.role?.name === 'READER' || user.reader_info?.status === 'ACTIVE'
      ? 'READER'
      : user.role?.name ?? 'CUSTOMER'

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: session.name,
      role: currentRole,
      avatar,
      readerStatus: user.reader_info?.status ?? null,
    },
  })
}

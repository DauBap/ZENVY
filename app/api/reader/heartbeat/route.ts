import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/reader/heartbeat — reader ping mỗi 30s khi đang online
export async function POST() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'READER')
      return NextResponse.json({ ok: false }, { status: 401 })

    await prisma.readerInfo.updateMany({
      where: { user_id: Number(session.sub) },
      data: { last_seen_at: new Date() },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Heartbeat error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

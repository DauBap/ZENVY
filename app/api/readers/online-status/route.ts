import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isReaderOnline } from '@/lib/online'

// GET /api/readers/online-status — trả map { readerId: boolean }
// Dùng để client poll mỗi 30s, tránh reload toàn trang
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const readers = await prisma.readerInfo.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, last_seen_at: true },
    })

    const result: Record<number, boolean> = {}
    for (const r of readers) {
      result[r.id] = isReaderOnline(r.last_seen_at)
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    console.error('Online status error:', e)
    return NextResponse.json({}, { status: 500 })
  }
}

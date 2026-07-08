import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const userId = Number(id)
    if (!Number.isInteger(userId)) return NextResponse.json({ voiceSample: null })
    const reader = await prisma.readerInfo.findUnique({ where: { user_id: userId } })
    return NextResponse.json({ voiceSample: reader?.voice_sample ?? null })
  } catch (e) {
    console.error('GET /api/users/[id]/voice error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

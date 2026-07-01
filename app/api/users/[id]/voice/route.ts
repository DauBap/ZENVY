import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const reader = await prisma.readerInfo.findUnique({ where: { user_id: id } })
    return NextResponse.json({ voiceSample: reader?.voice_sample ?? null })
  } catch (e) {
    console.error('GET /api/users/[id]/voice error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

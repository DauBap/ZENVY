import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json().catch(() => null)
    if (!body || typeof body.voice !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 })
    }

    const voice = body.voice
    if (!voice) return NextResponse.json({ error: 'Missing voice payload' }, { status: 400 })

    if (voice.length > 2_000_000) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }

    const userId = Number(session.sub)

    const updated = await prisma.readerInfo.upsert({
      where: { user_id: userId },
      update: { voice_sample: voice },
      create: { user_id: userId, voice_sample: voice },
    })

    return NextResponse.json({ ok: true, voiceSample: updated.voice_sample })
  } catch (e) {
    console.error('PATCH /api/reader/voice error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession()
    if (!session || !session.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const userId = Number(session.sub)
    await prisma.readerInfo.update({
      where: { user_id: userId },
      data: { voice_sample: null },
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('DELETE /api/reader/voice error', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

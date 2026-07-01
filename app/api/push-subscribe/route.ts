import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body?.endpoint || !body?.keys?.auth || !body?.keys?.p256dh)
    return NextResponse.json({ error: 'Invalid subscription object' }, { status: 400 })

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    update: { p256dh: body.keys.p256dh, auth: body.keys.auth, user_id: Number(session.sub) },
    create: {
      user_id: Number(session.sub),
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (body?.endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: body.endpoint, user_id: Number(session.sub) },
    })
  }
  return NextResponse.json({ success: true })
}

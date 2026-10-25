import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const readerId = Number(id)

  if (!Number.isInteger(readerId) || readerId <= 0) {
    return new NextResponse('Invalid reader ID', { status: 400 })
  }

  try {
    const reader = await prisma.readerInfo.findUnique({
      where: { id: readerId },
      select: { avatar_url: true, status: true, verified: true },
    })

    if (!reader || (reader.status !== 'ACTIVE' && !reader.verified) || !reader.avatar_url) {
      return new NextResponse('Avatar not found', { status: 404 })
    }

    const match = reader.avatar_url.match(
      /^data:(image\/(?:avif|gif|jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i
    )
    if (!match) {
      return new NextResponse('Avatar format not supported', { status: 404 })
    }

    const image = Buffer.from(match[2], 'base64')
    if (image.length === 0) {
      return new NextResponse('Avatar is empty', { status: 404 })
    }

    return new NextResponse(image, {
      headers: {
        'Content-Type': match[1].toLowerCase(),
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Reader avatar request failed:', error)
    return new NextResponse('Unable to load avatar', { status: 500 })
  }
}

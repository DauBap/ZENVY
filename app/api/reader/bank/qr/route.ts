import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const MAX_DATA_URL_LENGTH = 5_000_000

function bufferToBase64(buffer: ArrayBuffer) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64')
  }

  const bytes = new Uint8Array(buffer)
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  if (typeof globalThis.btoa !== 'undefined') {
    return globalThis.btoa(binary)
  }
  throw new Error('No base64 encoder available')
}

async function resolveQrData(request: NextRequest) {
  const contentType = request.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = await request.json().catch(() => null)
    if (body && typeof body.qrDataUrl === 'string' && body.qrDataUrl.startsWith('data:')) {
      return body.qrDataUrl
    }
  }

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData().catch(() => null)
    if (!formData) return null

    const qr = formData.get('qr')
    if (typeof qr === 'string' && qr.startsWith('data:')) {
      return qr
    }
    if (qr instanceof Blob) {
      const buffer = await qr.arrayBuffer()
      const base64 = bufferToBase64(buffer)
      const mime = qr.type || 'application/octet-stream'
      return `data:${mime};base64,${base64}`
    }
  }

  return null
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const dataUrl = await resolveQrData(request)
  if (!dataUrl) {
    return NextResponse.json({ error: 'Không tìm thấy file QR hoặc dữ liệu QR không hợp lệ.' }, { status: 400 })
  }

  if (dataUrl.length > MAX_DATA_URL_LENGTH) {
    return NextResponse.json({ error: 'File QR quá lớn.' }, { status: 413 })
  }

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  await prisma.readerInfo.update({
    where: { id: reader.id },
    data: { bank_qr_code: dataUrl },
  })

  return NextResponse.json({ success: true, bankQrCode: dataUrl })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 })
  if (session.role !== 'READER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const reader = await prisma.readerInfo.findUnique({
    where: { user_id: Number(session.sub) },
    select: { id: true },
  })
  if (!reader) return NextResponse.json({ error: 'Không tìm thấy reader.' }, { status: 404 })

  await prisma.readerInfo.update({
    where: { id: reader.id },
    data: { bank_qr_code: null },
  })

  return NextResponse.json({ success: true })
}

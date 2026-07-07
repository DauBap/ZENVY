import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSession } from '@/lib/auth'

const FILE = path.join(process.cwd(), 'data', 'specialties.json')

async function readList() {
  const raw = await fs.readFile(FILE, 'utf-8')
  return JSON.parse(raw) as string[]
}

async function writeList(list: string[]) {
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf-8')
}

export async function GET() {
  try {
    const list = await readList()
    return NextResponse.json({ specialties: list })
  } catch (e) {
    console.error('Read specialties error', e)
    return NextResponse.json({ specialties: [] })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'Invalid name' }, { status: 400 })

  const list = await readList()
  if (list.includes(name)) return NextResponse.json({ error: 'Already exists' }, { status: 409 })
  list.push(name)
  await writeList(list)
  return NextResponse.json({ specialties: list })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { oldName, newName } = body || {}
  if (typeof oldName !== 'string' || typeof newName !== 'string')
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const list = await readList()
  const idx = list.findIndex((s) => s === oldName)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (list.includes(newName) && newName !== oldName) return NextResponse.json({ error: 'Duplicate' }, { status: 409 })
  list[idx] = newName
  await writeList(list)
  return NextResponse.json({ specialties: list })
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name : null
  if (!name) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const list = await readList()
  const filtered = list.filter((s) => s !== name)
  if (filtered.length === list.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await writeList(filtered)
  return NextResponse.json({ specialties: filtered })
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  const users = await prisma.user.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(users)
}

export async function POST(req) {
  try {
    const data = await req.json()
    const { name, email } = data
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 })
    }
    const user = await prisma.user.create({ data: { name, email } })
    return NextResponse.json(user, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

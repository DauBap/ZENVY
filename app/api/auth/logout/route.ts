import { NextResponse } from 'next/server'
import { cookieOptions } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(cookieOptions.name, '', {
    ...cookieOptions,
    maxAge: 0,
  })
  return response
}

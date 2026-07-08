import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('sageto_token')?.value

  const session = await getSession()

  return NextResponse.json({
    hasCookie: !!token,
    cookiePreview: token ? token.substring(0, 40) + '...' : null,
    session,
  })
}

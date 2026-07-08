import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { ChatClient } from '@/components/chat/chat-page'

export const dynamic = 'force-dynamic'

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ reader?: string; customer?: string; booking?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/readers?login=1')

  const sp = await searchParams
  const initialReaderId = sp.reader ? Number(sp.reader) : null
  const initialCustomerId = sp.customer ? Number(sp.customer) : null
  const initialBookingId = sp.booking ? Number(sp.booking) : null

  let currentRole = session.role
  let currentReaderStatus: string | null = null

  if (session.role === 'READER') {
    const readerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { status: true },
    })
    currentReaderStatus = readerInfo?.status ?? null
  } else {
    const readerInfo = await prisma.readerInfo.findUnique({
      where: { user_id: Number(session.sub) },
      select: { status: true },
    })
    if (readerInfo?.status === 'ACTIVE') {
      currentRole = 'READER'
      currentReaderStatus = 'ACTIVE'
    }
  }

  return (
    <ChatClient
      currentUserId={Number(session.sub)}
      currentRole={currentRole}
      currentReaderStatus={currentReaderStatus}
      initialReaderId={Number.isInteger(initialReaderId) ? initialReaderId : null}
      initialCustomerId={Number.isInteger(initialCustomerId) ? initialCustomerId : null}
      initialBookingId={Number.isInteger(initialBookingId) ? initialBookingId : null}
    />
  )
}

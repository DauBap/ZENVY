import { redirect } from 'next/navigation'
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

  return (
    <ChatClient
      currentUserId={Number(session.sub)}
      currentRole={session.role}
      initialReaderId={Number.isInteger(initialReaderId) ? initialReaderId : null}
      initialCustomerId={Number.isInteger(initialCustomerId) ? initialCustomerId : null}
      initialBookingId={Number.isInteger(initialBookingId) ? initialBookingId : null}
    />
  )
}

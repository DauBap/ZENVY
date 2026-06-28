import { getReaders } from '@/lib/actions'
import { ChatClient } from '@/components/chat/chat-page'

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function ChatPage() {
  const readers = await getReaders({ limit: 4 })
  return <ChatClient readers={readers} />
}

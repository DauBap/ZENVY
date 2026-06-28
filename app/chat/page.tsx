import { getReaders } from '@/lib/actions'
import { ChatClient } from '@/components/chat/chat-page'

export default async function ChatPage() {
  const readers = await getReaders({ limit: 4 })
  return <ChatClient readers={readers} />
}

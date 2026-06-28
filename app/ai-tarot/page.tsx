import { getTarotCards } from '@/lib/actions'
import { AITarotPage } from '@/components/ai-tarot/ai-tarot-page'

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function AITarotRoutePage() {
  const tarotCards = await getTarotCards()
  return <AITarotPage tarotCards={tarotCards} />
}

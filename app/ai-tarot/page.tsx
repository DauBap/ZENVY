import { getTarotCards } from '@/lib/actions'
import { AITarotPage } from '@/components/ai-tarot/ai-tarot-page'

export default async function AITarotRoutePage() {
  const tarotCards = await getTarotCards()
  return <AITarotPage tarotCards={tarotCards} />
}

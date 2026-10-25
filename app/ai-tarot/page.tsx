import { getTarotCards } from '@/lib/actions'
import { AITarotPage } from '@/components/ai-tarot/ai-tarot-page'

export const metadata = {
  title: 'Xem Tarot Online Miễn Phí Với AI Tarot',
  description: 'Trải bài tarot online miễn phí với AI. Đặt câu hỏi về tình yêu, công việc hoặc cuộc sống và khám phá thông điệp từ những lá bài Tarot.',
  alternates: {
    canonical: '/ai-tarot',
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/ai-tarot',
    title: 'Xem Tarot Online Miễn Phí Với AI Tarot | SAGETO',
    description: 'Trải bài tarot online miễn phí với AI và khám phá thông điệp từ những lá bài Tarot.',
    siteName: 'SAGETO',
  },
}

// Render on-demand so the build never depends on DB state
export const dynamic = 'force-dynamic'

export default async function AITarotRoutePage() {
  const tarotCards = await getTarotCards()
  return <AITarotPage tarotCards={tarotCards} />
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Shuffle, RotateCcw, ArrowRight, Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { SerializedTarotCard } from '@/lib/serializers'

const spreads = [
  { id: 'single', name: 'Một lá', count: 1, description: 'Câu trả lời nhanh' },
  { id: 'three', name: 'Ba lá', count: 3, description: 'Quá khứ - Hiện tại - Tương lai' },
  { id: 'celtic', name: 'Celtic Cross', count: 10, description: 'Phân tích sâu' },
]

export function AITarotPage({ tarotCards }: { tarotCards: SerializedTarotCard[] }) {
  const [question, setQuestion] = useState('')
  const [selectedSpread, setSelectedSpread] = useState('three')
  const [isReading, setIsReading] = useState(false)
  const [drawnCards, setDrawnCards] = useState<SerializedTarotCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [interpretation, setInterpretation] = useState('')
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [aiError, setAiError] = useState('')

  const spread = spreads.find(s => s.id === selectedSpread)!

  const handleShuffle = () => {
    setIsReading(true)
    setShowResult(false)
    setFlippedCards([])
    
    // Shuffle and draw cards
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5)
    const drawn = shuffled.slice(0, spread.count)
    
    setTimeout(() => {
      setDrawnCards(drawn)
    }, 500)
  }

  const handleFlipCard = (index: number) => {
    if (!flippedCards.includes(index)) {
      const newFlipped = [...flippedCards, index]
      setFlippedCards(newFlipped)

      if (newFlipped.length === drawnCards.length) {
        setTimeout(() => {
          setShowResult(true)
          fetchInterpretation(drawnCards)
        }, 500)
      }
    }
  }

  const fetchInterpretation = async (cards: SerializedTarotCard[]) => {
    setIsLoadingAI(true)
    setAiError('')
    setInterpretation('')
    try {
      const res = await fetch('/api/ai-tarot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          spread: selectedSpread,
          cards: cards.map(c => ({ name: c.name, meaning: c.meaning })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAiError(data.error ?? 'Lỗi AI. Vui lòng thử lại.')
      } else {
        setInterpretation(data.interpretation)
      }
    } catch {
      setAiError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleReset = () => {
    setIsReading(false)
    setDrawnCards([])
    setFlippedCards([])
    setShowResult(false)
    setQuestion('')
    setInterpretation('')
    setAiError('')
  }

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#768064]/10 border border-[#768064]/20 mb-4">
              <Sparkles className="w-4 h-4 text-[#768064]" />
              <span className="text-sm text-[#4C583E]">AI Tarot - Miễn phí</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Khám phá <span className="gradient-text">thông điệp</span> từ vũ trụ
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Đặt câu hỏi, chọn trải bài và nhận insight từ AI. Trải nghiệm hoàn toàn miễn phí!
            </p>
          </motion.div>

          {!isReading ? (
            /* Input Section */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-6 lg:p-8">
                {/* Question Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Câu hỏi của bạn
                  </label>
                  <Textarea
                    placeholder="Ví dụ: Mối quan hệ hiện tại của tôi sẽ đi về đâu?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[100px] bg-white/5 border-white/10 focus:border-[#768064]/50 resize-none"
                  />
                </div>

                {/* Spread Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Chọn kiểu trải bài
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {spreads.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSpread(s.id)}
                        className={cn(
                          'p-4 rounded-xl text-center transition-all border',
                          selectedSpread === s.id
                            ? 'bg-[#768064]/20 border-[#768064]/50'
                            : 'bg-white/5 border-white/10 hover:border-[#768064]/30'
                        )}
                      >
                        <div className="text-2xl mb-1">
                          {'🃏'.repeat(Math.min(s.count, 3))}
                        </div>
                        <div className="font-medium text-foreground text-sm">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={handleShuffle}
                  disabled={!question.trim()}
                  className={cn(
                    'w-full h-14 text-lg',
                    'bg-gradient-to-r from-[#4C583E] to-[#2C3424]',
                    'hover:from-[#768064] hover:to-[#4C583E]',
                    'text-white shadow-xl shadow-[#768064]/20'
                  )}
                >
                  <Shuffle className="w-5 h-5 mr-2" />
                  Bắt đầu trải bài
                </Button>
              </GlassCard>
            </motion.div>
          ) : (
            /* Reading Section */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Question Display */}
              <GlassCard className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Câu hỏi của bạn:</div>
                <div className="text-foreground italic">&ldquo;{question}&rdquo;</div>
              </GlassCard>

              {/* Cards */}
              <div className="flex flex-wrap justify-center gap-4 py-8">
                <AnimatePresence mode="popLayout">
                  {drawnCards.map((card, index) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, scale: 0, rotateY: 180 }}
                      animate={{ opacity: 1, scale: 1, rotateY: flippedCards.includes(index) ? 0 : 180 }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="relative cursor-pointer perspective-1000"
                      onClick={() => handleFlipCard(index)}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className={cn(
                        'w-28 h-44 sm:w-36 sm:h-56 rounded-xl transition-all duration-500',
                        'shadow-2xl',
                        flippedCards.includes(index) ? 'shadow-amber-500/20' : 'shadow-[#768064]/20'
                      )}>
                        {/* Card Back */}
                        <div className={cn(
                          'absolute inset-0 rounded-xl bg-gradient-to-br from-[#4C583E] via-[#4C583E] to-[#2C3424]',
                          'flex flex-col items-center justify-center p-4',
                          'backface-hidden',
                          flippedCards.includes(index) && 'hidden'
                        )}>
                          <div className="text-3xl mb-2">☽</div>
                          <div className="text-xs text-white/60 text-center">Chạm để lật</div>
                          <div className="absolute inset-0 border-2 border-white/10 rounded-xl" />
                          <div className="absolute inset-3 border border-white/10 rounded-lg" />
                        </div>

                        {/* Card Front */}
                        <div className={cn(
                          'absolute inset-0 rounded-xl',
                          'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20',
                          'border border-amber-500/30',
                          'flex flex-col items-center justify-center p-3',
                          'backface-hidden',
                          !flippedCards.includes(index) && 'hidden'
                        )}>
                          <div className="text-4xl mb-2">✧</div>
                          <div className="text-sm font-semibold text-foreground text-center leading-tight">
                            {card.name}
                          </div>
                          <div className="text-[10px] text-amber-300 text-center mt-1 line-clamp-2">
                            {card.meaning}
                          </div>
                        </div>
                      </div>

                      {/* Position Label */}
                      {selectedSpread === 'three' && (
                        <div className="text-center text-xs text-muted-foreground mt-2">
                          {index === 0 ? 'Quá khứ' : index === 1 ? 'Hiện tại' : 'Tương lai'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Instructions */}
              {!showResult && drawnCards.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground"
                >
                  Chạm vào từng lá bài để lật ({flippedCards.length}/{drawnCards.length})
                </motion.p>
              )}

              {/* Result */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <GlassCard className="p-6">
                      <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#768064]" />
                        Diễn giải AI
                      </h3>

                      {/* Cards drawn summary */}
                      <div className="space-y-2 mb-5">
                        {drawnCards.map((card, index) => (
                          <div key={card.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                            {selectedSpread === 'three' && (
                              <span className="text-[#768064] font-medium shrink-0">
                                {index === 0 ? 'Quá khứ' : index === 1 ? 'Hiện tại' : 'Tương lai'}:
                              </span>
                            )}
                            <span className="text-foreground font-medium">{card.name}</span>
                          </div>
                        ))}
                      </div>

                      {/* AI interpretation */}
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[120px]">
                        {isLoadingAI ? (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin text-[#768064]" />
                            <span className="text-sm">AI đang diễn giải trải bài của bạn…</span>
                          </div>
                        ) : aiError ? (
                          <div className="space-y-3">
                            <p className="text-sm text-red-400">{aiError}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-white/10"
                              onClick={() => fetchInterpretation(drawnCards)}
                            >
                              Thử lại
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {interpretation}
                          </p>
                        )}
                      </div>

                      <p className="text-xs italic text-muted-foreground/60 border-l-2 border-[#768064]/30 pl-3 mt-4">
                        Để có insight sâu sắc và cá nhân hóa hơn, hãy đặt lịch với các Tarot Reader chuyên nghiệp.
                      </p>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="flex-1 border-white/10"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Trải bài mới
                        </Button>
                        <Link href="/readers" className="flex-1">
                          <Button
                            className={cn(
                              'w-full bg-gradient-to-r from-[#4C583E] to-[#2C3424]',
                              'hover:from-[#768064] hover:to-[#4C583E]',
                              'text-white'
                            )}
                          >
                            Đặt lịch với Reader thật
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>

      <MobileNav />
    </>
  )
}

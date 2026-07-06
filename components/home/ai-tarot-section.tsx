'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, ArrowRight, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

const sampleCards = [
  { name: 'The Star', meaning: 'Hy vọng & Cảm hứng' },
  { name: 'The Moon', meaning: 'Trực giác & Tiềm thức' },
  { name: 'The Sun', meaning: 'Thành công & Hạnh phúc' },
]

export function AITarotSection() {
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedCard, setSelectedCard] = useState(0)

  const handleShuffle = () => {
    setIsFlipped(false)
    setTimeout(() => {
      setSelectedCard(Math.floor(Math.random() * sampleCards.length))
      setIsFlipped(true)
    }, 300)
  }

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#2C3424]/20 via-[#4C583E]/10 to-[#2C3424]/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#768064]/10 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#768064]/10 border border-[#768064]/20 mb-6">
              <Sparkles className="w-4 h-4 text-[#768064]" />
              <span className="text-sm text-[#4C583E]">Miễn phí</span>
            </div>

            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Trải nghiệm <span className="gradient-text">AI Tarot</span>
              <br />
              ngay bây giờ
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Công nghệ AI tiên tiến giúp bạn trải bài Tarot tức thì. 
              Nhập câu hỏi, nhận diễn giải chi tiết và insight sâu sắc - hoàn toàn miễn phí!
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-foreground">Trải bài tức thì, không cần chờ đợi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-foreground">Diễn giải chi tiết từ AI</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <span className="text-green-400 text-sm">✓</span>
                </div>
                <span className="text-foreground">Không giới hạn số lần trải bài</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/ai-tarot">
                <Button
                  size="lg"
                  className={cn(
                    'h-14 px-8',
                    'bg-gradient-to-r from-[#4C583E] to-[#2C3424]',
                    'hover:from-[#768064] hover:to-[#4C583E]',
                    'text-white shadow-xl shadow-[#768064]/20',
                    'group'
                  )}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Thử AI Tarot ngay
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Interactive Card Demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <GlassCard className="p-8 w-full max-w-md">
              {/* Card display */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="relative w-40 h-64 cursor-pointer"
                  onClick={() => setIsFlipped(!isFlipped)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      <motion.div
                        key="back"
                        initial={{ rotateY: 180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: -180 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#4C583E] via-[#4C583E] to-[#2C3424] flex items-center justify-center shadow-2xl shadow-[#768064]/20"
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">☽</div>
                          <div className="text-xs text-white/60">Chạm để lật</div>
                        </div>
                        <div className="absolute inset-0 border-2 border-white/10 rounded-xl" />
                        <div className="absolute inset-4 border border-white/10 rounded-lg" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="front"
                        initial={{ rotateY: -180 }}
                        animate={{ rotateY: 0 }}
                        exit={{ rotateY: 180 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 flex flex-col items-center justify-center p-4 shadow-2xl shadow-amber-500/20 border border-amber-500/30"
                      >
                        <div className="text-5xl mb-3">✧</div>
                        <div className="text-lg font-semibold text-foreground text-center">
                          {sampleCards[selectedCard].name}
                        </div>
                        <div className="text-xs text-amber-300 text-center mt-1">
                          {sampleCards[selectedCard].meaning}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Controls */}
              <Button
                variant="outline"
                className="w-full border-[#768064]/30 hover:bg-[#768064]/10"
                onClick={handleShuffle}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Xáo bài
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Đây là bản demo. Trải nghiệm đầy đủ tại AI Tarot!
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

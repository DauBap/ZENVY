'use client'

import { MotionConfig, motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Circle, Moon, Shield, Sparkles, Star, Sun, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { cn } from '@/lib/utils'
import type { SerializedReaderListing, SerializedPlatformStat } from '@/lib/serializers'

interface HeroSectionProps {
  readers: SerializedReaderListing[]
  platformStats: SerializedPlatformStat
}

export function HeroSection({ readers, platformStats }: HeroSectionProps) {
  const onlineReaders = readers.filter((reader) => reader.isOnline).slice(0, 4)
  const reveal = { opacity: 0, y: 18 }

  return (
    <MotionConfig reducedMotion="user">
    <section className="relative isolate overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -right-32 -top-36 h-[30rem] w-[30rem] rounded-full bg-[#d9dfc9]/70 blur-3xl" />
        <div className="absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#eee2ca]/80 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="mx-auto grid min-h-[min(760px,calc(100svh-5rem))] max-w-7xl items-center gap-12 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:pb-24">
        <div className="relative z-10 mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
          <motion.div
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#768064]/25 bg-white/70 px-4 py-2 shadow-sm shadow-[#2C3424]/5"
          >
            <span className="text-sm font-medium text-[#4C583E]">
              {platformStats.onlineReaders} Reader đang trực tuyến
            </span>
            <OnlineIndicator isOnline size="sm" />
          </motion.div>

          <motion.h1
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-balance font-serif text-[clamp(2.6rem,6vw,5rem)] font-medium leading-[1.08] tracking-[-0.045em] text-foreground"
          >
            Xem Tarot Online.
            <br />
            <span className="gradient-text italic">Tìm thấy rõ ràng.</span>
          </motion.h1>

          <motion.p
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 lg:mx-0"
          >
            Dành một khoảng lặng cho điều bạn đang băn khoăn. Kết nối với Tarot Reader
            được xác minh hoặc khám phá trải bài AI miễn phí.
          </motion.p>

          <motion.div
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
          >
            <Link href="/readers" className="w-full sm:w-auto">
              <Button
                size="lg"
                className={cn(
                  'h-12 w-full rounded-full px-7 text-base sm:h-14 sm:w-auto',
                  'bg-[#2C3424] text-white shadow-lg shadow-[#2C3424]/15',
                  'transition-colors hover:bg-[#4C583E] group'
                )}
              >
                Tìm Reader phù hợp
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/ai-tarot" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-full border-[#768064]/35 bg-white/60 px-7 text-base hover:bg-white sm:h-14 sm:w-auto"
              >
                <Sparkles className="mr-2 h-4 w-4 text-[#768064]" />
                Trải bài miễn phí
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={reveal}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-muted-foreground lg:justify-start"
          >
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#4C583E]" aria-hidden="true" />
              Reader được xác minh
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#959581] sm:block" />
            <span className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 fill-[#a47731] text-[#a47731]" aria-hidden="true" />
              {platformStats.averageRating} điểm đánh giá
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-[#959581] sm:block" />
            <span className="inline-flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#4C583E]" aria-hidden="true" />
              Phản hồi {platformStats.avgResponseTime}
            </span>
          </motion.div>

          {onlineReaders.length > 0 && (
            <motion.div
              initial={reveal}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
              className="mt-8 flex items-center justify-center gap-3 lg:justify-start"
            >
              <div className="flex -space-x-3">
                {onlineReaders.map((reader) => (
                  <div
                    key={reader.id}
                    className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-background"
                  >
                    <Image
                      src={reader.avatar}
                      alt={reader.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0">
                      <OnlineIndicator isOnline size="sm" />
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-left text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{platformStats.onlineReaders} Reader</span>
                <br className="sm:hidden" /> sẵn sàng lắng nghe bạn
              </p>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12 }}
          className="relative mx-auto flex w-full max-w-[34rem] items-center justify-center py-4 lg:py-8"
          aria-hidden="true"
        >
          <div className="absolute h-[min(78vw,29rem)] w-[min(78vw,29rem)] rounded-full border border-[#768064]/15 bg-[radial-gradient(circle,_rgba(255,255,255,0.9)_0%,_rgba(217,223,201,0.42)_55%,_rgba(247,243,232,0)_72%)]" />
          <div className="absolute h-[min(64vw,24rem)] w-[min(64vw,24rem)] rounded-full border border-dashed border-[#768064]/25" />

          <div className="relative h-[24rem] w-[17rem] -rotate-[9deg] rounded-[1.6rem] border border-[#e5dcc7] bg-[#d9dfc9] p-2 shadow-[0_28px_80px_-24px_rgba(44,52,36,0.35)] sm:h-[27rem] sm:w-[19rem]">
            <div className="relative flex h-full flex-col items-center justify-between overflow-hidden rounded-[1.2rem] border border-white/70 bg-[radial-gradient(ellipse_at_50%_40%,#a8b48b_0%,#667452_45%,#39442f_100%)] px-5 py-6 text-[#f9f4e6]">
              <div className="absolute inset-3 rounded-[0.9rem] border border-[#e6d4a2]/50" />
              <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e6d4a2]/30" />
              <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#e6d4a2]/25" />
              <div className="relative flex w-full items-center justify-between text-[#ead9ad]">
                <Moon className="h-5 w-5" strokeWidth={1.2} />
                <span className="text-[0.6rem] uppercase tracking-[0.3em]">S A G E T O</span>
                <Sun className="h-5 w-5" strokeWidth={1.2} />
              </div>
              <div className="relative flex flex-col items-center">
                <Circle className="absolute h-52 w-52 text-[#ead9ad]/25" strokeWidth={0.6} />
                <Sun className="h-20 w-20 text-[#ead9ad]" strokeWidth={0.8} />
                <Sparkles className="absolute -right-10 top-2 h-7 w-7 text-[#ead9ad]/90" strokeWidth={1} />
                <Sparkles className="absolute -left-9 bottom-0 h-5 w-5 text-[#ead9ad]/70" strokeWidth={1} />
              </div>
              <div className="relative text-center">
                <p className="font-serif text-2xl italic tracking-wide">The Inner Light</p>
                <p className="mt-2 text-[0.6rem] uppercase tracking-[0.32em] text-[#ead9ad]/80">
                  Clarity begins within
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-5 left-0 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-lg shadow-[#2C3424]/10 backdrop-blur sm:bottom-8 sm:left-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8ecdd] text-[#4C583E]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Một góc nhìn mới</p>
                <p className="text-xs text-muted-foreground">Bắt đầu từ chính bạn</p>
              </div>
            </div>
          </div>
          <div className="absolute right-0 top-8 rounded-2xl border border-white/80 bg-white/85 px-4 py-3 shadow-lg shadow-[#2C3424]/10 backdrop-blur sm:right-1 sm:top-12">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="text-sm font-medium text-[#4C583E]">Không gian an toàn</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
    </MotionConfig>
  )
}

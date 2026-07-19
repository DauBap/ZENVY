'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Shield, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FloatingElements } from '@/components/ui/floating-elements'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { cn } from '@/lib/utils'
import type { SerializedReader, SerializedPlatformStat } from '@/lib/serializers'

interface HeroSectionProps {
  readers: SerializedReader[]
  platformStats: SerializedPlatformStat
}

export function HeroSection({ readers, platformStats }: HeroSectionProps) {
  const onlineReaders = readers.filter((r) => r.isOnline).slice(0, 4)

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-16 lg:pt-20">
      <FloatingElements />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#768064]/10 border border-[#768064]/20 mb-4 sm:mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#768064]" />
            <span className="text-xs sm:text-sm text-[#4C583E]">
              {platformStats.onlineReaders} Readers đang online
            </span>
            <OnlineIndicator isOnline={true} size="sm" />
          </motion.div>

          {/* Headline — giảm kích thước trên màn 13" */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-balance"
          >
            <span className="text-foreground">Bạn đang cần</span>
            <br />
            <span className="gradient-text">sự rõ ràng</span>
            <span className="text-foreground"> trong</span>
            <br />
            <span className="text-foreground">tình cảm, công việc hay cuộc sống?</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty px-2"
          >
            Kết nối với {platformStats.verifiedReaders}+ Tarot Reader được xác minh. 
            Đặt lịch chỉ trong 60 giây. Trải nghiệm AI Tarot miễn phí ngay hôm nay.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8"
          >
            <Link href="/readers" className="w-full sm:w-auto">
              <Button
                size="lg"
                className={cn(
                  'w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg',
                  'bg-gradient-to-r from-[#4C583E] to-[#2C3424]',
                  'hover:from-[#768064] hover:to-[#4C583E]',
                  'text-white shadow-xl shadow-[#768064]/20',
                  'group'
                )}
              >
                Tìm Reader ngay
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/ai-tarot" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg border-[#768064]/30 hover:bg-[#768064]/10"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#768064]" />
                Thử AI Tarot miễn phí
              </Button>
            </Link>
          </motion.div>

          {/* Online Readers Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 sm:mt-10 flex items-center justify-center gap-3 sm:gap-4"
          >
            {onlineReaders.length > 0 && (
              <div className="flex -space-x-3">
                {onlineReaders.map((reader, i) => (
                  <motion.div
                    key={reader.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="relative"
                  >
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full ring-2 ring-background overflow-hidden">
                      <Image
                        src={reader.avatar}
                        alt={reader.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={true} size="sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{platformStats.onlineReaders} Readers</span>
              {' '}đang sẵn sàng tư vấn
            </p>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-10"
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
              <span>Bảo mật 100%</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span>{platformStats.averageRating} Rating trung bình</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#768064]" />
              <span>Phản hồi {platformStats.avgResponseTime}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2C3424] via-[#2C3424] to-[#2C3424]" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#2C3424] to-transparent" />
    </section>
  )
}

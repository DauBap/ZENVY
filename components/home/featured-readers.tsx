'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReaderCard } from '@/components/reader-card'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

interface FeaturedReadersProps {
  readers: SerializedReader[]
}

export function FeaturedReaders({ readers }: FeaturedReadersProps) {
  const featuredReaders = readers.filter((r) => r.isOnline).slice(0, 3)

  return (
    <section className="py-16 lg:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Readers <span className="gradient-text">Nổi bật</span>
            </h2>
            <p className="text-muted-foreground">
              Các reader được yêu thích nhất với rating cao và phản hồi nhanh
            </p>
          </div>
          <Link href="/readers">
            <Button
              variant="outline"
              className="border-[#768064]/30 hover:bg-[#768064]/10 group"
            >
              Xem tất cả
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        {/* Online Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm text-green-400">
              {featuredReaders.length} readers đang online và sẵn sàng
            </span>
          </div>
        </motion.div>

        {/* Readers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredReaders.map((reader, index) => (
            <ReaderCard key={reader.id} reader={reader} index={index} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link href="/readers">
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
              Khám phá tất cả Readers
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

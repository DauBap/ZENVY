'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Heart } from 'lucide-react'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import type { SerializedReader } from '@/lib/serializers'
import { cn } from '@/lib/utils'

interface ReaderCardProps {
  reader: SerializedReader
  index?: number
}

export function ReaderCard({ reader, index = 0 }: ReaderCardProps) {
  const minPrice = reader.packages && reader.packages.length > 0
    ? Math.min(...reader.packages.map((p) => p.price))
    : reader.pricePerSession

  const priceDisplay = minPrice >= 1000
    ? `${(minPrice / 1000).toFixed(0)}K`
    : `${minPrice}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/readers/${reader.id}`}>
        <div className={cn(
          'relative rounded-[18px] overflow-hidden cursor-pointer',
          'transition-all duration-300',
          'bg-card border border-white/10 shadow-sm hover:shadow-lg hover:border-white/20'
        )}>

          {/* ── Ảnh background ── */}
          <div className="relative w-full aspect-[3/4]">
            {/* bg layer — khớp chính xác element mẫu */}
            <div
              className="absolute z-0 rounded-t-[12px] md:rounded-b-[18px] md:inset-0.5"
              style={{
                inset: 0,
                backgroundImage: `url("${reader.avatar}")`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />

            {/* Gradient fade bottom */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

            {/* Online dot — chỉ hiển thị khi online */}
            {reader.isOnline && (
              <div className="absolute top-3 right-3 z-20">
                <span className="relative flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative flex w-3 h-3 rounded-full bg-green-400 ring-2 ring-[#0f0a1a]" />
                </span>
              </div>
            )}

            {/* Rating pill — góc dưới trái */}
            <div className="absolute bottom-3 left-3 z-20">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4C583E]/90 backdrop-blur-sm text-white text-xs font-semibold shadow-lg">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{Number(reader.rating).toFixed(2)}</span>
                <span className="text-white/70">({(reader.reviewCount ?? 0).toLocaleString()})</span>
              </div>
            </div>
          </div>

          {/* ── Info bên dưới ── */}
          <div className="px-3 pt-2.5 pb-3 bg-background/90">
            {/* Tên + verified */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="font-bold text-foreground text-sm truncate">{reader.name}</span>
              {reader.isVerified && <VerifiedBadge size="sm" />}
            </div>

            {/* Giá */}
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4 fill-[#A5B38B] text-[#768064] shrink-0" />
              <span className="text-lg font-bold text-foreground">{priceDisplay}</span>
              <span className="text-xs text-muted-foreground">/H</span>
            </div>
          </div>

        </div>
      </Link>
    </motion.div>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
export function ReaderCardSkeleton() {
  return (
    <div className="rounded-[18px] overflow-hidden border border-white/10 bg-background">
      <div className="w-full aspect-[3/4] skeleton" />
      <div className="px-3 pt-2.5 pb-3 space-y-2">
        <div className="h-4 w-2/3 skeleton rounded" />
        <div className="h-6 w-16 skeleton rounded" />
      </div>
    </div>
  )
}

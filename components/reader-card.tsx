'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, MessageCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { StarRating } from '@/components/ui/star-rating'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { Button } from '@/components/ui/button'
import type { Reader } from '@/lib/data'
import { cn } from '@/lib/utils'

interface ReaderCardProps {
  reader: Reader
  index?: number
}

export function ReaderCard({ reader, index = 0 }: ReaderCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link href={`/readers/${reader.id}`}>
        <GlassCard
          className="p-4 cursor-pointer group"
          glow="purple"
        >
          {/* Header */}
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-purple-500/30 group-hover:ring-purple-500/50 transition-all">
                <Image
                  src={reader.avatar}
                  alt={reader.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <OnlineIndicator isOnline={reader.isOnline} size="md" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">
                  {reader.name}
                </h3>
                {reader.isVerified && <VerifiedBadge size="sm" />}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={reader.rating} size="sm" showValue />
                <span className="text-xs text-muted-foreground">
                  ({reader.totalSessions.toLocaleString()} sessions)
                </span>
              </div>

              {/* Response time */}
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Phản hồi {reader.responseTime}</span>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {reader.specialty.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {reader.bio}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="text-sm">
              <span className="text-muted-foreground">Từ </span>
              <span className="text-lg font-semibold gradient-text">
                {(reader.pricePerSession / 1000).toFixed(0)}k
              </span>
              <span className="text-muted-foreground">/session</span>
            </div>
            <Button
              size="sm"
              className={cn(
                'bg-gradient-to-r from-purple-600 to-indigo-600',
                'hover:from-purple-500 hover:to-indigo-500',
                'text-white shadow-lg shadow-purple-500/25'
              )}
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Đặt lịch
            </Button>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

export function ReaderCardSkeleton() {
  return (
    <GlassCard className="p-4">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl skeleton" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 skeleton rounded" />
          <div className="h-4 w-24 skeleton rounded" />
          <div className="h-3 w-20 skeleton rounded" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-16 skeleton rounded-full" />
        <div className="h-5 w-16 skeleton rounded-full" />
      </div>
      <div className="space-y-2 mt-3">
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-3/4 skeleton rounded" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
        <div className="h-6 w-20 skeleton rounded" />
        <div className="h-8 w-24 skeleton rounded" />
      </div>
    </GlassCard>
  )
}

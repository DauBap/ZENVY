'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Clock, MessageCircle, Star, Shield, Play,
  Calendar, Globe, ChevronLeft, Heart
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { StarRating } from '@/components/ui/star-rating'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

interface ReaderProfilePageProps {
  reader: SerializedReader
}

export function ReaderProfilePage({ reader }: ReaderProfilePageProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/readers"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="relative shrink-0 mx-auto sm:mx-0">
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-purple-500/30">
                        <Image
                          src={reader.avatar}
                          alt={reader.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2">
                        <OnlineIndicator isOnline={reader.isOnline} size="lg" />
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <h1 className="text-2xl font-bold text-foreground">{reader.name}</h1>
                        {reader.isVerified && <VerifiedBadge size="lg" />}
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                        <StarRating rating={Number(reader.rating)} showValue size="md" />
                        <span className="text-sm text-muted-foreground">
                          ({reader.totalSessions.toLocaleString()} sessions)
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Phản hồi {reader.responseTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4" />
                          <span>{reader.experience} kinh nghiệm</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          <span>{reader.languages.join(', ')}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                        {reader.specialty.map((spec) => (
                          <span
                            key={spec}
                            className="px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <Heart
                        className={cn(
                          'w-5 h-5 transition-colors',
                          isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                        )}
                      />
                    </button>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Video giới thiệu</h2>
                  <div className="aspect-video rounded-xl bg-white/5 flex items-center justify-center cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20" />
                    <div className="relative w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Giới thiệu</h2>
                  <p className="text-muted-foreground leading-relaxed">{reader.fullBio}</p>
                </GlassCard>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-foreground">Đánh giá ({reader.reviews.length})</h2>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-semibold text-foreground">{Number(reader.rating)}</span>
                    </div>
                  </div>

                  {reader.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reader.reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                              <Image src={review.userAvatar} alt={review.userName} fill className="object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{review.userName}</span>
                                {review.verified && <VerifiedBadge size="sm" />}
                              </div>
                              <div className="flex items-center gap-2">
                                <StarRating rating={review.rating} size="sm" />
                                <span className="text-xs text-muted-foreground">{review.date.toISOString().split('T')[0]}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có đánh giá nào</p>
                  )}
                </GlassCard>
              </motion.div>
            </div>

            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="sticky top-24">
                <GlassCard className="p-6" glow="purple">
                  <h2 className="text-lg font-semibold text-foreground mb-6">Chọn gói dịch vụ</h2>
                  <div className="space-y-3 mb-6">
                    {reader.packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all border',
                          selectedPackage === pkg.id
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{pkg.name}</span>
                              {pkg.popular && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">Phổ biến</span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{pkg.duration} phút</span>
                          </div>
                          <span className="text-lg font-bold gradient-text">{(pkg.price / 1000).toFixed(0)}k</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{pkg.description}</p>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Star, Heart, MessageCircle, Calendar,
  Clock, Shield, Check, Sparkles, Moon, BookOpen,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

const TABS = ['Dịch vụ', 'Đánh giá', 'Giới thiệu'] as const
type Tab = typeof TABS[number]

export function ReaderProfilePage({ reader }: { reader: SerializedReader }) {
  const [activeTab, setActiveTab] = useState<Tab>('Dịch vụ')
  const [selectedPkg, setSelectedPkg] = useState<number | null>(
    reader.packages?.find((p) => p.popular)?.id ?? reader.packages?.[0]?.id ?? null
  )
  const [isFav, setIsFav] = useState(false)

  const pkg = reader.packages?.find((p) => p.id === selectedPkg)

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-16 pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <Link href="/readers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Quay lại
          </Link>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── HEADER BANNER PANEL ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10"
              style={{ background: 'linear-gradient(135deg, #3b1f6e 0%, #6b3fa0 40%, #a78bda 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 via-purple-600/30 to-indigo-400/20" />

              <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-4 p-5 sm:p-6">

                {/* Avatar + name block */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Avatar with ring */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full ring-4 ring-white/30 overflow-hidden shrink-0"
                      style={{
                        backgroundImage: `url("${reader.avatar}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }} />
                    {reader.isOnline && (
                      <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 ring-2 ring-[#3b1f6e]" />
                    )}
                  </div>

                  {/* Name + meta */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white">{reader.name}</span>
                      {reader.isVerified && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-blue-400/30 text-blue-200 border border-blue-400/40">
                          ✦ XÁC MINH
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 text-xs rounded bg-white/15 text-white/80">
                        ID {reader.id.toString().padStart(8, '0')}
                      </span>
                      {reader.specialty.slice(0, 2).map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-purple-300/20 text-purple-100 border border-purple-300/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 sm:gap-8 flex-1 justify-center sm:justify-center flex-wrap">
                  {[
                    { value: reader.totalSessions > 0 ? Math.floor(reader.totalSessions / 100) : '—', label: 'Theo dõi' },
                    { value: reader.totalSessions > 0 ? `${(reader.totalSessions / 1000).toFixed(1)}K` : '—', label: 'Người hâm mộ' },
                    { value: reader.totalSessions > 0 ? `${(reader.totalSessions * 0.9 / 1000).toFixed(1)}K` : '—', label: 'Đặt lịch' },
                    { value: '100%', label: 'Tỉ lệ hoàn thành' },
                    { value: `⭐ ${Number(reader.rating).toFixed(2)}`, label: 'Điểm đánh giá' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <div className="text-base font-bold text-white">{s.value}</div>
                      <div className="text-[11px] text-white/60 uppercase tracking-wide">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsFav(!isFav)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                      isFav
                        ? 'bg-red-500/80 text-white'
                        : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm'
                    )}
                  >
                    <Heart className={cn('w-4 h-4', isFav && 'fill-white')} />
                    {isFav ? 'Đã theo dõi' : 'Theo dõi'}
                  </button>
                  <Link href={`/chat?reader=${reader.id}`}>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm transition-all border border-white/20">
                      <MessageCircle className="w-4 h-4" />
                      Trò chuyện
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">

            {/* ── LEFT COLUMN ── */}
            <div className="space-y-4">

              {/* Avatar card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <GlassCard className="overflow-hidden p-0">
                  {/* Cover photo */}
                  <div className="relative w-full aspect-[4/5]">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url("${reader.avatar}")`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Online badge */}
                    {reader.isOnline && (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/40 backdrop-blur-sm">
                        <span className="relative flex w-2 h-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative flex w-2 h-2 rounded-full bg-green-400" />
                        </span>
                        <span className="text-xs text-green-400 font-medium">Online</span>
                      </div>
                    )}

                    {/* Fav button */}
                    <button
                      onClick={() => setIsFav(!isFav)}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all"
                    >
                      <Heart className={cn('w-4 h-4 transition-colors', isFav ? 'fill-red-500 text-red-500' : 'text-white')} />
                    </button>

                    {/* Rating overlay */}
                    <div className="absolute bottom-3 left-3">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-white text-xs font-bold">{Number(reader.rating).toFixed(2)}</span>
                        <span className="text-white/60 text-xs">({reader.totalSessions.toLocaleString()})</span>
                      </div>
                    </div>
                  </div>

                  {/* Info below photo */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-bold text-foreground">{reader.name}</h1>
                      {reader.isVerified && <VerifiedBadge size="sm" />}
                    </div>

                    {/* Specialty tags */}
                    {reader.specialty.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {reader.specialty.slice(0, 4).map((s) => (
                          <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10">
                      {[
                        { label: 'Sessions', value: reader.totalSessions.toLocaleString() },
                        { label: 'Kinh nghiệm', value: `${reader.experience_year}n` },
                        { label: 'Phản hồi', value: reader.responseTime },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <div className="text-sm font-bold text-foreground">{s.value}</div>
                          <div className="text-xs text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-2">
                      <Link href={`/booking/${reader.id}`} className="block">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white">
                          <Calendar className="w-4 h-4 mr-2" /> Đặt lịch ngay
                        </Button>
                      </Link>
                      <Link href={`/chat?reader=${reader.id}`} className="block">
                        <Button variant="outline" className="w-full border-white/10 hover:bg-white/5">
                          <MessageCircle className="w-4 h-4 mr-2" /> Nhắn tin
                        </Button>
                      </Link>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Bio card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-foreground">Thông tin</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reader.bio || reader.description || 'Chưa có mô tả.'}
                  </p>
                </GlassCard>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-6">

              {/* Tab bar */}
              <div className="flex border-b border-white/10">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-5 py-3 text-sm font-medium relative transition-colors',
                      activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="profile-tab-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab: Dịch vụ */}
              {activeTab === 'Dịch vụ' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {reader.packages && reader.packages.length > 0 ? reader.packages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPkg(p.id)}
                        className={cn(
                          'w-full p-4 rounded-xl text-left transition-all border',
                          selectedPkg === p.id
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="font-semibold text-foreground">{p.name}</span>
                              {p.popular && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Phổ biến
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.duration} phút</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xl font-bold gradient-text">{(p.price / 1000).toFixed(0)}k</div>
                            <div className="text-xs text-muted-foreground">VNĐ</div>
                          </div>
                        </div>
                      </button>
                    )) : (
                      <p className="text-center text-muted-foreground py-8">Chưa có gói dịch vụ</p>
                    )}
                  </div>

                  {/* Availability */}
                  {reader.availability && reader.availability.length > 0 && (
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <h3 className="font-semibold text-foreground">Lịch trống</h3>
                      </div>
                      <div className="space-y-3">
                        {reader.availability.slice(0, 3).map((a) => (
                          <div key={a.id}>
                            <div className="text-xs text-muted-foreground mb-2">
                              {new Date(a.date).toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {a.slots.map((slot) => (
                                <span key={slot} className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300">
                                  {slot}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {/* Booking CTA */}
                  {pkg && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">Gói đã chọn</div>
                        <div className="font-semibold text-foreground">{pkg.name} · {pkg.duration} phút</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">{(pkg.price / 1000).toFixed(0)}k</div>
                      </div>
                      <Link href={`/booking/${reader.id}?package=${pkg.id}`}>
                        <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0">
                          Đặt lịch
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Đánh giá */}
              {activeTab === 'Đánh giá' && (
                <div className="space-y-4">
                  {/* Summary */}
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold gradient-text">{Number(reader.rating).toFixed(1)}</div>
                        <div className="flex gap-0.5 justify-center mt-1">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={cn('w-4 h-4', s <= Math.round(Number(reader.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20')} />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{reader.totalSessions} sessions</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map((s) => {
                          const count = reader.reviews?.filter((r) => r.rating === s).length ?? 0
                          const total = reader.reviews?.length ?? 1
                          return (
                            <div key={s} className="flex items-center gap-2 text-xs">
                              <span className="w-3 text-muted-foreground">{s}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-yellow-400 transition-all"
                                  style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                                />
                              </div>
                              <span className="w-4 text-muted-foreground">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </GlassCard>

                  {/* Review list */}
                  {reader.reviews && reader.reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reader.reviews.map((review) => (
                        <GlassCard key={review.id} className="p-4">
                          <div className="flex items-start gap-3">
                            <div
                              className="w-9 h-9 rounded-full shrink-0 bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300"
                              style={review.userAvatar ? {
                                backgroundImage: `url("${review.userAvatar}")`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              } : {}}
                            >
                              {!review.userAvatar && review.userName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm font-medium text-foreground">{review.userName}</span>
                                  {review.verified && <Check className="w-3.5 h-3.5 text-green-400" />}
                                </div>
                                <div className="flex gap-0.5 shrink-0">
                                  {[1,2,3,4,5].map((s) => (
                                    <Star key={s} className={cn('w-3 h-3', s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-white/20')} />
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground mb-2">
                                {new Date(review.date).toLocaleDateString('vi-VN')}
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Moon className="w-12 h-12 text-purple-400/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Giới thiệu */}
              {activeTab === 'Giới thiệu' && (
                <div className="space-y-4">
                  <GlassCard className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-purple-400" />
                      <h3 className="font-semibold text-foreground">Về tôi</h3>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
                      {reader.description || reader.bio || 'Reader chưa cập nhật thông tin giới thiệu.'}
                    </p>
                  </GlassCard>

                  {/* Thông tin chi tiết */}
                  <GlassCard className="p-5">
                    <h3 className="font-semibold text-foreground mb-4">Chi tiết</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Shield, label: 'Kinh nghiệm', value: `${reader.experience_year} năm` },
                        { icon: Clock, label: 'Phản hồi TB', value: reader.responseTime },
                        { icon: Star, label: 'Đánh giá', value: `${Number(reader.rating).toFixed(1)} / 5.0` },
                        { icon: Sparkles, label: 'Chuyên môn', value: reader.specialty.join(', ') || 'Tarot' },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                          <span className="text-muted-foreground w-28 shrink-0">{label}</span>
                          <span className="text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  )
}

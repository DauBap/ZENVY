'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Heart, Bell, History, CreditCard,
  Sparkles, MessageSquare, Settings, LogOut, Moon,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'
import type { SerializedReader } from '@/lib/serializers'

interface DashboardPageProps {
  readers: SerializedReader[]
  bookings: any[]
  userName: string
}

const tabs = [
  { id: 'bookings', label: 'Lich hen', icon: Calendar },
  { id: 'history', label: 'Lich su', icon: History },
  { id: 'favorites', label: 'Yeu thich', icon: Heart },
  { id: 'ai-history', label: 'AI Tarot', icon: Sparkles },
  { id: 'payments', label: 'Thanh toan', icon: CreditCard },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:   { label: 'Cho xac nhan', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  CONFIRMED: { label: 'Da xac nhan',  className: 'bg-green-500/20  text-green-400  border-green-500/30'  },
  COMPLETED: { label: 'Hoan thanh',   className: 'bg-blue-500/20   text-blue-400   border-blue-500/30'   },
  CANCELLED: { label: 'Da huy',       className: 'bg-red-500/20    text-red-400    border-red-500/30'    },
}

export function DashboardPage({ readers, bookings, userName }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('bookings')
  const { logout } = useAuthModal()

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter((b) => b.date >= today && b.status !== 'CANCELLED')
  const sessionHistory   = bookings.filter((b) => b.date <  today || b.status === 'COMPLETED')

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Xin chao, <span className="gradient-text">{userName}</span> 👋
              </h1>
              <p className="text-muted-foreground">Quan ly lich hen va hoat dong cua ban</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative border-white/10">
                <Bell className="w-5 h-5" />
                {upcomingBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {upcomingBookings.length}
                  </span>
                )}
              </Button>
              <Button variant="outline" size="icon" className="border-white/10">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
              <GlassCard className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        activeTab === tab.id ? 'bg-purple-500/20 text-purple-300' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}>
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Dang xuat</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 space-y-6">

              {/* Tab: Lich hen */}
              {activeTab === 'bookings' && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Lich hen sap toi</h2>
                    <Link href="/readers">
                      <Button variant="outline" size="sm" className="border-white/10">Dat lich moi</Button>
                    </Link>
                  </div>

                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((b) => {
                        const status = STATUS_MAP[b.status] ?? STATUS_MAP.PENDING
                        const readerName = b.reader?.display_name ?? 'Reader'
                        const readerAvatar = b.reader?.avatar_url ?? '/placeholder-user.jpg'
                        const pkgLabel = b.package ? `${b.package.name} - ${b.package.duration} phut` : ''
                        return (
                          <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl shrink-0"
                                style={{ backgroundImage: `url("${readerAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div>
                                <div className="font-medium text-foreground">{readerName}</div>
                                <div className="text-sm text-muted-foreground">{pkgLabel}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-foreground">{b.date}</span>
                                  <Clock className="w-4 h-4 text-purple-400 ml-2" />
                                  <span className="text-sm text-foreground">{b.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn('px-3 py-1 text-xs rounded-full border', status.className)}>
                                {status.label}
                              </span>
                              <Link href={`/chat?reader=${b.reader?.id}`}>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                                  <MessageSquare className="w-4 h-4 mr-1" /> Chat
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Moon className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Ban chua co lich hen nao</p>
                      <Link href="/readers"><Button>Dat lich ngay</Button></Link>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Tab: Lich su */}
              {activeTab === 'history' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lich su session</h2>
                  {sessionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {sessionHistory.map((b) => {
                        const readerName = b.reader?.display_name ?? 'Reader'
                        const readerAvatar = b.reader?.avatar_url ?? '/placeholder-user.jpg'
                        const pkgLabel = b.package ? `${b.package.name} - ${b.package.duration} phut` : ''
                        return (
                          <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl shrink-0"
                                style={{ backgroundImage: `url("${readerAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div>
                                <div className="font-medium text-foreground">{readerName}</div>
                                <div className="text-sm text-muted-foreground">{pkgLabel}</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">{b.date}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Chua co lich su session</p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Tab: Yeu thich */}
              {activeTab === 'favorites' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Reader yeu thich</h2>
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Chua co reader yeu thich</p>
                    <Link href="/readers"><Button variant="outline">Kham pha Readers</Button></Link>
                  </div>
                </GlassCard>
              )}

              {/* Tab: AI Tarot */}
              {activeTab === 'ai-history' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lich su AI Tarot</h2>
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Chua co lich su AI Tarot</p>
                    <Link href="/ai-tarot"><Button>Thu AI Tarot ngay</Button></Link>
                  </div>
                </GlassCard>
              )}

              {/* Tab: Thanh toan */}
              {activeTab === 'payments' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lich su thanh toan</h2>
                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((b) => {
                        const readerName = b.reader?.display_name ?? 'Reader'
                        const price = b.package?.price ?? 0
                        return (
                          <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                              <div className="font-medium text-foreground">{readerName}</div>
                              <div className="text-xs text-muted-foreground">{b.date} {b.time}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold gradient-text">{(price / 1000).toFixed(0)}k</div>
                              <div className={cn('text-xs', STATUS_MAP[b.status]?.className ?? '')}>
                                {STATUS_MAP[b.status]?.label ?? b.status}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Chua co giao dich nao</p>
                    </div>
                  )}
                </GlassCard>
              )}

            </motion.div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  )
}

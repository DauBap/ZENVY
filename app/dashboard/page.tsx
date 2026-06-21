'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Heart, Bell, History, CreditCard,
  Sparkles, MessageSquare, ChevronRight, Settings, LogOut
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { readers } from '@/lib/data'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'bookings', label: 'Lịch hẹn', icon: Calendar },
  { id: 'history', label: 'Lịch sử', icon: History },
  { id: 'favorites', label: 'Yêu thích', icon: Heart },
  { id: 'ai-history', label: 'AI Tarot', icon: Sparkles },
  { id: 'payments', label: 'Thanh toán', icon: CreditCard },
]

const upcomingBookings = [
  {
    id: '1',
    reader: readers[0],
    date: '2024-01-25',
    time: '14:00',
    package: 'Tiêu chuẩn - 30 phút',
    status: 'confirmed',
  },
  {
    id: '2',
    reader: readers[1],
    date: '2024-01-28',
    time: '19:00',
    package: 'Nâng cao - 45 phút',
    status: 'pending',
  },
]

const sessionHistory = [
  {
    id: '1',
    reader: readers[0],
    date: '2024-01-15',
    package: 'Tiêu chuẩn - 30 phút',
    rating: 5,
    reviewed: true,
  },
  {
    id: '2',
    reader: readers[2],
    date: '2024-01-10',
    package: 'Quick Insight - 15 phút',
    rating: 5,
    reviewed: true,
  },
]

const notifications = [
  { id: '1', message: 'Nhắc nhở: Bạn có lịch hẹn với Luna vào 14:00 ngày mai', time: '2 giờ trước', unread: true },
  { id: '2', message: 'Reader Thiên Nhi đã online', time: '5 giờ trước', unread: true },
  { id: '3', message: 'Đánh giá của bạn đã được gửi thành công', time: '1 ngày trước', unread: false },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('bookings')
  const favoriteReaders = readers.slice(0, 3)

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Xin chào, <span className="gradient-text">Người dùng</span> 👋
              </h1>
              <p className="text-muted-foreground">Quản lý lịch hẹn và hoạt động của bạn</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative border-white/10">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  2
                </span>
              </Button>
              <Button variant="outline" size="icon" className="border-white/10">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <GlassCard className="p-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        activeTab === tab.id
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>
                  </button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3 space-y-6"
            >
              {/* Upcoming Bookings */}
              {activeTab === 'bookings' && (
                <>
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-foreground">Lịch hẹn sắp tới</h2>
                      <Link href="/readers">
                        <Button variant="outline" size="sm" className="border-white/10">
                          Đặt lịch mới
                        </Button>
                      </Link>
                    </div>

                    {upcomingBookings.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                          >
                            <div className="flex items-center gap-4">
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden">
                                <Image
                                  src={booking.reader.avatar}
                                  alt={booking.reader.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium text-foreground">{booking.reader.name}</div>
                                <div className="text-sm text-muted-foreground">{booking.package}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-foreground">{booking.date}</span>
                                  <Clock className="w-4 h-4 text-purple-400 ml-2" />
                                  <span className="text-sm text-foreground">{booking.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  'px-3 py-1 text-xs rounded-full',
                                  booking.status === 'confirmed'
                                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                )}
                              >
                                {booking.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận'}
                              </span>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                                <MessageSquare className="w-4 h-4 mr-1" />
                                Chat
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Bạn chưa có lịch hẹn nào</p>
                        <Link href="/readers">
                          <Button>Đặt lịch ngay</Button>
                        </Link>
                      </div>
                    )}
                  </GlassCard>

                  {/* Notifications */}
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Thông báo</h2>
                    <div className="space-y-3">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl transition-colors',
                            notif.unread ? 'bg-purple-500/10' : 'bg-white/5'
                          )}
                        >
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2',
                            notif.unread ? 'bg-purple-400' : 'bg-transparent'
                          )} />
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{notif.message}</p>
                            <span className="text-xs text-muted-foreground">{notif.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </>
              )}

              {/* History */}
              {activeTab === 'history' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lịch sử session</h2>
                  <div className="space-y-4">
                    {sessionHistory.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                            <Image
                              src={session.reader.avatar}
                              alt={session.reader.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{session.reader.name}</div>
                            <div className="text-sm text-muted-foreground">{session.package}</div>
                            <div className="text-xs text-muted-foreground">{session.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-yellow-400">
                            {'★'.repeat(session.rating)}
                          </div>
                          <Button variant="outline" size="sm" className="border-white/10">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Favorites */}
              {activeTab === 'favorites' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Readers yêu thích</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favoriteReaders.map((reader) => (
                      <Link key={reader.id} href={`/readers/${reader.id}`}>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                              <Image
                                src={reader.avatar}
                                alt={reader.name}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1">
                                <OnlineIndicator isOnline={reader.isOnline} size="sm" />
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{reader.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {reader.specialty.slice(0, 2).join(', ')}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" className="w-full bg-purple-600/50 hover:bg-purple-600 text-white">
                            Đặt lịch
                          </Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* AI History */}
              {activeTab === 'ai-history' && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">Lịch sử AI Tarot</h2>
                    <Link href="/ai-tarot">
                      <Button variant="outline" size="sm" className="border-white/10">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Trải bài mới
                      </Button>
                    </Link>
                  </div>
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Bạn chưa có lịch sử AI Tarot</p>
                    <Link href="/ai-tarot">
                      <Button>Thử AI Tarot ngay</Button>
                    </Link>
                  </div>
                </GlassCard>
              )}

              {/* Payments */}
              {activeTab === 'payments' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lịch sử thanh toán</h2>
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Không có giao dịch nào</p>
                  </div>
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

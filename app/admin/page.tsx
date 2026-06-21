'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Users, Calendar, DollarSign, TrendingUp, AlertTriangle,
  Bell, Settings, LayoutDashboard, MessageSquare, FileText,
  CreditCard, Shield, BarChart, LogOut, ChevronRight
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'readers', label: 'Quản lý Readers', icon: Users },
  { id: 'bookings', label: 'Đặt lịch', icon: Calendar },
  { id: 'disputes', label: 'Dispute', icon: AlertTriangle, badge: 3 },
  { id: 'payouts', label: 'Thanh toán', icon: CreditCard },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'reports', label: 'Báo cáo', icon: FileText },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
]

const stats = [
  { label: 'Tổng doanh thu', value: '₫156.8M', change: '+12.5%', icon: DollarSign, color: 'text-green-400' },
  { label: 'Bookings hôm nay', value: '234', change: '+8.2%', icon: Calendar, color: 'text-blue-400' },
  { label: 'Readers hoạt động', value: '47', change: '+2', icon: Users, color: 'text-purple-400' },
  { label: 'Disputes mở', value: '3', change: '-2', icon: AlertTriangle, color: 'text-yellow-400' },
]

const recentBookings = [
  { id: '1', user: 'Nguyễn Văn A', reader: 'Luna Minh Nguyệt', amount: '280,000đ', status: 'completed', time: '10 phút trước' },
  { id: '2', user: 'Trần Thị B', reader: 'Đặng Mystic', amount: '550,000đ', status: 'in_progress', time: '25 phút trước' },
  { id: '3', user: 'Lê Văn C', reader: 'Thiên Nhi', amount: '120,000đ', status: 'pending', time: '1 giờ trước' },
  { id: '4', user: 'Phạm Thị D', reader: 'Master Phong', amount: '900,000đ', status: 'completed', time: '2 giờ trước' },
]

const pendingPayouts = [
  { reader: 'Luna Minh Nguyệt', amount: '12,500,000đ', sessions: 45 },
  { reader: 'Đặng Mystic', amount: '8,750,000đ', sessions: 28 },
  { reader: 'Thiên Nhi', amount: '5,200,000đ', sessions: 35 },
]

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-white/10 fixed inset-y-0 left-0 z-50 hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-2xl">☽</span>
              </div>
              <div>
                <span className="text-lg font-bold gradient-text">Mystic</span>
                <span className="text-xs text-muted-foreground block">Admin Panel</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all',
                  activeSection === item.id
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Tổng quan hệ thống</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative border-white/10">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  5
                </span>
              </Button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn('p-2 rounded-xl bg-white/5', stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className={cn(
                      'text-xs font-medium px-2 py-1 rounded-full',
                      stat.change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Bookings gần đây</h2>
                  <Button variant="ghost" size="sm" className="text-purple-400">
                    Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{booking.user}</div>
                        <div className="text-sm text-muted-foreground">→ {booking.reader}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-foreground">{booking.amount}</div>
                        <div className={cn(
                          'text-xs',
                          booking.status === 'completed' ? 'text-green-400' :
                          booking.status === 'in_progress' ? 'text-blue-400' : 'text-yellow-400'
                        )}>
                          {booking.status === 'completed' ? 'Hoàn thành' :
                           booking.status === 'in_progress' ? 'Đang diễn ra' : 'Chờ'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Pending Payouts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground">Thanh toán chờ</h2>
                  <Button variant="ghost" size="sm" className="text-purple-400">
                    Xử lý <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {pendingPayouts.map((payout, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div>
                        <div className="font-medium text-foreground">{payout.reader}</div>
                        <div className="text-sm text-muted-foreground">{payout.sessions} sessions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-400">{payout.amount}</div>
                        <Button size="sm" variant="outline" className="mt-1 h-7 text-xs border-white/10">
                          Thanh toán
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Hành động nhanh</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-purple-500/10">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span>Thêm Reader</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-blue-500/10">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                  <span>Gửi thông báo</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-green-500/10">
                  <CreditCard className="w-6 h-6 text-green-400" />
                  <span>Xử lý Payout</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-white/10 hover:bg-yellow-500/10">
                  <Shield className="w-6 h-6 text-yellow-400" />
                  <span>Xem Disputes</span>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

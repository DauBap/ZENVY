'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Users, Calendar, Star, TrendingUp,
  CheckCircle, XCircle, Clock, DollarSign, ChevronRight,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn, formatAmountK } from '@/lib/utils'

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: 'text-green-400 bg-green-500/10',
  CONFIRMED: 'text-blue-400 bg-blue-500/10',
  PENDING:   'text-yellow-400 bg-yellow-500/10',
  CANCELLED: 'text-red-400 bg-red-500/10',
}
const STATUS_LABEL: Record<string, string> = {
  COMPLETED: 'Hoàn thành', CONFIRMED: 'Xác nhận',
  PENDING: 'Chờ', CANCELLED: 'Đã hủy',
}

export function AdminDashboard({ stats, recentBookings }: { stats: any; recentBookings: any[] }) {
  const cards = [
    { label: 'Người dùng', value: stats.totalUsers.toLocaleString(), sub: `${stats.totalReaders} readers`, icon: Users, color: 'text-[#768064]', bg: 'bg-[#768064]/10' },
    { label: 'Lịch hẹn hôm nay', value: stats.todayBookings.toLocaleString(), sub: `${stats.totalBookings} tổng`, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Hoàn thành', value: `${stats.completionRate}%`, sub: `${stats.completedBookings} phiên`, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Doanh thu', value: formatAmountK(stats.totalRevenue), sub: `${stats.totalReviews} đánh giá`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Đánh giá TB', value: stats.avgRating.toFixed(1), sub: `/ 5.0`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Chờ xác nhận', value: stats.pendingBookings.toLocaleString(), sub: `${stats.cancelledBookings} đã hủy`, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Tổng quan hệ thống SAGETO</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard className="p-4">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-3', c.bg)}>
                <c.icon className={cn('w-4 h-4', c.color)} />
              </div>
              <div className="text-xl font-bold text-foreground">{c.value}</div>
              <div className="text-xs text-foreground font-medium">{c.label}</div>
              <div className="text-xs text-muted-foreground">{c.sub}</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Recent bookings table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <GlassCard className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <h2 className="font-semibold text-foreground">Lịch hẹn gần đây</h2>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-[#768064] hover:text-[#4C583E]">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['ID', 'Khách hàng', 'Reader', 'Gói', 'Số tiền', 'Ngày', 'Trạng thái'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-muted-foreground font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b, i) => (
                  <tr key={b.id} className={cn('border-b border-white/5 hover:bg-white/3 transition-colors', i % 2 === 0 ? 'bg-white/[0.01]' : '')}>
                    <td className="px-4 py-3 text-muted-foreground">#{b.id}</td>
                    <td className="px-4 py-3 text-foreground font-medium">{b.customer}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.reader}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.packageName}</td>
                    <td className="px-4 py-3 text-foreground">{formatAmountK(b.amount)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', STATUS_COLOR[b.status] ?? '')}>
                        {STATUS_LABEL[b.status] ?? b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/admin/users',    label: 'Quản lý người dùng', icon: Users,    color: 'bg-[#768064]/10 text-[#768064]' },
          { href: '/admin/bookings', label: 'Quản lý lịch hẹn',   icon: Calendar, color: 'bg-blue-500/10 text-blue-400' },
          { href: '/admin/payments', label: 'Lịch sử thanh toán',  icon: DollarSign, color: 'bg-green-500/10 text-green-400' },
        ].map(l => (
          <Link key={l.href} href={l.href}>
            <GlassCard className="p-4 flex items-center gap-3 hover:bg-white/10 transition-all cursor-pointer">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', l.color)}>
                <l.icon className="w-5 h-5" />
              </div>
              <span className="font-medium text-foreground text-sm">{l.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </GlassCard>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}

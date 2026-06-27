'use client'

import { motion } from 'framer-motion'
import { Users, Star, Shield, Clock, ThumbsUp, MessageSquare } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import type { SerializedPlatformStat } from '@/lib/serializers'

interface TrustSectionProps {
  platformStats: SerializedPlatformStat
}

export function TrustSection({ platformStats }: TrustSectionProps) {
  const stats = [
    {
      icon: MessageSquare,
      value: platformStats.totalSessions.toLocaleString(),
      label: 'Sessions hoàn thành',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      icon: Star,
      value: platformStats.averageRating.toString(),
      label: 'Rating trung bình',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    {
      icon: Shield,
      value: platformStats.verifiedReaders.toString() + '+',
      label: 'Verified Readers',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      icon: Clock,
      value: platformStats.avgResponseTime,
      label: 'Thời gian phản hồi',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      icon: ThumbsUp,
      value: platformStats.satisfactionRate + '%',
      label: 'Hài lòng',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
    },
    {
      icon: Users,
      value: platformStats.onlineReaders.toString(),
      label: 'Readers Online',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    },
  ]

  return (
    <section className="py-16 lg:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Được tin tưởng bởi <span className="gradient-text">hàng ngàn</span> người dùng
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nền tảng Tarot booking hàng đầu với đội ngũ reader chuyên nghiệp và hệ thống bảo mật tiên tiến
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <GlassCard className="p-5 text-center h-full" hover>
                <div className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.label}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8"
        >
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">SSL Secured</div>
              <div className="text-xs">256-bit encryption</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">Verified Readers</div>
              <div className="text-xs">Quy trình xác minh nghiêm ngặt</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">Hoàn tiền 100%</div>
              <div className="text-xs">Nếu không hài lòng</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

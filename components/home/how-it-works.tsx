'use client'

import { motion } from 'framer-motion'
import { Search, Calendar, Sparkles, ArrowRight } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

const steps = [
  {
    icon: Search,
    title: 'Chọn Reader',
    description: 'Tìm kiếm và chọn Reader phù hợp với nhu cầu của bạn. Xem profile, reviews và specialties.',
    color: 'from-[#768064] to-[#4C583E]',
    iconBg: 'bg-[#768064]/20',
    iconColor: 'text-[#4C583E]',
  },
  {
    icon: Calendar,
    title: 'Đặt lịch',
    description: 'Chọn gói dịch vụ và khung giờ phù hợp. Thanh toán an toàn trong vài giây.',
    color: 'from-[#768064] to-[#2C3424]',
    iconBg: 'bg-[#768064]/20',
    iconColor: 'text-[#4C583E]',
  },
  {
    icon: Sparkles,
    title: 'Nhận Guidance',
    description: 'Kết nối với Reader qua chat hoặc video call. Nhận insight và hướng dẫn từ chuyên gia.',
    color: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#A5B38B]/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 lg:mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Cách <span className="gradient-text">hoạt động</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Chỉ cần 3 bước đơn giản để kết nối với Tarot Reader và nhận guidance cho cuộc sống của bạn
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <GlassCard className="p-6 lg:p-8 h-full" glow="olive">
                {/* Step number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-xl bg-gradient-to-br from-[#4C583E] to-[#2C3424] flex items-center justify-center text-white font-bold shadow-lg shadow-[#768064]/20">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl ${step.iconBg} mb-5`}>
                  <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow (for desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-8 h-8 rounded-full bg-background border border-white/10 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-[#768064]" />
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Mobile arrow */}
              {index < steps.length - 1 && (
                <div className="flex md:hidden justify-center my-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center rotate-90">
                    <ArrowRight className="w-4 h-4 text-[#768064]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Sparkles, Shield, Heart, Star, Users, Zap,
  Eye, Compass, Moon, Sun, ArrowRight,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const values = [
  {
    icon: Shield,
    title: 'Xác minh & Tin cậy',
    description: 'Mỗi Reader đều trải qua quy trình kiểm duyệt nghiêm ngặt. Chúng tôi xác minh năng lực và đánh giá từng hồ sơ trước khi họ xuất hiện trên nền tảng.',
    iconBg: 'bg-[#768064]/20',
    iconColor: 'text-[#4C583E]',
  },
  {
    icon: Heart,
    title: 'Đồng cảm & Tôn trọng',
    description: 'Chúng tôi tin rằng mỗi hành trình đều xứng đáng được lắng nghe. Mọi phiên đọc bài đều được thực hiện trong sự tôn trọng và không phán xét.',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-400',
  },
  {
    icon: Eye,
    title: 'Minh bạch',
    description: 'Giá cả công khai, không phí ẩn. Reader trình bày rõ chuyên môn và phương pháp tiếp cận trước khi bạn đặt lịch.',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
  },
  {
    icon: Zap,
    title: 'Công nghệ hiện đại',
    description: 'Từ AI Tarot miễn phí đến chat realtime và đặt lịch tức thì — chúng tôi ứng dụng công nghệ để mang lại trải nghiệm liền mạch nhất.',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
  },
]

const milestones = [
  { year: '2023', title: 'Ra đời', desc: 'SAGETO được thành lập với sứ mệnh kết nối tâm linh và công nghệ.' },
  { year: '2024', title: 'Tăng trưởng', desc: 'Đạt 50+ Tarot Readers được xác minh và hàng nghìn phiên tư vấn thành công.' },
  { year: '2025', title: 'AI & Cộng đồng', desc: 'Ra mắt AI Tarot miễn phí và tính năng cộng đồng, tạo không gian chia sẻ và học hỏi.' },
]

const teamValues = [
  { icon: Moon, label: 'Huyền bí' },
  { icon: Compass, label: 'Định hướng' },
  { icon: Sun, label: 'Tích cực' },
  { icon: Star, label: 'Xuất sắc' },
]

const stats = [
  { value: '50+', label: 'Tarot Readers' },
  { value: '1,000+', label: 'Phiên tư vấn' },
  { value: '98%', label: 'Tỉ lệ hài lòng' },
  { value: '24/7', label: 'Hỗ trợ' },
]

export function AboutPage() {
  return (
    <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#768064]/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#768064]/10 border border-[#768064]/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-[#768064]" />
            <span className="text-sm text-[#4C583E]">Về chúng tôi</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight"
          >
            Nơi tâm linh gặp gỡ{' '}
            <span className="gradient-text">công nghệ</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          >
            SAGETO ra đời từ niềm tin rằng mỗi người đều xứng đáng có được sự rõ ràng trong
            cuộc sống. Chúng tôi kết nối bạn với những Tarot Reader được xác minh — những
            người thực sự có thể đồng hành cùng bạn trên hành trình khám phá bản thân.
          </motion.p>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────────── */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 text-center" hover={false}>
                  <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Mission ─────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
                Sứ mệnh của <span className="gradient-text">chúng tôi</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Chúng tôi tin rằng Tarot không phải là mê tín — đó là một công cụ
                  phản chiếu nội tâm, giúp bạn nhìn rõ hơn về bản thân và những lựa
                  chọn đang đứng trước mình.
                </p>
                <p>
                  SAGETO được xây dựng để xóa bỏ rào cản giữa bạn và những Tarot Reader
                  thực sự tài năng. Không còn phải mất thời gian tìm kiếm, không còn lo
                  lắng về chất lượng — chúng tôi lo tất cả để bạn có thể tập trung vào
                  điều quan trọng nhất: hành trình của chính bạn.
                </p>
                <p>
                  Từ AI Tarot miễn phí cho những câu hỏi nhỏ, đến phiên tư vấn sâu với
                  Reader chuyên nghiệp — chúng tôi ở đây ở mọi bước trên con đường của bạn.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {teamValues.map((v, i) => (
                <motion.div
                  key={v.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <GlassCard className="p-6 text-center" glow="gold">
                    <div className="inline-flex p-3 rounded-2xl bg-[#768064]/20 mb-3">
                      <v.icon className="w-6 h-6 text-[#4C583E]" />
                    </div>
                    <div className="text-sm font-medium text-foreground">{v.label}</div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#768064]/5 to-transparent pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Giá trị <span className="gradient-text">cốt lõi</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Những nguyên tắc định hướng mọi quyết định chúng tôi đưa ra
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="p-6 lg:p-8 h-full flex gap-5" hover={false}>
                  <div className={cn('inline-flex p-3 rounded-2xl shrink-0 h-fit', v.iconBg)}>
                    <v.icon className={cn('w-6 h-6', v.iconColor)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{v.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{v.description}</p>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Hành trình <span className="gradient-text">của chúng tôi</span>
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#768064]/60 via-[#768064]/30 to-transparent" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-6 pl-0"
                >
                  {/* Dot */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-[#768064]/30 z-10 relative">
                      {m.year.slice(2)}
                    </div>
                  </div>

                  <GlassCard className="flex-1 p-5" hover={false}>
                    <div className="text-xs text-[#768064] font-semibold mb-1">{m.year}</div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <GlassCard className="p-8 lg:p-12 text-center" glow="gold">
              <div className="inline-flex p-4 rounded-2xl bg-[#768064]/20 mb-6">
                <Users className="w-8 h-8 text-[#4C583E]" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Sẵn sàng bắt đầu hành trình?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Khám phá đội ngũ Tarot Readers chuyên nghiệp của chúng tôi,
                hoặc thử AI Tarot miễn phí ngay hôm nay.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/readers">
                  <Button className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white px-8">
                    Tìm Reader ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/ai-tarot">
                  <Button variant="outline" className="border-[#768064]/30 hover:border-[#768064]/60 px-8">
                    <Sparkles className="w-4 h-4 mr-2 text-[#768064]" />
                    Thử AI Tarot
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

    </main>
  )
}

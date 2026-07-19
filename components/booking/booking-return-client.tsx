'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, X, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'

type State = 'checking' | 'success' | 'cancelled' | 'pending'

export function BookingReturnClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const cancelled = searchParams.get('cancelled') === '1'
  const [state, setState] = useState<State>(cancelled ? 'cancelled' : 'checking')

  useEffect(() => {
    if (cancelled || !bookingId) return

    let tries = 0
    let stop = false

    // Poll trạng thái vài lần — webhook có thể tới sau vài giây; GET cũng tự sync với PayOS
    async function poll() {
      while (!stop && tries < 5) {
        tries++
        try {
          const res = await fetch(`/api/bookings/${bookingId}/payment`, { cache: 'no-store' })
          const data = await res.json()
          if (data.status === 'PAYMENT_CONFIRMED') {
            setState('success')
            return
          }
        } catch {
          // bỏ qua, thử lại
        }
        await new Promise((r) => setTimeout(r, 1500))
      }
      if (!stop) setState('pending')
    }

    poll()
    return () => { stop = true }
  }, [bookingId, cancelled])

  const content = {
    checking: {
      icon: <Loader2 className="w-10 h-10 text-[#768064] animate-spin" />,
      ring: 'bg-[#768064]/20',
      title: 'Đang xác nhận thanh toán…',
      desc: 'Vui lòng đợi trong giây lát, chúng mình đang kiểm tra giao dịch của bạn.',
    },
    success: {
      icon: <Check className="w-10 h-10 text-green-400" />,
      ring: 'bg-green-500/20',
      title: 'Thanh toán thành công!',
      desc: 'Lịch hẹn đã được xác nhận thanh toán. Reader sẽ xác nhận buổi hẹn và bạn sẽ nhận được email nhắc lịch.',
    },
    cancelled: {
      icon: <X className="w-10 h-10 text-red-400" />,
      ring: 'bg-red-500/20',
      title: 'Thanh toán đã bị hủy',
      desc: 'Bạn chưa hoàn tất thanh toán. Lịch hẹn vẫn đang chờ — bạn có thể thử thanh toán lại từ trang lịch hẹn.',
    },
    pending: {
      icon: <Loader2 className="w-10 h-10 text-amber-400" />,
      ring: 'bg-amber-500/20',
      title: 'Đang chờ xác nhận',
      desc: 'Giao dịch của bạn đang được xử lý. Trạng thái sẽ tự cập nhật trong lịch hẹn ngay khi thanh toán được ghi nhận.',
    },
  }[state]

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <GlassCard className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full ${content.ring} flex items-center justify-center mx-auto mb-6`}>
            {content.icon}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">{content.title}</h1>
          <p className="text-muted-foreground mb-6">{content.desc}</p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
                Xem lịch hẹn của tôi
              </Button>
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Check, Calendar, Clock, CreditCard,
  Shield, ChevronRight, Sparkles,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'
import type { SerializedReader } from '@/lib/serializers'

const STEPS = [
  { id: 1, label: 'Chọn gói' },
  { id: 2, label: 'Chọn thời gian' },
  { id: 3, label: 'Thanh toán' },
  { id: 4, label: 'Xác nhận' },
]

export function BookingClient({ reader, takenSlots = [] }: { reader: SerializedReader; takenSlots?: string[] }) {
  const searchParams = useSearchParams()
  const { user, openLogin } = useAuthModal()
  const packageIdParam = searchParams.get('package') // number string từ DB

  // selectedPackage lưu dạng number (id từ DB)
  const initPkgId = packageIdParam ? Number(packageIdParam) : null
  const [currentStep, setCurrentStep] = useState(initPkgId ? 2 : 1)
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(initPkgId)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Luôn tìm đúng package từ DB data
  const selectedPkg = reader.packages?.find((p) => p.id === selectedPackageId) ?? null

  // Chỉ cho chọn slot reader đã bật và chưa bị chiếm
  // Filter theo NGÀY (bỏ qua ngày đã qua hoàn toàn), KHÔNG filter theo giờ
  // để tránh ẩn slot của ngày hôm nay vì chênh lệch timezone
  const ICT_OFFSET_MS = 7 * 60 * 60 * 1000
  const nowUtcMs = Date.now()
  // "Hôm nay" theo giờ VN (YYYY-MM-DD)
  const todayVN = new Date(nowUtcMs + ICT_OFFSET_MS).toISOString().split('T')[0]

  const taken = new Set(takenSlots)

  const availByDate = (reader.availability ?? [])
    .map((a) => {
      const date = a.date.split('T')[0]
      return {
        date,
        // Chỉ loại slot đã bị chiếm bởi booking khác
        slots: a.slots.filter((s) => !taken.has(`${date} ${s}`)),
      }
    })
    // Chỉ bỏ ngày TRƯỚC hôm nay — ngày hôm nay và tương lai đều hiện
    .filter((a) => a.date >= todayVN && a.slots.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const dates = availByDate.map((a) => {
    const d = new Date(a.date)
    return {
      value: a.date,
      day: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: d.getDate(),
      month: d.toLocaleDateString('vi-VN', { month: 'numeric' }),
    }
  })

  const slotsForSelected = availByDate.find((a) => a.date === selectedDate)?.slots ?? []

  const canProceed = () => {
    if (currentStep === 1) return selectedPackageId !== null
    if (currentStep === 2) return !!selectedDate && !!selectedTime
    return true
  }

  const handleConfirmPayment = async () => {
    // Chưa đăng nhập → mở login modal
    if (!user) {
      openLogin()
      return
    }
    // Chống double-submit (nguyên nhân tạo booking trùng)
    if (submitting) return
    setSubmitting(true)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          readerId: reader.id,
          packageId: selectedPackageId,
          date: selectedDate,
          time: selectedTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        // Nếu 401 thì mở login
        if (res.status === 401) {
          openLogin()
          return
        }
        toast.error(data.error || 'Đặt lịch thất bại.')
        return
      }
      setCurrentStep(4)
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (p: number) => p >= 1000 ? `${(p / 1000).toFixed(0)}k` : `${p}`

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <Link href={`/readers/${reader.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
          </Link>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                      currentStep > step.id ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.id ? 'bg-purple-500 border-purple-500 text-white'
                        : 'bg-transparent border-white/20 text-muted-foreground'
                    )}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={cn('text-xs mt-2 hidden sm:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-2', currentStep > step.id ? 'bg-green-500' : 'bg-white/10')} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">

              {/* Step 1: Chọn gói */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Chọn gói dịch vụ</h2>
                    {reader.packages && reader.packages.length > 0 ? (
                      <div className="space-y-3">
                        {reader.packages.map((pkg) => (
                          <button key={pkg.id} onClick={() => setSelectedPackageId(pkg.id)}
                            className={cn('w-full p-4 rounded-xl text-left transition-all border',
                              selectedPackageId === pkg.id
                                ? 'bg-purple-500/20 border-purple-500/50'
                                : 'bg-white/5 border-white/10 hover:border-purple-500/30')}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-purple-400" />
                                  <span className="font-medium text-foreground">{pkg.name}</span>
                                  {pkg.popular && (
                                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">Phổ biến</span>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground ml-6">{pkg.duration} phút</span>
                              </div>
                              <span className="text-lg font-bold gradient-text">{formatPrice(pkg.price)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-6">{pkg.description}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">Reader chưa có gói dịch vụ</p>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 2: Chọn thời gian */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    {dates.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">Reader chưa mở lịch trống. Vui lòng quay lại sau hoặc nhắn tin để hẹn lịch.</p>
                      </div>
                    ) : (
                      <>
                        {/* Date header */}
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-foreground">
                            <Calendar className="w-5 h-5 inline mr-2" />Chọn ngày
                          </h2>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                          {dates.map((d) => (
                            <button key={d.value} onClick={() => { setSelectedDate(d.value); setSelectedTime('') }}
                              className={cn('flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-all border',
                                selectedDate === d.value
                                  ? 'bg-purple-500/20 border-purple-500/50'
                                  : 'bg-white/5 border-white/10 hover:border-purple-500/30')}>
                              <span className="text-xs text-muted-foreground">{d.day}</span>
                              <span className="text-xl font-bold text-foreground">{d.date}</span>
                              <span className="text-xs text-muted-foreground">Th.{d.month}</span>
                            </button>
                          ))}
                        </div>

                        <h2 className="text-xl font-semibold text-foreground mb-4 mt-6">
                          <Clock className="w-5 h-5 inline mr-2" />Chọn giờ
                        </h2>
                        {selectedDate ? (
                          slotsForSelected.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {slotsForSelected.map((time) => (
                                <button key={time} onClick={() => setSelectedTime(time)}
                                  className={cn('p-3 rounded-xl text-center transition-all border',
                                    selectedTime === time
                                      ? 'bg-purple-500/20 border-purple-500/50 text-foreground'
                                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30')}>
                                  {time}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-2">Ngày này không còn khung giờ trống.</p>
                          )
                        ) : (
                          <p className="text-sm text-muted-foreground py-2">Vui lòng chọn ngày trước.</p>
                        )}
                      </>
                    )}
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 3: Thanh toán */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      <CreditCard className="w-5 h-5 inline mr-2" />Thanh toán
                    </h2>
                    <div className="space-y-3">
                      {['Thẻ tín dụng/Ghi nợ','MoMo','VNPay','Chuyển khoản'].map((m) => (
                        <button key={m} className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-left flex items-center justify-between">
                          <span className="text-foreground">{m}</span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">Thanh toán bảo mật SSL 256-bit</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 4: Xác nhận */}
              {currentStep === 4 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <GlassCard className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Đặt lịch thành công!</h2>
                    <p className="text-muted-foreground mb-6">Bạn sẽ nhận được email xác nhận trước buổi hẹn.</p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          ['Reader', reader.name],
                          ['Gói', selectedPkg?.name ?? '—'],
                          ['Ngày', selectedDate],
                          ['Giờ', selectedTime],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <span className="text-muted-foreground">{label}:</span>
                            <div className="text-foreground font-medium">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Link href="/dashboard">
                      <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        Xem lịch hẹn của tôi
                      </Button>
                    </Link>
                  </GlassCard>
                </motion.div>
              )}

              {/* Navigation */}
              {currentStep < 4 && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                    disabled={currentStep === 1} className="border-white/10">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
                  </Button>
                  <Button onClick={currentStep === 3 ? handleConfirmPayment : () => setCurrentStep(s => Math.min(4, s + 1))}
                    disabled={!canProceed() || (currentStep === 3 && submitting)}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    {currentStep === 3 ? (submitting ? 'Đang xử lý…' : 'Xác nhận thanh toán') : 'Tiếp tục'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div>
              <GlassCard className="p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tóm tắt</h3>

                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-12 h-12 rounded-xl shrink-0"
                    style={{ backgroundImage: `url("${reader.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div>
                    <div className="font-medium text-foreground">{reader.name}</div>
                    <div className="text-sm text-muted-foreground">Tarot Reader</div>
                  </div>
                </div>

                {selectedPkg && (
                  <div className="space-y-2 mb-4 pb-4 border-b border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gói dịch vụ</span>
                      <span className="text-foreground">{selectedPkg.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Thời lượng</span>
                      <span className="text-foreground">{selectedPkg.duration} phút</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ngày</span>
                        <span className="text-foreground">{selectedDate}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Giờ</span>
                        <span className="text-foreground">{selectedTime}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tổng cộng</span>
                  <span className="text-2xl font-bold gradient-text">
                    {selectedPkg ? formatPrice(selectedPkg.price) : '---'}
                  </span>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

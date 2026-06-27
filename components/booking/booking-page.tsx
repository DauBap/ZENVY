'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Check, Calendar, Clock, CreditCard,
  Shield
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

interface BookingPageProps {
  reader: SerializedReader
}

const timeSlots = [
  '09:00', '10:00', '11:00', '13:00', '14:00',
  '15:00', '16:00', '19:00', '20:00', '21:00'
]

const steps = [
  { id: 1, label: 'Chọn gói' },
  { id: 2, label: 'Chọn thời gian' },
  { id: 3, label: 'Thanh toán' },
  { id: 4, label: 'Xác nhận' },
]

export function BookingPage({ reader }: BookingPageProps) {
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  const [currentStep, setCurrentStep] = useState(packageId ? 2 : 1)
  const [selectedPackage, setSelectedPackage] = useState(packageId || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const selectedPkg = reader.packages.find((p) => p.id === selectedPackage)

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      date: date.getDate(),
      month: date.toLocaleDateString('vi-VN', { month: 'short' }),
    }
  })

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const canProceed = () => {
    if (currentStep === 1) return !!selectedPackage
    if (currentStep === 2) return !!selectedDate && !!selectedTime
    return true
  }

  if (!reader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-2xl font-bold mb-2">Reader không tồn tại</h1>
          <Link href="/readers">
            <Button>Quay lại danh sách</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/readers/${reader.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Đặt lịch với {reader.name}</h1>
                <p className="text-muted-foreground">Chọn gói và thời gian phù hợp nhất với bạn.</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Từ</div>
                <div className="text-2xl font-semibold gradient-text">{(reader.pricePerSession / 1000).toFixed(0)}k</div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Chọn gói dịch vụ</h2>
                    <div className="space-y-3">
                      {reader.packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            'w-full p-4 rounded-xl text-left transition-all border',
                            selectedPackage === pkg.id
                              ? 'bg-purple-500/20 border-purple-500/50'
                              : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                          )}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{pkg.name}</span>
                                {pkg.popular && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">Phổ biến</span>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{pkg.duration} phút</span>
                            </div>
                            <span className="text-lg font-bold gradient-text">{(pkg.price / 1000).toFixed(0)}k</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      <Calendar className="w-5 h-5 inline mr-2" /> Chọn ngày
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                      {dates.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={cn(
                            'flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-all',
                            selectedDate === d.value
                              ? 'bg-purple-500/20 border-purple-500/50'
                              : 'bg-white/5 border-white/10 hover:border-purple-500/30'
                          )}
                        >
                          <span className="text-xs text-muted-foreground">{d.day}</span>
                          <span className="text-xl font-bold text-foreground">{d.date}</span>
                          <span className="text-xs text-muted-foreground">{d.month}</span>
                        </button>
                      ))}
                    </div>

                    <h2 className="text-xl font-semibold text-foreground mb-4 mt-6">
                      <Clock className="w-5 h-5 inline mr-2" /> Chọn giờ
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'p-3 rounded-xl text-center transition-all',
                            selectedTime === time
                              ? 'bg-purple-500/20 border-purple-500/50 text-foreground'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      <CreditCard className="w-5 h-5 inline mr-2" /> Thanh toán
                    </h2>
                    <p className="text-muted-foreground">Giả lập thanh toán an toàn. Vui lòng hoàn tất thông tin để xác nhận booking.</p>
                  </GlassCard>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <GlassCard className="p-6">
                <div className="mb-4 text-sm text-muted-foreground">Tiến trình</div>
                <div className="space-y-3">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center border',
                        currentStep >= step.id
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-muted-foreground'
                      )}>
                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                      </div>
                      <span className="text-sm text-foreground">{step.label}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 space-y-4">
                <div className="text-sm text-muted-foreground">Tóm tắt</div>
                <div className="rounded-xl bg-white/5 p-4">
                  <div className="text-sm text-foreground">Reader</div>
                  <div className="font-medium text-foreground">{reader.name}</div>
                  <div className="text-sm text-muted-foreground">{reader.bio}</div>
                </div>
                <div className="text-sm text-muted-foreground">Giá</div>
                <div className="text-lg font-semibold gradient-text">{selectedPkg ? (selectedPkg.price / 1000).toFixed(0) + 'k' : 'Chưa chọn gói'}</div>
              </GlassCard>
            </div>
          </div>

          <div className="mt-8 flex justify-between gap-3">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>Quay lại</Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === 3 ? 'Xác nhận' : 'Tiếp theo'}
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}

'use client'

import { useState } from 'react'
import { use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Check, Calendar, Clock, CreditCard,
  Shield, ChevronRight
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { readers } from '@/lib/data'
import { cn } from '@/lib/utils'

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

export default function BookingPage({ params }: { params: Promise<{ readerId: string }> }) {
  const { readerId } = use(params)
  const searchParams = useSearchParams()
  const packageId = searchParams.get('package')
  
  const reader = readers.find(r => r.id === readerId)
  const [currentStep, setCurrentStep] = useState(packageId ? 2 : 1)
  const [selectedPackage, setSelectedPackage] = useState(packageId || '')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

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

  const selectedPkg = reader.packages.find(p => p.id === selectedPackage)

  // Generate next 7 days
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
    if (currentStep === 3) return true
    return true
  }

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href={`/readers/${reader.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại
          </Link>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                        currentStep > step.id
                          ? 'bg-green-500 border-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-transparent border-white/20 text-muted-foreground'
                      )}
                    >
                      {currentStep > step.id ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.id
                      )}
                    </div>
                    <span className={cn(
                      'text-xs mt-2 hidden sm:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={cn(
                      'flex-1 h-0.5 mx-2',
                      currentStep > step.id ? 'bg-green-500' : 'bg-white/10'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Step 1: Select Package */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      Chọn gói dịch vụ
                    </h2>
                    <div className="space-y-3">
                      {reader.packages.map((pkg) => (
                        <button
                          key={pkg.id}
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={cn(
                            'w-full p-4 rounded-xl text-left transition-all',
                            'border',
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
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300">
                                    Phổ biến
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground">{pkg.duration} phút</span>
                            </div>
                            <span className="text-lg font-bold gradient-text">
                              {(pkg.price / 1000).toFixed(0)}k
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{pkg.description}</p>
                        </button>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 2: Select Time */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      <Calendar className="w-5 h-5 inline mr-2" />
                      Chọn ngày
                    </h2>
                    <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                      {dates.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={cn(
                            'flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-all',
                            'border',
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
                      <Clock className="w-5 h-5 inline mr-2" />
                      Chọn giờ
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            'p-3 rounded-xl text-center transition-all',
                            'border',
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

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">
                      <CreditCard className="w-5 h-5 inline mr-2" />
                      Thanh toán
                    </h2>
                    <div className="space-y-4">
                      {['Thẻ tín dụng/Ghi nợ', 'MoMo', 'VNPay', 'Chuyển khoản'].map((method) => (
                        <button
                          key={method}
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-left flex items-center justify-between"
                        >
                          <span className="text-foreground">{method}</span>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 text-green-400">
                        <Shield className="w-5 h-5" />
                        <span className="text-sm">Thanh toán được bảo mật bởi SSL 256-bit</span>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <GlassCard className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-10 h-10 text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Đặt lịch thành công!
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Bạn sẽ nhận được email xác nhận và nhắc nhở trước buổi hẹn.
                    </p>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-left">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Reader:</span>
                          <div className="text-foreground font-medium">{reader.name}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Gói:</span>
                          <div className="text-foreground font-medium">{selectedPkg?.name}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Ngày:</span>
                          <div className="text-foreground font-medium">{selectedDate}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Giờ:</span>
                          <div className="text-foreground font-medium">{selectedTime}</div>
                        </div>
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
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="border-white/10"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Quay lại
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                  >
                    {currentStep === 3 ? 'Xác nhận thanh toán' : 'Tiếp tục'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar - Summary */}
            <div>
              <GlassCard className="p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tóm tắt</h3>
                
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden">
                    <Image
                      src={reader.avatar}
                      alt={reader.name}
                      fill
                      className="object-cover"
                    />
                  </div>
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
                    {selectedPkg ? `${(selectedPkg.price / 1000).toFixed(0)}k` : '---'}
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

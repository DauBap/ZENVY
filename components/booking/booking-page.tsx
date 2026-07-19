'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Check, Calendar, Clock, CreditCard,
  Shield, ChevronRight, Sparkles, Ticket, X, Copy, Loader2,
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { cn, formatAmountK } from '@/lib/utils'
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
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)

  // PayOS — dữ liệu QR chuyển khoản hiển thị ngay trong trang
  const [payInfo, setPayInfo] = useState<{
    bookingId: number
    checkoutUrl: string
    qrCode: string
    accountNumber: string | null
    accountName: string | null
    bin: string | null
    amount: number
    expiresAt: number // epoch ms — mốc hết hạn giữ chỗ
  } | null>(null)
  const [paySuccess, setPaySuccess] = useState(false)
  const [remainingMs, setRemainingMs] = useState(0) // đếm ngược tới expiresAt

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponValidating, setCouponValidating] = useState(false)
  const [couponResult, setCouponResult] = useState<{
    valid: boolean
    discountAmount: number
    finalPrice: number
    coupon: { code: string; discount_type: string; discount_value: number }
  } | null>(null)
  const [couponError, setCouponError] = useState('')

  // Hiển thị popup chính sách hủy ngay khi vừa vào bước Thanh toán
  useEffect(() => {
    if (currentStep === 3) setShowPaymentConfirm(true)
  }, [currentStep])

  // Khi đã có QR → poll trạng thái thanh toán; thành công thì chuyển sang bước xác nhận
  useEffect(() => {
    if (!payInfo || paySuccess) return
    let stop = false
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/bookings/${payInfo.bookingId}/payment`, { cache: 'no-store' })
        const data = await res.json()
        if (!stop && data.status === 'PAYMENT_CONFIRMED') {
          setPaySuccess(true)
          setPayInfo(null)
          setCurrentStep(4)
        }
      } catch {
        // bỏ qua, thử lại ở nhịp sau
      }
    }, 3000)
    return () => { stop = true; clearInterval(interval) }
  }, [payInfo, paySuccess])

  // Đếm ngược tới hạn giữ chỗ; hết giờ thì đóng popup (QR đã hết hạn)
  useEffect(() => {
    if (!payInfo) return
    const tick = () => {
      const left = payInfo.expiresAt - Date.now()
      if (left <= 0) {
        setRemainingMs(0)
        setPayInfo(null)
        toast.error('Mã QR đã hết hạn. Vui lòng tạo lại.')
      } else {
        setRemainingMs(left)
      }
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [payInfo])

  // Luôn tìm đúng package từ DB data
  const selectedPkg = reader.packages?.find((p) => p.id === selectedPackageId) ?? null

  // Reset coupon khi đổi gói
  const handleSelectPackage = (pkgId: number) => {
    setSelectedPackageId(pkgId)
    setCouponCode('')
    setCouponInput('')
    setCouponResult(null)
    setCouponError('')
  }

  async function handleValidateCoupon() {
    if (!couponInput.trim()) return
    if (!selectedPkg) { setCouponError('Vui lòng chọn gói dịch vụ trước.'); return }
    setCouponValidating(true)
    setCouponError('')
    setCouponResult(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), originalPrice: selectedPkg.price }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error ?? 'Mã không hợp lệ.')
      } else {
        setCouponResult(data)
        setCouponCode(couponInput.trim().toUpperCase())
      }
    } catch {
      setCouponError('Không thể kiểm tra mã. Vui lòng thử lại.')
    } finally {
      setCouponValidating(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setCouponInput('')
    setCouponResult(null)
    setCouponError('')
  }

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`Đã sao chép ${label}`)
    } catch {
      toast.error('Không sao chép được. Vui lòng copy thủ công.')
    }
  }

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

  function isSlotPast(dateStr: string, slot: string) {
    const nowUtc = Date.now()
    const [y, m, d] = dateStr.split('-').map(Number)
    const [hh, mm] = slot.split(':').map(Number)
    const slotUtcMs = Date.UTC(y, m - 1, d, hh, mm) - ICT_OFFSET_MS
    return slotUtcMs <= nowUtc
  }

  // Hide past slots when the selected date is today (VN time)
  const visibleSlotsForSelected = slotsForSelected.filter((s) => !(selectedDate === todayVN && isSlotPast(selectedDate, s)))

  // If the currently selected time becomes past (e.g., time passed while on page), clear it
  useEffect(() => {
    if (selectedDate && selectedTime && isSlotPast(selectedDate, selectedTime)) {
      setSelectedTime('')
    }
  }, [selectedDate, selectedTime])

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
          ...(couponCode && { couponCode }),
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

      // Tạo liên kết thanh toán PayOS rồi chuyển hướng sang cổng thanh toán
      const bookingId = data.booking?.id
      if (!bookingId) {
        toast.error('Không lấy được mã lịch hẹn.')
        return
      }

      const payRes = await fetch(`/api/bookings/${bookingId}/payment`, { method: 'POST' })
      const payData = await payRes.json()

      // Gói miễn phí → server đã xác nhận luôn, bỏ qua bước QR
      if (payRes.ok && payData.free) {
        setPaySuccess(true)
        setCurrentStep(4)
        return
      }

      if (!payRes.ok || !payData.qrCode) {
        toast.error(payData.error || 'Không tạo được liên kết thanh toán.')
        // Booking đã được tạo (PENDING) — hiển thị bước xác nhận để user thử lại từ dashboard
        setCurrentStep(4)
        return
      }

      // Hiển thị QR + thông tin chuyển khoản ngay trong trang (không rời app)
      setPayInfo({
        bookingId,
        checkoutUrl: payData.checkoutUrl,
        qrCode: payData.qrCode,
        accountNumber: payData.accountNumber ?? null,
        accountName: payData.accountName ?? null,
        bin: payData.bin ?? null,
        amount: payData.amount ?? (couponResult?.finalPrice ?? selectedPkg?.price ?? 0),
        expiresAt: payData.expiresAt ?? (Date.now() + 15 * 60 * 1000),
      })
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatPrice = (p: number) => formatAmountK(p)

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 pb-24">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8">

          <Link href={`/readers/${reader.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6">
            <ChevronLeft className="w-4 h-4 mr-1" /> Quay lại
          </Link>

          {/* Steps — thu nhỏ trên mobile */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all text-sm',
                      currentStep > step.id ? 'bg-green-500 border-green-500 text-white'
                        : currentStep === step.id ? 'bg-[#768064] border-[#768064] text-white'
                        : 'bg-transparent border-white/20 text-muted-foreground'
                    )}>
                      {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={cn('text-[10px] sm:text-xs mt-1.5 hidden sm:block',
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground')}>
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn('flex-1 h-0.5 mx-1 sm:mx-2', currentStep > step.id ? 'bg-green-500' : 'bg-white/10')} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grid — sidebar xuống dưới trên mobile */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="lg:col-span-2">

              {/* Step 1: Chọn gói */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <GlassCard className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Chọn gói dịch vụ</h2>
                    {reader.packages && reader.packages.length > 0 ? (
                      <div className="space-y-3">
                        {reader.packages.map((pkg) => (
                          <button key={pkg.id} onClick={() => handleSelectPackage(pkg.id)}
                            className={cn('w-full p-4 rounded-xl text-left transition-all border',
                              selectedPackageId === pkg.id
                                ? 'bg-[#768064]/20 border-[#768064]/50'
                                : 'bg-white/5 border-white/10 hover:border-[#768064]/30')}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Sparkles className="w-4 h-4 text-[#768064]" />
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
                        <Calendar className="w-12 h-12 text-[#768064]/30 mx-auto mb-4" />
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
                                  ? 'bg-[#768064]/20 border-[#768064]/50'
                                  : 'bg-white/5 border-white/10 hover:border-[#768064]/30')}>
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
                          visibleSlotsForSelected.length > 0 ? (
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                              {visibleSlotsForSelected.map((time) => (
                                <button key={time} onClick={() => setSelectedTime(time)}
                                  className={cn('p-3 rounded-xl text-center transition-all border',
                                    selectedTime === time
                                      ? 'bg-[#768064]/20 border-[#768064]/50 text-foreground'
                                      : 'bg-white/5 border-white/10 text-muted-foreground hover:border-[#768064]/30')}>
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
                      <CreditCard className="w-5 h-5 inline mr-2" /> Cách thanh toán
                    </h2>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-sm text-foreground">
                        Bước 1: Kiểm tra lại thông tin phía bên phải
                      </p>
                      <p className="text-sm text-foreground">
                        Bước 2: Nhập mã khuyến mãi (nếu có) và nhấn "Áp dụng"
                      </p>
                      <p className="text-sm text-foreground">
                        Bước 3: Bấm "Xác nhận thanh toán" để hiển thị mã QR thanh toán
                      </p>
                    </div>

                    {/* Mã khuyến mãi */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <Ticket className="w-4 h-4 inline mr-1.5 text-[#768064]" />
                        Mã khuyến mãi
                      </label>
                      {couponResult ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                          <div>
                            <span className="font-mono font-bold text-green-400">{couponResult.coupon.code}</span>
                            <span className="ml-2 text-sm text-green-400">
                              — Giảm {couponResult.coupon.discount_type === 'PERCENTAGE'
                                ? `${couponResult.coupon.discount_value}%`
                                : formatAmountK(couponResult.coupon.discount_value)}
                            </span>
                          </div>
                          <button onClick={handleRemoveCoupon} className="p-1 text-green-400 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                            onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                            placeholder="Nhập mã khuyến mãi"
                            className="flex-1 h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#768064]/50 focus:outline-none font-mono uppercase"
                          />
                          <button
                            onClick={handleValidateCoupon}
                            disabled={couponValidating || !couponInput.trim()}
                            className="px-4 h-10 rounded-lg bg-[#768064]/20 border border-[#768064]/30 text-sm text-[#4C583E] font-medium hover:bg-[#768064]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {couponValidating ? '…' : 'Áp dụng'}
                          </button>
                        </div>
                      )}
                      {couponError && (
                        <p className="mt-1.5 text-xs text-red-400">{couponError}</p>
                      )}
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
                      <Button className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
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
                  <Button onClick={currentStep === 3
                      ? () => { if (!user) { openLogin() } else { handleConfirmPayment() } }
                      : () => setCurrentStep(s => Math.min(4, s + 1))}
                    disabled={!canProceed() || (currentStep === 3 && submitting)}
                    className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
                    {currentStep === 3 ? (submitting ? 'Đang xử lý…' : 'Xác nhận thanh toán') : 'Tiếp tục'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sidebar summary — hiển thị dưới main content trên mobile */}
            <div className="lg:order-last">
              <GlassCard className="p-4 sm:p-6 lg:sticky lg:top-24">
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
                {couponResult && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-green-400">−{formatPrice(couponResult.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-foreground">Thanh toán</span>
                      <span className="text-2xl font-bold text-green-400">{formatPrice(couponResult.finalPrice)}</span>
                    </div>
                  </div>
                )}
              </GlassCard>
            </div>
          </div>
        </div>
      </main>

      {/* Popup QR thanh toán PayOS */}
      <Dialog open={!!payInfo} onOpenChange={(open) => { if (!open) setPayInfo(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> Quét mã để thanh toán
            </DialogTitle>
            <DialogDescription>
              Mở app ngân hàng, quét mã VietQR bên dưới. Cửa sổ này sẽ tự cập nhật khi nhận được thanh toán.
            </DialogDescription>
          </DialogHeader>

          {payInfo && (
            <div className="space-y-5">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-2xl">
                  <QRCodeSVG value={payInfo.qrCode} size={200} level="M" />
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#768064]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Đang chờ thanh toán…</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>Mã QR hết hạn sau</span>
                  <span className="font-mono font-semibold tabular-nums text-foreground">
                    {String(Math.floor(remainingMs / 60000)).padStart(2, '0')}
                    :
                    {String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Thông tin chuyển khoản thủ công */}
              <div className="space-y-2">
                {[
                  ['Số tiền', formatPrice(payInfo.amount), String(payInfo.amount)],
                  payInfo.accountNumber ? ['Số tài khoản', payInfo.accountNumber, payInfo.accountNumber] : null,
                  payInfo.accountName ? ['Chủ tài khoản', payInfo.accountName, payInfo.accountName] : null,
                ].filter(Boolean).map((row) => {
                  const [label, display, copyVal] = row as [string, string, string]
                  return (
                    <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-foreground font-medium truncate">{display}</div>
                      </div>
                      <button onClick={() => copyText(copyVal, label.toLowerCase())}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col items-center gap-3">
                <a href={payInfo.checkoutUrl} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-[#768064] hover:text-[#4C583E] transition-colors">
                  Gặp sự cố? Mở trang thanh toán PayOS →
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Xác nhận trước khi thanh toán — nêu rõ chính sách hủy lịch */}
      <AlertDialog open={showPaymentConfirm} onOpenChange={setShowPaymentConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đặt lịch</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-left">
              <span className="block">
                Trước khi xác nhận, bạn vui lòng lưu ý chính sách hủy lịch của SAGETO nhé:
              </span>
              <span className="block">
                💜 Hủy <strong>trước 12 giờ</strong> so với giờ hẹn: hoàn tiền, chỉ giữ lại <strong>10%</strong> phí dịch vụ.
              </span>
              <span className="block">
                ⏳ Hủy <strong>trong vòng 12 giờ</strong> trước giờ hẹn: không hủy được và cũng sẽ không được hoàn tiền, vì Reader đã sắp xếp thời gian cho bạn.
              </span>
              <span className="block text-muted-foreground">
                Bạn đã sẵn sàng cho buổi xem bài chứ? ✨
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Để mình xem lại</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => setShowPaymentConfirm(false)}
              className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
              Đồng ý &amp; tiếp tục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

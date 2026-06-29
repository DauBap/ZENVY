'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star as StarIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  Calendar, Clock, Heart, Bell, History, CreditCard,
  Sparkles, MessageSquare, Settings, LogOut, Moon, Star,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ReaderPackagesTab, type PackageItem } from '@/components/profile/reader-packages-tab'
import { ReaderAvailabilityTab, type AvailabilityItem } from '@/components/profile/reader-availability-tab'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'
import type { SerializedReader } from '@/lib/serializers'

interface DashboardPageProps {
  readers: SerializedReader[]
  bookings: any[]
  userName: string
  viewerRole?: string
  readerPackages?: PackageItem[]
  readerAvailability?: AvailabilityItem[]
}

const tabs = [
  { id: 'bookings', label: 'Lịch hẹn', icon: Calendar },
  { id: 'history', label: 'Lịch sử', icon: History },
  { id: 'favorites', label: 'Yêu thích', icon: Heart },
  { id: 'ai-history', label: 'AI Tarot', icon: Sparkles },
  { id: 'payments', label: 'Thanh toán', icon: CreditCard },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  PENDING:           { label: 'Chờ xác nhận TT', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  PAYMENT_CONFIRMED: { label: 'Đã nhận tiền',    className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  CONFIRMED:         { label: 'Reader xác nhận',  className: 'bg-blue-500/20   text-blue-400   border-blue-500/30'   },
  COMPLETED:         { label: 'Hoàn thành',       className: 'bg-green-500/20  text-green-400  border-green-500/30'  },
  CANCELLED:         { label: 'Đã hủy',           className: 'bg-red-500/20    text-red-400    border-red-500/30'    },
}

// Tab riêng cho reader (quản lý dịch vụ + lịch trống)
const readerTabs = [
  { id: 'services', label: 'Dịch vụ', icon: Sparkles },
  { id: 'availability', label: 'Lịch trống', icon: Calendar },
]

// ─── FavoritesTab ─────────────────────────────────────────────────────────────
function FavoritesTab() {
  const [readers, setReaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/readers/favorites')
      .then(r => r.json())
      .then(d => setReaders(d.readers ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <GlassCard className="p-6">
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    </GlassCard>
  )

  return (
    <GlassCard className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Reader yêu thích</h2>
      {readers.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {readers.map((r) => (
            <Link key={r.id} href={`/readers/${r.id}`}>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer">
                <div className="w-12 h-12 rounded-xl shrink-0"
                  style={{ backgroundImage: `url("${r.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground text-sm truncate">{r.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">{Number(r.rating).toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Chưa có reader yêu thích</p>
          <Link href="/readers"><Button variant="outline">Khám phá Readers</Button></Link>
        </div>
      )}
    </GlassCard>
  )
}

export function DashboardPage({ readers, bookings, userName, viewerRole = 'CUSTOMER', readerPackages = [], readerAvailability = [] }: DashboardPageProps) {
  const [activeTab, setActiveTab] = useState('bookings')
  const { logout } = useAuthModal()
  const router = useRouter()

  const isReader = viewerRole === 'READER'
  const partnerLabel = isReader ? 'Khách hàng' : 'Reader'
  // Reader thấy thêm tab Dịch vụ + Lịch trống
  const navTabs = isReader ? [...tabs, ...readerTabs] : tabs

  // Trạng thái cho các thao tác hủy / xác nhận
  const [busyId, setBusyId] = useState<number | null>(null)
  const [cancelTarget, setCancelTarget] = useState<any | null>(null)
  const [readerCancelTarget, setReaderCancelTarget] = useState<any | null>(null)
  const [reason, setReason] = useState('')

  // Review state
  const [reviewTarget, setReviewTarget] = useState<any | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set())

  async function submitReview() {
    if (!reviewTarget) return
    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/bookings/${reviewTarget.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Gửi đánh giá thất bại.'); return }
      toast.success('Cảm ơn đánh giá của bạn! 🌙')
      setReviewedIds(prev => new Set([...prev, reviewTarget.id]))
      setReviewTarget(null)
      setReviewComment('')
      setReviewRating(5)
    } catch { toast.error('Lỗi kết nối.') }
    finally { setSubmittingReview(false) }
  }

  const HOURS_24_MS = 24 * 60 * 60 * 1000
  const ICT_OFFSET_MS = 7 * 60 * 60 * 1000

  // b.date là chuỗi "YYYY-MM-DD" đã serialize ở page.tsx
  function apptInstant(b: any): number {
    const [y, m, d] = String(b.date).split('-').map(Number)
    const [hh, mm] = String(b.time || '0:0').split(':').map(Number)
    return Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0) - ICT_OFFSET_MS
  }
  function customerCanCancel(b: any): boolean {
    if (b.status === 'PENDING') return true
    if (b.status === 'CONFIRMED') return apptInstant(b) - Date.now() > HOURS_24_MS
    return false
  }

  async function runAction(bookingId: number, action: 'confirm' | 'cancel' | 'complete', reasonText?: string) {
    setBusyId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason: reasonText }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Thao tác thất bại.')
        return false
      }
      const msg = action === 'confirm' ? 'Đã xác nhận lịch hẹn.'
        : action === 'complete' ? 'Đã hoàn thành session.'
        : 'Đã hủy lịch hẹn.'
      toast.success(msg)
      router.refresh()
      return true
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
      return false
    } finally {
      setBusyId(null)
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter((b) => b.date >= today && b.status !== 'CANCELLED')
  const sessionHistory   = bookings.filter((b) => b.date <  today || b.status === 'COMPLETED' || b.status === 'CANCELLED')

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Xin chào, <span className="gradient-text">{userName}</span> 👋
              </h1>
              <p className="text-muted-foreground">Quản lý lịch hẹn và hoạt động của bạn</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="relative border-white/10">
                <Bell className="w-5 h-5" />
                {upcomingBookings.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                    {upcomingBookings.length}
                  </span>
                )}
              </Button>
              <Link href="/profile">
                <Button variant="outline" size="icon" className="border-white/10">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* Sidebar */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
              <GlassCard className="p-4">
                <nav className="space-y-1">
                  {navTabs.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={cn('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                        activeTab === tab.id ? 'bg-purple-500/20 text-purple-300' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground')}>
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Đăng xuất</span>  
                  </button>
                </div>
              </GlassCard>
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-3 space-y-6">

              {/* Tab: Lich hen */}
              {activeTab === 'bookings' && (
                <GlassCard className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-foreground">
                      {isReader ? 'Lịch khách đặt sắp tới' : 'Lịch hẹn sắp tới'}
                    </h2>
                    {!isReader && (
                      <Link href="/readers">
                        <Button variant="outline" size="sm" className="border-white/10">Đặt lịch mới</Button>
                      </Link>
                    )}
                  </div>

                  {upcomingBookings.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingBookings.map((b) => {
                        const status = STATUS_MAP[b.status] ?? STATUS_MAP.PENDING
                        const partnerName = b.counterparty?.name ?? partnerLabel
                        const partnerAvatar = b.counterparty?.avatar ?? '/placeholder-user.jpg'
                        const pkgLabel = b.package ? `${b.package.name} - ${b.package.duration} phút` : ''
                        return (
                          <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl shrink-0"
                                style={{ backgroundImage: `url("${partnerAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div>
                                <div className="font-medium text-foreground">{partnerName}</div>
                                <div className="text-sm text-muted-foreground">{pkgLabel}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Calendar className="w-4 h-4 text-purple-400" />
                                  <span className="text-sm text-foreground">{b.date}</span>
                                  <Clock className="w-4 h-4 text-purple-400 ml-2" />
                                  <span className="text-sm text-foreground">{b.time}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn('px-3 py-1 text-xs rounded-full border', status.className)}>
                                {status.label}
                              </span>
                              <Link href={`/chat?${isReader ? 'customer' : 'reader'}=${b.counterparty?.id}&booking=${b.id}`}>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                                  <MessageSquare className="w-4 h-4 mr-1" /> Chat
                                </Button>
                              </Link>
                              {isReader && b.status === 'PENDING' && (
                                <span className="text-xs text-yellow-400 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                                  Chờ admin duyệt TT
                                </span>
                              )}
                              {isReader && b.status === 'PAYMENT_CONFIRMED' && (
                                <Button size="sm" disabled={busyId === b.id}
                                  onClick={() => runAction(b.id, 'confirm')}
                                  className="bg-green-600 hover:bg-green-500 text-white">
                                  {busyId === b.id ? 'Đang xử lý…' : 'Xác nhận'}
                                </Button>
                              )}
                              {isReader && b.status === 'CONFIRMED' && (
                                <Button size="sm" disabled={busyId === b.id}
                                  onClick={() => runAction(b.id, 'complete')}
                                  className="bg-blue-600 hover:bg-blue-500 text-white">
                                  {busyId === b.id ? 'Đang xử lý…' : 'Hoàn thành'}
                                </Button>
                              )}
                              {isReader && (b.status === 'PAYMENT_CONFIRMED' || b.status === 'CONFIRMED') && (
                                <Button size="sm" variant="destructive" disabled={busyId === b.id}
                                  onClick={() => { setReason(''); setReaderCancelTarget(b) }}>
                                  Hủy lịch
                                </Button>
                              )}
                              {!isReader && customerCanCancel(b) && (
                                <Button size="sm" variant="outline" disabled={busyId === b.id}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                  onClick={() => setCancelTarget(b)}>
                                  Hủy lịch
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Moon className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">
                        {isReader ? 'Chưa có khách đặt lịch' : 'Bạn chưa có lịch hẹn nào'}
                      </p>
                      {!isReader && (
                        <Link href="/readers"><Button>Đặt lịch ngay</Button></Link>
                      )}
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Tab: Lich su */}
              {activeTab === 'history' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lịch sử session</h2>
                  {sessionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {sessionHistory.map((b) => {
                        const status = STATUS_MAP[b.status] ?? STATUS_MAP.PENDING
                        const partnerName = b.counterparty?.name ?? partnerLabel
                        const partnerAvatar = b.counterparty?.avatar ?? '/placeholder-user.jpg'
                        const pkgLabel = b.package ? `${b.package.name} - ${b.package.duration} phút` : ''
                        return (
                          <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl shrink-0"
                                style={{ backgroundImage: `url("${partnerAvatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                              <div>
                                <div className="font-medium text-foreground">{partnerName}</div>
                                <div className="text-sm text-muted-foreground">{pkgLabel}</div>
                                {b.status === 'CANCELLED' && b.cancel_reason && (
                                  <div className="mt-1 text-sm text-red-400/90">Lý do hủy: {b.cancel_reason}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className={cn('px-3 py-1 text-xs rounded-full border', status.className)}>
                                {status.label}
                              </span>
                              <div className="text-sm text-muted-foreground">{b.date}</div>
                              {!isReader && b.status === 'COMPLETED' && !reviewedIds.has(b.id) && (
                                <button
                                  onClick={() => { setReviewTarget(b); setReviewRating(5); setReviewComment('') }}
                                  className="flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors mt-1"
                                >
                                  <StarIcon className="w-3.5 h-3.5 fill-yellow-400" /> Đánh giá
                                </button>
                              )}
                              {!isReader && reviewedIds.has(b.id) && (
                                <span className="text-xs text-green-400 mt-1">Đã đánh giá ✓</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có lịch sử session</p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Tab: yêu thích */}
              {activeTab === 'favorites' && (
                <FavoritesTab />
              )}

              {/* Tab: AI Tarot */}
              {activeTab === 'ai-history' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lịch sử AI Tarot</h2>
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Chưa có lịch sử AI Tarot</p>
                    <Link href="/ai-tarot"><Button>Thử AI Tarot ngay</Button></Link>
                  </div>
                </GlassCard>
              )}

              {/* Tab: Thanh toan */}
              {activeTab === 'payments' && (
                <GlassCard className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">Lịch sử thanh toán</h2>
                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((b) => {
                        const partnerName = b.counterparty?.name ?? partnerLabel
                        const price = b.package?.price ?? 0
                        return (
                          <div key={b.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div>
                              <div className="font-medium text-foreground">{partnerName}</div>
                              <div className="text-xs text-muted-foreground">{b.date} {b.time}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold gradient-text">{(price / 1000).toFixed(0)}k</div>
                              <div className={cn('text-xs', STATUS_MAP[b.status]?.className ?? '')}>
                                {STATUS_MAP[b.status]?.label ?? b.status}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-purple-400/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">Chưa có giao dịch nào </p>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Tab: Dịch vụ (reader) */}
              {isReader && activeTab === 'services' && (
                <ReaderPackagesTab initial={readerPackages} />
              )}

              {/* Tab: Lịch trống (reader) */}
              {isReader && activeTab === 'availability' && (
                <ReaderAvailabilityTab initial={readerAvailability} />
              )}

            </motion.div>
          </div>
        </div>
      </main>
      <MobileNav />

      {/* Khách hàng xác nhận hủy lịch */}
      <AlertDialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy lịch hẹn?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn hủy lịch hẹn này? Hành động không thể hoàn tác.
              Sau khi hủy lịch thành công, hãy liên hệ với admin để nhận lại tiền nhé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              const t = cancelTarget
              setCancelTarget(null)
              if (t) await runAction(t.id, 'cancel')
            }}>
              Xác nhận hủy
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reader hủy lịch kèm lý do */}
      <Dialog open={!!readerCancelTarget} onOpenChange={(o) => !o && setReaderCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hủy lịch hẹn</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do hủy để khách hàng được biết.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lý do hủy lịch…"
            rows={4}
            maxLength={500}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReaderCancelTarget(null)}>Đóng</Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || busyId === readerCancelTarget?.id}
              onClick={async () => {
                const t = readerCancelTarget
                if (!t || !reason.trim()) return
                const ok = await runAction(t.id, 'cancel', reason.trim())
                if (ok) setReaderCancelTarget(null)
              }}>
              {busyId === readerCancelTarget?.id ? 'Đang xử lý…' : 'Xác nhận hủy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal đánh giá session */}
      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Đánh giá phiên hẹn 🌙</DialogTitle>
            <DialogDescription>
              {reviewTarget && `Phiên với ${reviewTarget.counterparty?.name ?? 'Reader'} — ${reviewTarget.date}`}
            </DialogDescription>
          </DialogHeader>

          {/* Star picker */}
          <div className="flex justify-center gap-2 py-2">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setReviewHover(s)}
                onMouseLeave={() => setReviewHover(0)}
                onClick={() => setReviewRating(s)}
                className="transition-transform hover:scale-110"
              >
                <StarIcon className={cn(
                  'w-8 h-8 transition-colors',
                  s <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-white/20'
                )} />
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground -mt-1">
            {['', 'Tệ', 'Không tốt', 'Bình thường', 'Tốt', 'Xuất sắc'][reviewHover || reviewRating]}
          </p>

          <Textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn (tuỳ chọn)…"
            rows={3}
            maxLength={1000}
            className="bg-white/5 border-white/10 focus:border-purple-500/50 resize-none"
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewTarget(null)}>Bỏ qua</Button>
            <Button
              disabled={submittingReview}
              onClick={submitReview}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
            >
              {submittingReview ? 'Đang gửi…' : 'Gửi đánh giá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

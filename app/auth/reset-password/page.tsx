'use client'

import { Suspense } from 'react'
import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Tách component riêng để wrap Suspense
function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const strength = !password ? { level: 0, label: '', color: '' }
    : password.length < 6 ? { level: 1, label: 'Yếu', color: 'bg-red-500' }
    : password.length < 10 ? { level: 2, label: 'Trung bình', color: 'bg-yellow-500' }
    : { level: 3, label: 'Mạnh', color: 'bg-green-500' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Mật khẩu xác nhận không khớp.'); return }
    if (password.length < 6) { setError('Mật khẩu tối thiểu 6 ký tự.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Đặt lại thất bại.'); return }
      setDone(true)
      setTimeout(() => router.push('/readers'), 3000)
    } catch { setError('Lỗi kết nối.') }
    finally { setLoading(false) }
  }

  if (!token) return (
    <div className="text-center py-16">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <p className="text-muted-foreground mb-4">Link không hợp lệ hoặc đã hết hạn.</p>
      <Link href="/readers" className="text-[#768064] hover:text-[#4C583E]">Về trang chủ</Link>
    </div>
  )

  if (done) return (
    <div className="text-center py-8">
      <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-foreground mb-2">Đổi mật khẩu thành công!</h2>
      <p className="text-muted-foreground text-sm">Đang chuyển về trang đăng nhập...</p>
    </div>
  )

  return (
    <>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">Đặt lại mật khẩu</h1>
        <p className="text-muted-foreground text-sm">Nhập mật khẩu mới của bạn</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <XCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Mật khẩu mới <span className="text-red-400">*</span></label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
            <button type="button" onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-0.5">
              <div className="flex gap-1">
                {[1,2,3].map(l => <div key={l} className={cn('h-1 flex-1 rounded-full transition-colors', strength.level >= l ? strength.color : 'bg-white/10')} />)}
              </div>
              <p className="text-xs text-muted-foreground">Độ mạnh: {strength.label}</p>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu <span className="text-red-400">*</span></label>
          <div className="relative">
            <Lock className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
              confirm && confirm !== password ? 'text-red-400' : confirm && confirm === password ? 'text-green-400' : 'text-muted-foreground')} />
            <Input type="password" placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={cn('pl-10 bg-white/5 border-white/10 focus:border-[#768064]/50 transition-colors',
                confirm && confirm !== password && 'border-red-500/50',
                confirm && confirm === password && 'border-green-500/40')} required />
          </div>
          {confirm && confirm === password && (
            <p className="text-xs text-green-400">Mật khẩu khớp ✓</p>
          )}
        </div>

        <Button type="submit" disabled={loading || !password || !confirm}
          className="w-full h-11 bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white">
          {loading
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </>
  )
}

export default function ResetPasswordPage() {
  return (
    <>
      <CosmicBackground />
      <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link href="/readers" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center">
              <span className="text-3xl">☽</span>
            </div>
            <span className="text-2xl font-bold gradient-text">SAGETO</span>
          </Link>

          <GlassCard className="p-8" glow="olive">
            <Suspense fallback={
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#768064]/30 border-t-[#A5B38B] rounded-full animate-spin" />
              </div>
            }>
              <ResetPasswordForm />
            </Suspense>
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}

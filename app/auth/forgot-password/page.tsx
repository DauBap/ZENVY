'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Vui lòng nhập email.'); return }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Đã xảy ra lỗi. Vui lòng thử lại.')
        return
      }
      setSent(true)
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CosmicBackground />
      <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/readers" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center">
              <span className="text-3xl">☽</span>
            </div>
            <span className="text-2xl font-bold gradient-text">SAGETO</span>
          </Link>

          <GlassCard className="p-8" glow="olive">
            {sent ? (
              /* Success state */
              <div className="text-center py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                </motion.div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Kiểm tra email của bạn
                </h2>
                <p className="text-muted-foreground text-sm mb-2">
                  Nếu tài khoản với email <span className="text-foreground font-medium">{email}</span> tồn tại, 
                  chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.
                </p>
                <p className="text-muted-foreground text-xs mb-6">
                  Vui lòng kiểm tra hộp thư đến (và cả thư mục spam).
                </p>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => { setSent(false); setEmail('') }}
                    className="w-full border-white/10 hover:bg-white/5"
                  >
                    Gửi lại email
                  </Button>
                  <Link href="/auth/login" className="block">
                    <Button
                      variant="ghost"
                      className="w-full text-[#768064] hover:text-[#4C583E] hover:bg-[#768064]/10"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              /* Form state */
              <>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-full bg-[#768064]/10 border border-[#768064]/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-7 h-7 text-[#768064]" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-1">Quên mật khẩu?</h1>
                  <p className="text-muted-foreground text-sm">
                    Nhập email đã đăng ký, chúng tôi sẽ gửi liên kết đặt lại mật khẩu cho bạn.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      <XCircle className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 focus:border-[#768064]/50"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className={cn(
                      'w-full h-11',
                      'bg-gradient-to-r from-[#4C583E] to-[#2C3424]',
                      'hover:from-[#768064] hover:to-[#4C583E]',
                      'text-white shadow-lg shadow-[#768064]/20'
                    )}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Gửi liên kết đặt lại'
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-sm text-[#768064] hover:text-[#4C583E] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại đăng nhập
                  </Link>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}
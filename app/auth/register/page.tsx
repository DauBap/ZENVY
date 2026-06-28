'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check, ShieldCheck, Sparkles, X, LogIn } from 'lucide-react'
import { CosmicBackground, FloatingElements } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ─── Email validation ───────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
function isValidEmail(v: string) { return EMAIL_REGEX.test(v.trim()) }

// ─── Login Modal ─────────────────────────────────────────────────────────────
function LoginModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const passwordRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const t = setTimeout(() => passwordRef.current?.focus(), 300)
    return () => clearTimeout(t)
  }, [])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return
    setIsLoading(true); setError('')
    setTimeout(() => { window.location.href = '/dashboard' }, 1500)
  }
  const sparkles: React.CSSProperties[] = [
    { top: '10%', left: '8%' }, { top: '6%', right: '10%' },
    { bottom: '16%', left: '6%' }, { bottom: '12%', right: '8%' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative z-10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-2xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          {sparkles.map((s, i) => (
            <motion.span key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0.5], scale: 1 }}
              transition={{ delay: [0.25, 0.4, 0.5, 0.35][i], duration: 0.5 }}
              className="absolute text-purple-300/50 text-lg pointer-events-none select-none" style={s}>✦</motion.span>
          ))}
          <motion.div initial={{ scale: 0, rotate: 20 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
            className="mx-auto mb-5 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <LogIn className="w-8 h-8 text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-xl font-bold text-foreground text-center mb-1">Đăng nhập ngay</h2>
            <p className="text-muted-foreground text-sm text-center mb-6">Tài khoản đã sẵn sàng! Nhập mật khẩu để bắt đầu.</p>
          </motion.div>
          <motion.form onSubmit={handleSubmit} noValidate
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                <div className="flex items-center pl-10 pr-10 h-10 rounded-md text-sm bg-purple-500/10 border border-purple-500/30 text-foreground/80 cursor-default overflow-hidden">
                  <span className="truncate">{email}</span>
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2"><Check className="w-4 h-4 text-green-400" /></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input ref={passwordRef} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="h-4 flex items-center">
                <AnimatePresence mode="wait">
                  {error && (<motion.p key="lerr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }} className="text-xs text-red-400 flex items-center gap-1">
                    <X className="w-3 h-3 shrink-0" />{error}</motion.p>)}
                </AnimatePresence>
              </div>
            </div>
            <Button type="submit" disabled={isLoading || !password}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Sparkles className="w-4 h-4 mr-2" />Bắt đầu khám phá</>}
            </Button>
            <div className="text-center pt-1">
              <Link href="/auth/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">Quên mật khẩu?</Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  )
}



// ─── Success Modal ──────────────────────────────────────────────────────────
function SuccessModal({ name, onClose, onLoginClick }: { name: string; onClose: () => void; onLoginClick: () => void }) {
  const positions: React.CSSProperties[] = [
    { top: '12%', left: '10%' }, { top: '8%', right: '12%' },
    { bottom: '18%', left: '8%' }, { bottom: '14%', right: '10%' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className="relative z-10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden rounded-2xl p-8 text-center bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
          {positions.map((s, i) => (
            <motion.span key={i} initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0.6], scale: 1 }}
              transition={{ delay: [0.3, 0.45, 0.55, 0.4][i], duration: 0.6 }}
              className="absolute text-purple-300/60 text-xl pointer-events-none select-none" style={s}>✦</motion.span>
          ))}
          <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/40">
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold text-foreground mb-2">Chào mừng, {name}! 🌙</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Tài khoản của bạn đã được tạo thành công.<br />Hành trình khám phá bản thân bắt đầu từ đây!
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 space-y-2 text-left">
            {['AI Tarot không giới hạn đã được kích hoạt', 'Ưu đãi 20% session đầu tiên của bạn', 'Bạn đã gia nhập cộng đồng Mystic'].map((b, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-green-400" />
                </div>{b}
              </div>
            ))}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Button onClick={onLoginClick}
              className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              <Sparkles className="w-4 h-4 mr-2" />Khám phá ngay
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [serverError, setServerError] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  // Derived validation
  const emailError =
    emailTouched && email.length === 0 ? 'Vui lòng nhập email' :
    emailTouched && !isValidEmail(email) ? 'Email không hợp lệ' : ''

  const passwordsMatch = confirmPassword === password
  const confirmError =
    confirmTouched && confirmPassword.length === 0 ? 'Vui lòng xác nhận mật khẩu' :
    confirmTouched && !passwordsMatch ? 'Mật khẩu xác nhận không khớp' : ''

  const isFormValid =
    name.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    passwordsMatch &&
    confirmPassword.length > 0 &&
    agreed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true)
    setConfirmTouched(true)
    if (!isFormValid) return
    setIsLoading(true)
    setServerError('')
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) {
        setServerError(data.error || 'Đăng ký thất bại. Vui lòng thử lại.')
        setIsLoading(false)
        return
      }
      setShowSuccess(true)
      setIsLoading(false)
    } catch {
      setServerError('Đã xảy ra lỗi. Vui lòng thử lại.')
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: '' }
    if (password.length < 6) return { level: 1, label: 'Yếu', color: 'bg-red-500' }
    if (password.length < 10) return { level: 2, label: 'Trung bình', color: 'bg-yellow-500' }
    return { level: 3, label: 'Mạnh', color: 'bg-green-500' }
  }

  const strength = passwordStrength()

  return (
    <>
      <CosmicBackground />
      <FloatingElements />
      {showSuccess && !showLogin && (
        <SuccessModal
          name={name.split(' ')[0] || name}
          onClose={() => setShowSuccess(false)}
          onLoginClick={() => { setShowSuccess(false); setShowLogin(true) }}
        />
      )}
      {showLogin && (
        <LoginModal email={email} onClose={() => setShowLogin(false)} />
      )}
      <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-3xl">☽</span>
            </div>
            <span className="text-2xl font-bold gradient-text">ZENVY</span>
          </Link>

          <GlassCard className="p-8" glow="purple">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Tạo tài khoản mới</h1>
              <p className="text-muted-foreground">Bắt đầu hành trình khám phá bản thân</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Server error */}
              <AnimatePresence mode="wait">
                {serverError && (
                  <motion.div
                    key="server-err"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <X className="w-4 h-4 shrink-0" />{serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input type="text" placeholder="Nguyễn Văn A" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50" required />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
                    emailError ? 'text-red-400' : isValidEmail(email) && email ? 'text-green-400' : 'text-muted-foreground'
                  )} />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value) }}
                    onBlur={() => setEmailTouched(true)}
                    className={cn(
                      'pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50 transition-colors',
                      emailError && 'border-red-500/50 focus:border-red-500/70',
                      isValidEmail(email) && email && !emailError && 'border-green-500/40 focus:border-green-500/60'
                    )}
                  />
                  {email.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidEmail(email)
                        ? <Check className="w-4 h-4 text-green-400" />
                        : <X className="w-4 h-4 text-red-400" />}
                    </div>
                  )}
                </div>
                {/* Fixed-height hint row — never shifts layout */}
                <div className="h-4 flex items-center">
                  <AnimatePresence mode="wait">
                    {emailError ? (
                      <motion.p key="email-err"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3 shrink-0" />{emailError}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Strength */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((level) => (
                        <div
                          key={level}
                          className={cn(
                            'h-1 flex-1 rounded-full transition-colors',
                            strength.level >= level ? strength.color : 'bg-white/10'
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Độ mạnh: {strength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock className={cn(
                    'absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors',
                    confirmError ? 'text-red-400' : confirmPassword && passwordsMatch ? 'text-green-400' : 'text-muted-foreground'
                  )} />
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value) }}
                    onBlur={() => setConfirmTouched(true)}
                    className={cn(
                      'pl-10 pr-10 bg-white/5 border-white/10 focus:border-purple-500/50 transition-colors',
                      confirmError && 'border-red-500/50 focus:border-red-500/70',
                      confirmPassword && passwordsMatch && !confirmError && 'border-green-500/40 focus:border-green-500/60'
                    )}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Fixed-height hint row — never shifts layout */}
                <div className="h-4 flex items-center">
                  <AnimatePresence mode="wait">
                    {confirmError ? (
                      <motion.p key="confirm-err"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-red-400 flex items-center gap-1">
                        <X className="w-3 h-3 shrink-0" />{confirmError}
                      </motion.p>
                    ) : confirmPassword && passwordsMatch ? (
                      <motion.p key="confirm-ok"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-xs text-green-400 flex items-center gap-1">
                        <Check className="w-3 h-3 shrink-0" />Mật khẩu khớp
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => setAgreed(!agreed)}
                  className={cn(
                    'w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
                    agreed
                      ? 'bg-purple-600 border-purple-600'
                      : 'border-white/20 hover:border-purple-500/50'
                  )}
                >
                  {agreed && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                    Điều khoản sử dụng
                  </Link>
                  {' '}và{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                    Chính sách bảo mật
                  </Link>
                </span>
              </label>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !agreed}
                className={cn(
                  'w-full h-12',
                  'bg-gradient-to-r from-purple-600 to-indigo-600',
                  'hover:from-purple-500 hover:to-indigo-500',
                  'text-white shadow-lg shadow-purple-500/25'
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Đăng ký miễn phí
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Benefits */}
            <div className="mt-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <p className="text-sm text-purple-300 font-medium mb-2">Khi đăng ký, bạn sẽ nhận được:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  AI Tarot không giới hạn
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Ưu đãi 20% session đầu tiên
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  Tham gia cộng đồng Mystic
                </li>
              </ul>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Đăng nhập
              </Link>
            </p>
          </GlassCard>
        </motion.div>
      </main>
    </>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  X, Mail, Lock, Eye, EyeOff, User, ArrowRight,
  Check, ShieldCheck, Sparkles, LogIn, ChevronLeft, KeyRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
function isValidEmail(v: string) { return EMAIL_REGEX.test(v.trim()) }

// ─── Overlay wrapper ─────────────────────────────────────────────────────────
export function AuthModal() {
  const { isOpen, close } = useAuthModal()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-md max-h-[90svh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ModalContent />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Tab switcher inside modal ────────────────────────────────────────────────
function ModalContent() {
  const { tab, close } = useAuthModal()
  const [successEmail, setSuccessEmail] = useState('')
  const [successName, setSuccessName] = useState('')
  const [screen, setScreen] = useState<'form' | 'success' | 'forgot'>('form')

  // reset screen when tab changes
  useEffect(() => { setScreen('form') }, [tab])

  if (screen === 'success') {
    return (
      <SuccessScreen
        name={successName}
        email={successEmail}
        onClose={close}
      />
    )
  }

  if (screen === 'forgot') {
    return (
      <ForgotPasswordScreen onBack={() => setScreen('form')} onClose={close} />
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.2)]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#768064]/8 via-transparent to-[#4C583E]/8 pointer-events-none" />

      {/* Close */}
      <button
        onClick={close}
        className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Tab bar */}
      <div className="relative flex border-b border-white/10">
        {(['login', 'register'] as const).map((t) => (
          <TabButton key={t} value={t} />
        ))}
      </div>

      {/* Form content */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.div key="login"
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.2 }}>
              <LoginForm onForgot={() => setScreen('forgot')} />
            </motion.div>
          ) : (
            <motion.div key="register"
              initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <RegisterForm
                onSuccess={(email, name) => {
                  setSuccessEmail(email)
                  setSuccessName(name)
                  setScreen('success')
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabButton({ value }: { value: 'login' | 'register' }) {
  const { tab, switchTab } = useAuthModal()
  const active = tab === value
  const label = value === 'login' ? 'Đăng nhập' : 'Đăng ký'
  return (
    <button
      onClick={() => switchTab(value)}
      className={cn(
        'flex-1 py-4 text-sm font-medium transition-colors relative',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70'
      )}
    >
      {label}
      {active && (
        <motion.div
          layoutId="auth-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#768064] to-[#4C583E]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </button>
  )
}

// ─── Login form ───────────────────────────────────────────────────────────────
function LoginForm({ onForgot }: { onForgot?: () => void }) {
  const { prefillEmail, close, switchTab, setUser } = useAuthModal()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync prefillEmail → state khi modal mở lại với email mới
  useEffect(() => {
    if (typeof prefillEmail === 'string') setEmail(prefillEmail)
  }, [prefillEmail])

  // focus password if email pre-filled, else focus email
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setIsLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Đăng nhập thất bại.'); setIsLoading(false); return }
      setUser(data.user)
      close()
      window.location.href = '/readers'
    } catch {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.')
    }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Chào mừng trở lại</h2>
        <p className="text-sm text-muted-foreground">Đăng nhập để tiếp tục hành trình của bạn</p>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input ref={prefillEmail ? undefined : inputRef}
            type="email" placeholder="email@example.com" value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            className="pl-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-foreground">Mật khẩu</label>
          <button type="button" onClick={onForgot} className="text-xs text-[#768064] hover:text-[#4C583E] transition-colors">Quên mật khẩu?</button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input ref={prefillEmail ? inputRef : undefined}
            type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="h-4 flex items-center">
          <AnimatePresence mode="wait">
            {error && <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" />{error}</motion.p>}
          </AnimatePresence>
        </div>
      </div>

      <Button type="submit" disabled={isLoading || !email || !password}
        className="w-full h-11 bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white shadow-lg shadow-[#768064]/20">
        {isLoading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <><LogIn className="w-4 h-4 mr-2" />Đăng nhập</>}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Chưa có tài khoản?{' '}
        <button type="button" onClick={() => switchTab('register')} className="text-[#768064] hover:text-[#4C583E] font-medium">
          Đăng ký miễn phí
        </button>
      </p>
    </form>
  )
}

// ─── Register form ────────────────────────────────────────────────────────────
function RegisterForm({ onSuccess }: { onSuccess: (email: string, name: string) => void }) {
  const { switchTab } = useAuthModal()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmTouched, setConfirmTouched] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const emailError = emailTouched && !email ? 'Vui lòng nhập email'
    : emailTouched && !isValidEmail(email) ? 'Email không hợp lệ' : ''
  const passwordsMatch = confirmPassword === password
  const confirmError = confirmTouched && !confirmPassword ? 'Vui lòng xác nhận mật khẩu'
    : confirmTouched && !passwordsMatch ? 'Mật khẩu không khớp' : ''

  const isFormValid = name.trim().length > 0 && isValidEmail(email)
    && password.length >= 6 && passwordsMatch && confirmPassword.length > 0 && agreed

  const strength = !password ? { level: 0, label: '', color: '' }
    : password.length < 6 ? { level: 1, label: 'Yếu', color: 'bg-red-500' }
    : password.length < 10 ? { level: 2, label: 'Trung bình', color: 'bg-yellow-500' }
    : { level: 3, label: 'Mạnh', color: 'bg-green-500' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailTouched(true); setConfirmTouched(true)
    if (!isFormValid) return
    setIsLoading(true); setServerError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setServerError(data.error || 'Đăng ký thất bại.'); setIsLoading(false); return }
      onSuccess(email, name.split(' ')[0] || name)
    } catch { setServerError('Đã xảy ra lỗi. Vui lòng thử lại.') }
    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Tạo tài khoản mới</h2>
        <p className="text-sm text-muted-foreground">Bắt đầu hành trình khám phá bản thân</p>
      </div>

      <AnimatePresence mode="wait">
        {serverError && <motion.div key="serr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <X className="w-4 h-4 shrink-0" />{serverError}
        </motion.div>}
      </AnimatePresence>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Họ và tên</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Nguyễn Văn A" value={name}
            onChange={(e) => setName(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Email</label>
        <div className="relative">
          <Mail className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
            emailError ? 'text-red-400' : isValidEmail(email) ? 'text-green-400' : 'text-muted-foreground')} />
          <Input type="email" placeholder="email@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} onBlur={() => setEmailTouched(true)}
            className={cn('pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#768064]/50',
              emailError && 'border-red-500/50', isValidEmail(email) && !emailError && 'border-green-500/40')} />
          {email && <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidEmail(email) ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>}
        </div>
        <div className="h-4 flex items-center">
          {emailError && <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" />{emailError}</p>}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Mật khẩu</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type={showPwd ? 'text' : 'password'} placeholder="••••••••" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
          <button type="button" onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {password && <div className="space-y-0.5">
          <div className="flex gap-1">{[1,2,3].map(l =>
            <div key={l} className={cn('h-1 flex-1 rounded-full transition-colors', strength.level >= l ? strength.color : 'bg-white/10')} />)}
          </div>
          <p className="text-xs text-muted-foreground">Độ mạnh: {strength.label}</p>
        </div>}
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Xác nhận mật khẩu</label>
        <div className="relative">
          <Lock className={cn('absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors',
            confirmError ? 'text-red-400' : confirmPassword && passwordsMatch ? 'text-green-400' : 'text-muted-foreground')} />
          <Input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} onBlur={() => setConfirmTouched(true)}
            className={cn('pl-10 pr-10 bg-white/5 border-white/10 focus:border-[#768064]/50',
              confirmError && 'border-red-500/50', confirmPassword && passwordsMatch && 'border-green-500/40')} />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="h-4 flex items-center">
          {confirmError
            ? <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" />{confirmError}</p>
            : confirmPassword && passwordsMatch
            ? <p className="text-xs text-green-400 flex items-center gap-1"><Check className="w-3 h-3" />Mật khẩu khớp</p>
            : null}
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div onClick={() => setAgreed(!agreed)}
          className={cn('w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors',
            agreed ? 'bg-[#4C583E] border-[#A5B38B]' : 'border-white/20 hover:border-[#768064]/50')}>
          {agreed && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm text-muted-foreground">
          Tôi đồng ý với{' '}
          <Link href="/terms" className="text-[#768064] hover:text-[#4C583E]">Điều khoản</Link>
          {' '}và{' '}
          <Link href="/privacy" className="text-[#768064] hover:text-[#4C583E]">Chính sách bảo mật</Link>
        </span>
      </label>

      <Button type="submit" disabled={isLoading || !agreed}
        className="w-full h-11 bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white shadow-lg shadow-[#768064]/20">
        {isLoading
          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          : <>Đăng ký miễn phí<ArrowRight className="w-4 h-4 ml-2" /></>}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Đã có tài khoản?{' '}
        <button type="button" onClick={() => switchTab('login')} className="text-[#768064] hover:text-[#4C583E] font-medium">
          Đăng nhập
        </button>
      </p>
    </form>
  )
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name, email, onClose }: { name: string; email: string; onClose: () => void }) {
  const { openLogin } = useAuthModal()

  const handleExplore = () => {
    onClose()
    // small delay so modal closes first, then login re-opens with prefilled email
    setTimeout(() => openLogin(email), 150)
  }

  const sparkles: React.CSSProperties[] = [
    { top: '12%', left: '10%' }, { top: '8%', right: '12%' },
    { bottom: '18%', left: '8%' }, { bottom: '14%', right: '10%' },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl p-8 text-center bg-[#0f0a1a]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.2)]">
      <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#768064]/8 via-transparent to-[#4C583E]/8 pointer-events-none" />

      {sparkles.map((s, i) => (
        <motion.span key={i} initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.6], scale: 1 }}
          transition={{ delay: [0.3, 0.45, 0.55, 0.4][i], duration: 0.6 }}
          className="absolute text-[#4C583E]/60 text-xl pointer-events-none select-none" style={s}>✦</motion.span>
      ))}

      <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center shadow-lg shadow-[#768064]/20">
        <ShieldCheck className="w-10 h-10 text-white" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <h2 className="text-2xl font-bold text-foreground mb-2">Chào mừng, {name}! 🌙</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Tài khoản của bạn đã được tạo thành công.<br />Hành trình khám phá bản thân bắt đầu từ đây!
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="mb-6 space-y-2 text-left">
        {['AI Tarot không giới hạn đã được kích hoạt', 'Ưu đãi 20% session đầu tiên của bạn', 'Bạn đã gia nhập cộng đồng Mystic'].map((b, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-green-400" />
            </div>{b}
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Button onClick={handleExplore}
          className="w-full h-11 bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white shadow-lg shadow-[#768064]/20">
          <Sparkles className="w-4 h-4 mr-2" />Khám phá ngay
        </Button>
      </motion.div>
    </div>
  )
}


// ─── Forgot Password Screen ───────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [resetUrl, setResetUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Lỗi.'); return }
      setSent(true)
      if (data.resetUrl) setResetUrl(data.resetUrl) // chỉ có trong dev
    } catch { setError('Lỗi kết nối.') }
    finally { setLoading(false) }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-[0_0_80px_rgba(168,85,247,0.2)]">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#768064]/8 via-transparent to-[#4C583E]/8 pointer-events-none" />
      <button onClick={onClose} className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground transition-colors">
        <X className="w-5 h-5" />
      </button>

      <div className="p-6 sm:p-8">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Quay lại
        </button>

        {sent ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Kiểm tra email của bạn</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.
            </p>
            {/* Dev mode: hiển thị link trực tiếp */}
            {resetUrl && (
              <div className="mt-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-left">
                <p className="text-xs text-yellow-400 font-medium mb-1">🛠 Dev mode — Link reset:</p>
                <a href={resetUrl} onClick={onClose}
                  className="text-xs text-[#768064] hover:text-[#4C583E] break-all underline">
                  {resetUrl}
                </a>
              </div>
            )}
            <button onClick={onBack} className="mt-4 text-sm text-[#768064] hover:text-[#4C583E]">
              Quay lại đăng nhập
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-[#768064]/20 flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-[#768064]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Quên mật khẩu</h2>
                <p className="text-xs text-muted-foreground">Nhập email để lấy link đặt lại</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <X className="w-4 h-4 shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="email@example.com" value={email}
                    onChange={e => setEmail(e.target.value)} autoFocus
                    className="pl-10 bg-white/5 border-white/10 focus:border-[#768064]/50" required />
                </div>
              </div>

              <Button type="submit" disabled={loading || !email.trim()}
                className="w-full h-11 bg-gradient-to-r from-[#4C583E] to-[#2C3424] hover:from-[#768064] hover:to-[#4C583E] text-white">
                {loading
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Mail className="w-4 h-4 mr-2" />Gửi link đặt lại</>}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

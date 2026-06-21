'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react'
import { CosmicBackground, FloatingElements } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return
    setIsLoading(true)
    // Simulate register
    setTimeout(() => {
      setIsLoading(false)
      window.location.href = '/dashboard'
    }, 1500)
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

      <main className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
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

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Họ và tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                    required
                  />
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

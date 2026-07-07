'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, Eye, EyeOff, ImagePlus, Lock, User, Sparkles, X, ChevronDown, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { specialties } from '@/lib/data'
import { cn } from '@/lib/utils'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FACEBOOK_REGEX = /^https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[A-Za-z0-9_.]+\/?$/i
function isValidEmail(v: string) { return EMAIL_REGEX.test(v.trim()) }
function isValidFacebook(v: string) { return FACEBOOK_REGEX.test(v.trim()) }

export default function RegisterReaderPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [facebookLink, setFacebookLink] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [experienceYear, setExperienceYear] = useState('1')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [avatarName, setAvatarName] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showSpecialtyMenu, setShowSpecialtyMenu] = useState(false)
  const specialtyRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!showSpecialtyMenu) return
    const handler = (e: MouseEvent) => {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node))
        setShowSpecialtyMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSpecialtyMenu])

  const emailError = email.length > 0 && !isValidEmail(email)
  const facebookError = facebookLink.length > 0 && !isValidFacebook(facebookLink)
  const passwordsMatch = password === confirmPassword
  const isFormValid =
    email.trim().length > 0 &&
    isValidEmail(email) &&
    password.length >= 6 &&
    passwordsMatch &&
    facebookLink.trim().length > 0 &&
    isValidFacebook(facebookLink) &&
    name.trim().length > 0 &&
    phone.trim().length > 0 &&
    description.trim().length > 20 &&
    Number(experienceYear) >= 0 &&
    selectedSpecialties.length > 0 &&
    avatarDataUrl !== null &&
    agreed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')
    if (!isFormValid) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: email.trim(),
          password,
          facebookLink: facebookLink.trim(),
          phone: phone.trim(),
          description,
          experienceYear: Number(experienceYear),
          specialty: selectedSpecialties,
          avatarDataUrl,
        }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch (parseErr) {
        console.error('Unable to parse register-reader response', parseErr)
      }

      if (!res.ok) {
        setServerError(data?.error || 'Gửi yêu cầu thất bại. Vui lòng thử lại.')
        setIsLoading(false)
        return
      }

      setSuccessMessage('Yêu cầu trở thành Reader đã được gửi. Admin sẽ duyệt và kích hoạt trong thời gian sớm nhất.')
      setShowSuccessDialog(true)
    } catch (error) {
      console.error(error)
      setServerError('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen py-12 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <p className="text-sm text-[#768064] uppercase tracking-[0.3em]">Dành cho Tarot Reader</p>
          <h1 className="mt-4 text-4xl font-bold text-foreground">Đăng ký làm Reader</h1>
          <p className="mt-3 text-sm text-muted-foreground">Gửi thông tin của bạn đến admin để được duyệt và kích hoạt.</p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {serverError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
                {serverError}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-300">
                {successMessage}
              </div>
            )}

            <div className="rounded-3xl border-[var(--border)] bg-white/5 p-8">
              <div className="mb-8 border-b border-[var(--border)] pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4C583E]">Tài khoản</p>
                <h2 className="mt-3 text-xl font-semibold text-foreground">Thông tin đăng nhập</h2>
                <p className="mt-2 text-sm text-muted-foreground">Nhập email và mật khẩu để tạo tài khoản Reader.</p>
              </div>

              <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Email <span className="text-red-400">*</span>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 bg-white/5 border-[var(--border)]"
                    required
                  />
                  {emailError && <p className="mt-2 text-xs text-red-400">Email không hợp lệ.</p>}
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Mật khẩu <span className="text-red-400">*</span>
                  <div className="relative mt-2">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-white/5 border-[var(--border)] pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Xác nhận mật khẩu <span className="text-red-400">*</span>
                  <div className="relative mt-2">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-white/5 border-[var(--border)] pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!passwordsMatch && confirmPassword && (
                    <p className="mt-2 text-xs text-red-400">Mật khẩu không khớp.</p>
                  )}
                </label>
              </div>
              </div>
            </div>

            <div className="rounded-3xl border-[var(--border)] bg-white/5 p-8">
              <div className="mb-8 border-b border-[var(--border)] pb-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#4C583E]">Thông tin Reader</p>
                <h2 className="mt-3 text-xl font-semibold text-foreground">Hồ sơ cá nhân</h2>
                <p className="mt-2 text-sm text-muted-foreground">Cho admin biết được phong cách đọc của bạn và cách khách hàng có thể liên lạc.</p>
              </div>

              <div className="space-y-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Link Facebook để liên hệ <span className="text-red-400">*</span>
                  <Input
                    type="url"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    className="mt-2 bg-white/5 border-[var(--border)]"
                    required
                  />
                  {facebookError && <p className="mt-2 text-xs text-red-400">Nhập link Facebook hợp lệ.</p>}
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Số điện thoại <span className="text-red-400">*</span>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 bg-white/5 border-[var(--border)]"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Họ và tên đầy đủ <span className="text-red-400">*</span>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 bg-white/5 border-[var(--border)]"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Năm kinh nghiệm <span className="text-red-400">*</span>
                  <Input
                    type="number"
                    min={0}
                    value={experienceYear}
                    onChange={(e) => setExperienceYear(e.target.value)}
                    className="mt-2 bg-white/5 border-[var(--border)]"
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="block text-sm font-medium text-foreground">
                  <div className="mb-2">Chủ đề <span className="text-muted-foreground font-normal">(tối đa 8)</span></div>
                  
                  {selectedSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSpecialties.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-[#768064]/20 text-[#4C583E] border border-[#768064]/30">
                          {s}
                          <button type="button" onClick={() => setSelectedSpecialties(prev => prev.filter(x => x !== s))}
                            className="hover:text-white" aria-label={`Xóa ${s}`}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="relative" ref={specialtyRef}>
                    <button
                      type="button"
                      onClick={() => setShowSpecialtyMenu(!showSpecialtyMenu)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-[var(--border)] bg-white/5 text-sm text-muted-foreground hover:border-[#768064]/40 transition-colors"
                    >
                      <span>{selectedSpecialties.length > 0 ? `Đã chọn ${selectedSpecialties.length} chủ đề` : 'Chọn chủ đề...'}</span>
                      <ChevronDown className={cn('w-4 h-4 transition-transform', showSpecialtyMenu && 'rotate-180')} />
                    </button>
                    
                    {showSpecialtyMenu && (
                      <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-[var(--border)] rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                        {specialties.map((opt) => {
                          const selected = selectedSpecialties.includes(opt)
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                if (selected) {
                                  setSelectedSpecialties(prev => prev.filter(x => x !== opt))
                                } else if (selectedSpecialties.length < 8) {
                                  setSelectedSpecialties(prev => [...prev, opt])
                                } else {
                                  toast.error('Tối đa 8 chủ đề.')
                                }
                              }}
                              className={cn(
                                'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left',
                                selected ? 'bg-[#768064]/20 text-[#4C583E]' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                              )}
                            >
                              {opt}
                              {selected && <Check className="w-4 h-4 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Chọn từ danh sách. Tối đa 8 chủ đề.</p>
                </div>
                <div />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-foreground">
                  Chân dung
                  <div className="mt-2 rounded-3xl border-2 border-dashed border-[#768064]/20 bg-gradient-to-br from-white/5 to-transparent p-5 text-center transition hover:border-[#A5B38B]/70 hover:bg-white/10">
                    <div className="mx-auto mb-4 h-24 w-24 overflow-hidden rounded-3xl bg-white/5 shadow-inner shadow-black/10">
                      {avatarDataUrl ? (
                        <img src={avatarDataUrl} alt="Preview chân dung" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Ảnh chân dung</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Upload ảnh cá nhân</p>
                      <p className="text-xs text-muted-foreground">JPG/PNG, tối đa 1.5MB</p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-full bg-[#4C583E] px-4 py-2 text-sm text-white hover:bg-[#768064]"
                        onClick={() => document.getElementById('reader-avatar-input')?.click()}
                      >
                        <ImagePlus className="w-4 h-4" /> Chọn ảnh
                      </button>
                      <input
                        id="reader-avatar-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            setAvatarDataUrl(reader.result as string)
                            setAvatarName(file.name)
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      {avatarName && <p className="text-xs text-muted-foreground">{avatarName}</p>}
                    </div>
                  </div>
                </label>
                <label className="block text-sm font-medium text-foreground">
                  Mô tả bản thân
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 min-h-[180px] bg-white/5 border-[var(--border)]"
                    rows={6}
                    required
                  />
                  {description.trim().length > 0 && description.trim().length < 20 && (
                    <p className="mt-2 text-xs text-red-400">Mô tả cần dài hơn 20 ký tự.</p>
                  )}
                </label>
              </div>
              </div>
            </div>


            <label className="flex items-start gap-3 cursor-pointer text-sm text-muted-foreground">
              <span className={cn(
                'mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors',
                agreed ? 'bg-[#4C583E] border-[#A5B38B] text-white' : 'border-[var(--border)]'
              )}>
                {agreed && <Check className="w-3 h-3" />}
              </span>
              <span>
                Tôi đồng ý để admin xem xét hồ sơ và liên hệ khi cần thiết.
              </span>
              <input type="checkbox" className="hidden" checked={agreed} onChange={() => setAgreed(!agreed)} />
            </label>

            <Button type="submit" disabled={isLoading || !isFormValid} className="w-full h-12">
              {isLoading ? 'Đang gửi...' : 'Gửi hồ sơ cho admin'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Link href="/auth/login" className="text-[#768064] hover:text-[#4C583E]">
                Đăng nhập
              </Link>
            </p>
          </form>
        </GlassCard>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="max-w-md rounded-2xl border-green-500/20 bg-black">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <DialogTitle className="text-center text-xl">Đăng ký thành công!</DialogTitle>
              <DialogDescription className="text-center">
                <p className="mt-4 text-sm">Yêu cầu của bạn đã được gửi đến admin.</p>
                <p className="mt-2 text-sm">Admin sẽ kiểm tra hồ sơ của bạn và gửi kết quả qua email trong thời gian sớm nhất.</p>
                <p className="mt-3 text-xs text-yellow-400">
                  ⏱️ Thời gian xử lý: 1-3 ngày làm việc
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex flex-col gap-3 sm:flex-col">
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-[#4C583E] hover:bg-[#768064]"
              >
                Đăng nhập ngay
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="w-full border-[var(--border)] text-foreground hover:bg-white/5"
              >
                Quay lại trang chủ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}

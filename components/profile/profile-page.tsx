'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Camera, Loader2, Save, ShieldCheck, Star, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { NumberInput } from '@/components/ui/number-input'
import type { PackageItem } from '@/components/profile/reader-packages-tab'
import type { AvailabilityItem } from '@/components/profile/reader-availability-tab'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { cn } from '@/lib/utils'

interface CustomerInitial {
  fullname: string
  birthday: string
  gender: string
  avatar_url: string
}

interface ReaderInitial {
  display_name: string
  description: string
  experience_year: number
  price_per_session: number
  avatar_url: string
  rating: number
  verified: boolean
  specialty: string[]
  packages: PackageItem[]
  availability: AvailabilityItem[]
}

type Props =
  | { role: 'CUSTOMER'; email: string; initial: CustomerInitial }
  | { role: 'READER'; email: string; initial: ReaderInitial }

// Resize ảnh về tối đa 256px rồi xuất base64 (webp) để chuỗi nhỏ gọn
function resizeImage(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new window.Image()
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no canvas context'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/webp', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function ProfilePage(props: Props) {
  const { role, email, initial } = props
  const { setUser } = useAuthModal()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const isReader = role === 'READER'

  // Field state theo role
  const [fullname, setFullname] = useState(isReader ? '' : (initial as CustomerInitial).fullname)
  const [birthday, setBirthday] = useState(isReader ? '' : (initial as CustomerInitial).birthday)
  const [gender, setGender] = useState(isReader ? '' : (initial as CustomerInitial).gender)

  const [displayName, setDisplayName] = useState(isReader ? (initial as ReaderInitial).display_name : '')
  const [description, setDescription] = useState(isReader ? (initial as ReaderInitial).description : '')
  const [expYear, setExpYear] = useState(String(isReader ? (initial as ReaderInitial).experience_year : 0))
  const [price, setPrice] = useState(String(isReader ? (initial as ReaderInitial).price_per_session : 0))

  const [avatar, setAvatar] = useState(initial.avatar_url)
  const [busy, setBusy] = useState(false)

  // Reader: specialty tags
  const [specialty, setSpecialty] = useState<string[]>(isReader ? (initial as ReaderInitial).specialty : [])
  const [specialtyInput, setSpecialtyInput] = useState('')

  function addSpecialty() {
    const t = specialtyInput.trim()
    if (!t) return
    if (specialty.includes(t)) { setSpecialtyInput(''); return }
    if (specialty.length >= 8) { toast.error('Tối đa 8 chuyên môn.'); return }
    setSpecialty((prev) => [...prev, t])
    setSpecialtyInput('')
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh.')
      return
    }
    try {
      const dataUrl = await resizeImage(file)
      setAvatar(dataUrl)
    } catch {
      toast.error('Không đọc được ảnh. Thử ảnh khác nhé.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = isReader
        ? {
            display_name: displayName,
            description,
            experience_year: Number(expYear),
            price_per_session: Number(price),
            avatar_url: avatar,
            specialty,
          }
        : {
            fullname,
            birthday,
            gender,
            avatar_url: avatar,
          }

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? 'Cập nhật thất bại.')
        return
      }
      toast.success('Đã lưu hồ sơ.')
      setUser(data.user)
      router.refresh()
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setBusy(false)
    }
  }

  const displayLabel = isReader ? displayName : fullname
  const initialChar = (displayLabel || email).charAt(0).toUpperCase()

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Chỉnh sửa hồ sơ</h1>
            <p className="text-muted-foreground">Cập nhật thông tin cá nhân của bạn</p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <GlassCard className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-purple-500/40 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                    {avatar ? (
                      <Image src={avatar} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-3xl font-semibold text-white">{initialChar}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-purple-600 hover:bg-purple-500 flex items-center justify-center ring-2 ring-background transition-colors"
                    aria-label="Đổi ảnh đại diện"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </div>
                <div>
                  <div className="font-medium text-foreground">Ảnh đại diện</div>
                  <div className="text-sm text-muted-foreground">Nhấn biểu tượng máy ảnh để đổi ảnh.</div>
                  {avatar && (
                    <button type="button" onClick={() => setAvatar('')}
                      className="mt-1 text-xs text-red-400 hover:text-red-300">
                      Xóa ảnh
                    </button>
                  )}
                </div>
              </div>

              {/* Email (chỉ đọc) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled className="opacity-60" />
              </div>

              {isReader ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="display_name">Tên hiển thị</Label>
                    <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="VD: Luna Minh Nguyệt" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Giới thiệu</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả kinh nghiệm và phong cách của bạn…" rows={4} maxLength={1000} />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="exp">Số năm kinh nghiệm</Label>
                      <NumberInput id="exp" min={0} value={expYear} onChange={setExpYear} />
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Chuyên môn</Label>
                    <div className="flex flex-wrap gap-2">
                      {specialty.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {s}
                          <button type="button" onClick={() => setSpecialty((prev) => prev.filter((x) => x !== s))}
                            className="hover:text-white" aria-label={`Xóa ${s}`}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="specialty"
                        value={specialtyInput}
                        onChange={(e) => setSpecialtyInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpecialty() } }}
                        placeholder="VD: Tình yêu, Sự nghiệp…"
                      />
                      <Button type="button" variant="outline" onClick={addSpecialty} className="border-white/10 shrink-0">
                        Thêm
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Nhấn Enter hoặc &quot;Thêm&quot; để thêm tag. Tối đa 8.</p>
                  </div>

                  {/* Read-only: rating + verified */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25">
                      <Star className="w-3.5 h-3.5 fill-yellow-400" />
                      {(initial as ReaderInitial).rating.toFixed(1)} đánh giá
                    </span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-full border',
                      (initial as ReaderInitial).verified
                        ? 'bg-green-500/15 text-green-400 border-green-500/25'
                        : 'bg-white/5 text-muted-foreground border-white/10'
                    )}>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {(initial as ReaderInitial).verified ? 'Đã xác minh' : 'Chưa xác minh'}
                    </span>
                    <span className="text-xs text-muted-foreground">Đánh giá và xác minh do hệ thống quản lý.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Họ và tên</Label>
                    <Input id="fullname" value={fullname} onChange={(e) => setFullname(e.target.value)}
                      placeholder="Nhập họ tên của bạn" required />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthday">Ngày sinh</Label>
                      <DatePicker
                        id="birthday"
                        value={birthday}
                        onChange={setBirthday}
                        placeholder="Chọn ngày sinh"
                        disableFuture
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Giới tính</Label>
                      <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        <option value="" className="bg-background">Không xác định</option>
                        <option value="Nam" className="bg-background">Nam</option>
                        <option value="Nữ" className="bg-background">Nữ</option>
                        <option value="Khác" className="bg-background">Khác</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={busy}
                  className="bg-purple-600 hover:bg-purple-500 text-white">
                  {busy ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang lưu…</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Lưu thay đổi</>
                  )}
                </Button>
              </div>
            </GlassCard>
          </form>
        </div>
      </main>
      <MobileNav />
    </>
  )
}

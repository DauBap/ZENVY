'use client'

import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Camera, Loader2, Save, ShieldCheck, Star, X, ChevronDown, Check, Clock } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import RegisterReaderForm from '@/components/auth/register-reader-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { GlassCard } from '@/components/ui/glass-card'
import { AudioPlayer } from '@/components/ui/audio-player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { NumberInput } from '@/components/ui/number-input'
import type { PackageItem } from '@/components/profile/reader-packages-tab'
import type { AvailabilityItem } from '@/components/profile/reader-availability-tab'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { specialties as SPECIALTY_LIST } from '@/lib/data'
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
  voiceSample?: string | null
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
  const { setUser, user } = useAuthModal()
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
  const audioFileRef = useRef<HTMLInputElement>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [avatar, setAvatar] = useState(initial.avatar_url)
  const [busy, setBusy] = useState(false)

  // Voice recorder state (reader only)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordedDataUrl, setRecordedDataUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [savingVoice, setSavingVoice] = useState(false)
  const [serverVoiceSample, setServerVoiceSample] = useState<string | null>(
    isReader ? (initial as ReaderInitial).voiceSample ?? null : null
  )

  const [showRegisterDialog, setShowRegisterDialog] = useState(false)

  // Reader: specialty tags — chọn từ danh sách cố định
  const [specialty, setSpecialty] = useState<string[]>(isReader ? (initial as ReaderInitial).specialty : [])
  const [showSpecialtyMenu, setShowSpecialtyMenu] = useState(false)
  const specialtyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showSpecialtyMenu) return
    const handler = (e: MouseEvent) => {
      if (specialtyRef.current && !specialtyRef.current.contains(e.target as Node))
        setShowSpecialtyMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showSpecialtyMenu])

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      setRecordedUrl(null)
      setRecordedDataUrl(null)
      mr.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          setRecordedDataUrl(dataUrl)
        }
        reader.readAsDataURL(blob)
      }
      mediaRecorderRef.current = mr
      mr.start()
      setRecording(true)
      setRecordingTime(0)
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 9) {
            stopRecording()
          }
          return prev + 1
        })
      }, 1000)
    } catch (e) {
      console.error('startRecording', e)
      toast.error('Không thể mở micro. Vui lòng cho phép quyền ghi âm.')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
  }

  const saveVoiceSample = async () => {
    try {
      setSavingVoice(true)
      const dataUrl = recordedDataUrl
      if (!dataUrl) {
        toast.error('Không có bản ghi để lưu.')
        return
      }
      const res = await fetch('/api/reader/voice', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voice: dataUrl }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        toast.error(data?.error ?? 'Lưu mẫu thất bại.')
        return
      }
      const data = await res.json()
      setServerVoiceSample(data.voiceSample ?? dataUrl)
      setRecordedUrl(null)
      setRecordedDataUrl(null)
      toast.success('Đã lưu mẫu giọng.')
    } catch (e) {
      console.error(e)
      toast.error('Lỗi khi lưu mẫu.')
    } finally {
      setSavingVoice(false)
    }
  }

  async function handleAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn file âm thanh (mp3, wav, webm).')
      return
    }
    setAudioFileName(file.name)
    const blobUrl = URL.createObjectURL(file)
    setRecordedUrl(blobUrl)
    const reader = new FileReader()
    reader.onload = () => {
      setRecordedDataUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const deleteVoiceSample = async () => {
    if (!serverVoiceSample) return
    try {
      setSavingVoice(true)
      const res = await fetch('/api/reader/voice', { method: 'DELETE' })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        toast.error(data?.error ?? 'Xóa mẫu giọng thất bại.')
        return
      }
      setServerVoiceSample(null)
      setRecordedUrl(null)
      setRecordedDataUrl(null)
      toast.success('Đã xóa mẫu giọng.')
    } catch (e) {
      console.error(e)
      toast.error('Lỗi khi xóa mẫu giọng.')
    } finally {
      setSavingVoice(false)
    }
  }

  useEffect(() => {
    if (!isReader || !user) return
    const controller = new AbortController()

    fetch(`/api/users/${user.id}/voice`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (res) => {
        const data = await res.json().catch(() => null)
        if (!res.ok) return
        if (data && Object.prototype.hasOwnProperty.call(data, 'voiceSample')) {
          setServerVoiceSample(data.voiceSample)
        }
      })
      .catch(() => {})

    return () => controller.abort()
  }, [isReader, user])

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
            {!isReader && (
              <div className="mt-3">
                <button onClick={() => setShowRegisterDialog(true)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#4C583E] text-white">
                  Đăng ký làm reader
                </button>
              </div>
            )}
          </motion.div>

          <form onSubmit={handleSubmit}>
            <GlassCard className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-[#A5B38B]/40 bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center">
                    {avatar ? (
                      <Image src={avatar} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-3xl font-semibold text-white">{initialChar}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#4C583E] hover:bg-[#768064] flex items-center justify-center ring-2 ring-background transition-colors"
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
                <div className="space-y-6">
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

                  <div className="space-y-0">
                    <Label>Chuyên môn <span className="text-muted-foreground font-normal">(tối đa 8)</span></Label>

                    {specialty.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {specialty.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-[#768064]/20 text-[#4C583E] border border-[#768064]/30">
                            {s}
                            <button type="button" onClick={() => setSpecialty(prev => prev.filter(x => x !== s))}
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
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-muted-foreground hover:border-[#768064]/40 transition-colors"
                      >
                        <span>{specialty.length > 0 ? `Đã chọn ${specialty.length} chuyên môn` : 'Chọn chuyên môn...'}</span>
                        <ChevronDown className={cn('w-4 h-4 transition-transform', showSpecialtyMenu && 'rotate-180')} />
                      </button>

                      {showSpecialtyMenu && (
                        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                          {SPECIALTY_LIST.map((opt) => {
                            const selected = specialty.includes(opt)
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  if (selected) {
                                    setSpecialty(prev => prev.filter(x => x !== opt))
                                  } else if (specialty.length < 8) {
                                    setSpecialty(prev => [...prev, opt])
                                  } else {
                                    toast.error('Tối đa 8 chuyên môn.')
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
                    <p className="text-xs text-muted-foreground">Chọn từ danh sách. Tối đa 8 chuyên môn.</p>
                  </div>

                  <div className="space-y-4">
                    <GlassCard className="p-4 bg-white/5 border border-white/10">
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="text-sm font-semibold text-foreground">Mẫu giọng</div>
                          <div className="text-xs text-muted-foreground">Ghi lại mẫu giọng ngắn để hiển thị với khách hàng.</div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-2">
                            {!recording ? (
                              <Button type="button" size="sm" onClick={startRecording} className="bg-[#4C583E] text-white">Bắt đầu ghi</Button>
                            ) : (
                              <Button type="button" size="sm" onClick={stopRecording} className="bg-red-600 text-white">Dừng ({recordingTime}s)</Button>
                            )}
                            <input ref={audioFileRef} id="audio-file-input" type="file" accept="audio/*" className="hidden" onChange={handleAudioFile} />
                            <Button type="button" size="sm" onClick={() => audioFileRef.current?.click()} className="bg-white/5 text-muted-foreground hover:bg-white/10">
                              Chọn file
                            </Button>
                            {audioFileName && <div className="text-xs text-muted-foreground">{audioFileName}</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            {recordedUrl ? (
                              <AudioPlayer src={recordedUrl} className="w-full" />
                            ) : serverVoiceSample ? (
                              <AudioPlayer src={serverVoiceSample} className="w-full" />
                            ) : (
                              <div className="rounded-lg border border-dashed border-white/10 px-4 py-3 text-sm text-muted-foreground">
                                Chưa có mẫu giọng. Ghi âm hoặc tải file lên để lưu mẫu mới.
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 sm:gap-3">
                            <Button type="button" size="sm" onClick={saveVoiceSample} disabled={savingVoice || !recordedDataUrl}
                              className="bg-green-600 text-white whitespace-nowrap">
                              {savingVoice ? 'Đang lưu…' : 'Lưu mẫu'}
                            </Button>
                            {serverVoiceSample && !recordedDataUrl && (
                              <Button type="button" size="sm" onClick={deleteVoiceSample} disabled={savingVoice}
                                className="bg-white/5 text-muted-foreground hover:bg-white/10 whitespace-nowrap">
                                Xóa mẫu
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>

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
                  </div>
                </div>
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
                  className="bg-[#4C583E] hover:bg-[#768064] text-white">
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
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đăng ký làm Reader</DialogTitle>
          </DialogHeader>
          <RegisterReaderForm hideAccountFields={true} onSuccess={() => setShowRegisterDialog(false)} />
        </DialogContent>
      </Dialog>
      <MobileNav />
    </>
  )
}

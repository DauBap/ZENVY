'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { toast } from 'sonner'
import { ImagePlus, X, Check, Eye, EyeOff, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { specialties } from '@/lib/data'
import { cn } from '@/lib/utils'

interface Props {
  hideAccountFields?: boolean
  onSuccess?: () => void
}

export default function RegisterReaderForm({ hideAccountFields = false, onSuccess }: Props) {
  const { user } = useAuthModal()
  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [description, setDescription] = useState('')
  const [experienceYear, setExperienceYear] = useState('1')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [avatarName, setAvatarName] = useState('')
  const [facebook, setFacebook] = useState('')
  const audioFileRef = useRef<HTMLInputElement | null>(null)
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null)
  const [audioFileName, setAudioFileName] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (hideAccountFields && user) {
      setName(user.name ?? '')
      setPhone((user as any)?.phone ?? '')
      // keep other fields blank; user can edit name
    }
  }, [hideAccountFields, user])

  // Bắt buộc: họ tên, SĐT, chuyên đề (≥1), năm KN, ảnh đại diện, link FB/Zalo
  // Không bắt buộc: nickname, giới thiệu, ghi âm
  const isFormValid = hideAccountFields
    ? name.trim().length > 0 && phone.trim().length > 0 && selectedSpecialties.length > 0 && experienceYear.trim() !== '' && Number(experienceYear) >= 0 && avatarDataUrl && facebook.trim().length > 0 && agreed
    : name.trim().length > 0 && email.trim().length > 0 && password.length >= 6 && password === confirmPassword && phone.trim().length > 0 && selectedSpecialties.length > 0 && experienceYear.trim() !== '' && Number(experienceYear) >= 0 && avatarDataUrl && facebook.trim().length > 0 && agreed

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!isFormValid) return
    setIsLoading(true)
    try {
      const payload: any = {
        name,
        nickname: nickname.trim() || undefined,
        phone: phone.trim(),
        description: description.trim() || undefined,
        experienceYear: Number(experienceYear),
        specialty: selectedSpecialties,
        avatarDataUrl,
        facebook: facebook?.trim() || undefined,
        voiceDataUrl: audioDataUrl ?? undefined,
      }
      if (!hideAccountFields) {
        payload.email = email.trim()
        payload.password = password
      }

      const res = await fetch('/api/auth/register-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Gửi yêu cầu thất bại.')
        setIsLoading(false)
        return
      }
      toast.success('Yêu cầu đã được gửi. Admin sẽ duyệt.')
      setName('')
      setNickname('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setPhone('')
      setDescription('')
      setExperienceYear('1')
      setAvatarDataUrl(null)
      setAvatarName('')
      setFacebook('')
      setAudioDataUrl(null)
      setAudioFileName(null)
      setSelectedSpecialties([])
      setAgreed(false)
      onSuccess?.()
    } catch (err) {
      console.error(err)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleAudioFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      toast.error('Vui lòng chọn file âm thanh (mp3, wav, webm).')
      return
    }
    setAudioFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => setAudioDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      audioChunksRef.current = []
      setRecordedUrl(null)
      setAudioDataUrl(null)
      mr.ondataavailable = (ev) => { if (ev.data.size > 0) audioChunksRef.current.push(ev.data) }
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedUrl(url)
        const reader = new FileReader()
        reader.onload = () => setAudioDataUrl(reader.result as string)
        reader.readAsDataURL(blob)
      }
      mediaRecorderRef.current = mr
      mr.start()
      setRecording(true)
      setRecordingTime(0)
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            stopRecording()
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      console.error('startRecording', err)
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hideAccountFields && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            Email <span className="text-red-500">*</span>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} required />
          </label>
          <label className="block text-sm">
            Mật khẩu <span className="text-red-500">*</span>
            <div className="relative mt-2">
              <Input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className={cn('pr-10 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} required />
              <button type="button" className="absolute inset-y-0 right-3" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </label>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Họ và tên <span className="text-red-500">*</span>
          <Input value={name} onChange={(e) => setName(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} required />
        </label>
        <label className="block text-sm">Nickname
          <Input value={nickname} onChange={(e) => setNickname(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} placeholder="Tên hiển thị công khai (để trống dùng họ tên)" />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">Số điện thoại <span className="text-red-500">*</span>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} required />
        </label>
        <label className="block text-sm">Năm kinh nghiệm <span className="text-red-500">*</span>
          <Input type="number" min={0} value={experienceYear} onChange={(e) => setExperienceYear(e.target.value)} className={cn('mt-2 h-10 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} required />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="block text-sm">Chọn chủ đề <span className="text-red-500">*</span>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="mt-2 flex w-full h-10 items-center justify-between gap-2 rounded-md border border-gray-200 dark:border-neutral-700 bg-white dark:bg-transparent px-3 py-2 text-left leading-6">
                <span className={cn('truncate', selectedSpecialties.length === 0 && 'text-muted-foreground')}>
                  {selectedSpecialties.length === 0 ? '-- Chọn chủ đề --' : selectedSpecialties.join(', ')}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="max-h-72 overflow-y-auto p-1 w-[var(--radix-popover-trigger-width)]" align="start">
              {specialties.map((s) => {
                const checked = selectedSpecialties.includes(s)
                return (
                  <label key={s} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        setSelectedSpecialties(prev => v ? [...prev, s] : prev.filter(x => x !== s))
                      }}
                    />
                    <span>{s}</span>
                  </label>
                )
              })}
            </PopoverContent>
          </Popover>
        </div>
        <label className="block text-sm">Link Facebook hoặc Zalo <span className="text-red-500">*</span>
          <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} placeholder="https://facebook.com/ hoặc zalo.me/..." required />
        </label>
      </div>

      <div className="block text-sm">Ảnh đại diện <span className="text-red-500">*</span>
        <div className="mt-2">
          <div className="mb-2 h-24 w-24 overflow-hidden rounded-lg bg-white/5 border border-gray-200 dark:border-neutral-700">
            {avatarDataUrl ? <img src={avatarDataUrl} className="h-full w-full object-cover" /> : null}
          </div>
          <div className="space-y-2">
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#4C583E] px-4 py-2 text-sm text-white" onClick={() => document.getElementById('reader-avatar-input')?.click()}>
              <ImagePlus className="w-4 h-4" /> Chọn ảnh
            </button>
            <input id="reader-avatar-input" type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const r = new FileReader()
              r.onload = () => { setAvatarDataUrl(r.result as string); setAvatarName(file.name) }
              r.readAsDataURL(file)
            }} />
            {avatarName && <div className="text-xs text-muted-foreground">{avatarName}</div>}
          </div>
        </div>
      </div>

      <div className="block text-sm">Ghi âm giới thiệu
        <div className="mt-2">
          <input ref={audioFileRef} id="reader-audio-input" type="file" accept="audio/*" className="hidden" onChange={handleAudioFile} />
          <div className="flex flex-wrap items-center gap-2">
            {!recording ? (
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#4C583E] px-3 py-2 text-sm text-white" onClick={startRecording}>Ghi âm trực tiếp</button>
            ) : (
              <button type="button" className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-2 text-sm text-white" onClick={stopRecording}>Dừng ({recordingTime}s)</button>
            )}
            <button type="button" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-sm text-muted-foreground" onClick={() => audioFileRef.current?.click()}>Chọn file</button>
            {audioFileName && <div className="text-xs text-muted-foreground">{audioFileName}</div>}
          </div>
          {audioDataUrl && (
            <div className="mt-2">
              <audio src={audioDataUrl} controls className="w-full" />
            </div>
          )}
        </div>
      </div>

      <label className="block text-sm">Giới thiệu về bản thân
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className={cn('mt-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2')} rows={5} />
      </label>

      <label className="flex items-start gap-3 cursor-pointer text-sm">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>Tôi đồng ý để admin xem xét hồ sơ.</span>
      </label>

      <div className="flex items-center justify-end">
        <Button type="submit" onClick={handleSubmit} disabled={!isFormValid || isLoading} className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
          Gửi yêu cầu
        </Button>
      </div>
    </form>
  )
}

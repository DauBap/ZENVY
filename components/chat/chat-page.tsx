'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Send, ChevronLeft, ChevronDown, CheckCheck, MessageSquare, Loader2,
  Phone, Video, ImagePlus, Mic, Smile, Sticker, X, Square,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { resizeImage } from '@/lib/image'
import { EMOJIS, STICKERS } from '@/components/chat/emoji-data'
import { cn } from '@/lib/utils'

type MsgType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'STICKER'
type Phase = 'pending' | 'upcoming' | 'ongoing' | 'past'

interface ConversationItem {
  id: number
  counterpartUserId: number
  name: string
  avatar: string | null
  lastMessage: string
  lastMessageAt: string | null
  unread: number
}

interface ChatMessage {
  id: number
  senderUserId: number
  bookingId: number | null
  type: MsgType
  body: string
  mediaUrl: string | null
  createdAt: string
  mine: boolean
}

interface SessionItem {
  bookingId: number
  status: string
  phase: Phase
  date: string
  time: string
  packageName: string
  duration: number
}

interface ChatClientProps {
  currentUserId: number
  currentRole: string
  initialReaderId: number | null
  initialCustomerId: number | null
  initialBookingId: number | null
}

const LIST_POLL_MS = 15000
const MSG_POLL_MS = 4000
const MAX_MEDIA = 3_500_000

const PHASE_LABEL: Record<Phase, { label: string; className: string }> = {
  pending:  { label: 'Chờ xác nhận', className: 'bg-yellow-500/20 text-yellow-300' },
  upcoming: { label: 'Sắp diễn ra',  className: 'bg-amber-500/20 text-amber-300' },
  ongoing:  { label: 'Đang diễn ra', className: 'bg-green-500/20 text-green-300' },
  past:     { label: 'Hoàn thành',   className: 'bg-blue-500/20 text-blue-300' },
}

// "Cuộc hẹn · HH:mm dd/MM/yyyy"
function apptLabel(s: SessionItem): string {
  const [y, m, d] = s.date.split('-')
  return `Cuộc hẹn · ${s.time} ${d}/${m}/${y}`
}

export function ChatClient({ currentUserId, currentRole, initialReaderId, initialCustomerId, initialBookingId }: ChatClientProps) {
  const isReader = currentRole === 'READER'

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [completing, setCompleting] = useState(false)
  // null = view "Tin nhắn" (DM); số = đang xem một phiên cuộc hẹn
  const [sessionBookingId, setSessionBookingId] = useState<number | null>(initialBookingId)
  const [sessions, setSessions] = useState<SessionItem[]>([])
  // Ghi âm
  const [recording, setRecording] = useState(false)

  const maxIdRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const bootstrapped = useRef(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const active = conversations.find((c) => c.id === activeId) ?? null

  // ── Tải danh sách hội thoại ────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations')
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations ?? [])
    } catch { /* bỏ qua lỗi polling */ }
  }, [])

  // ── Tải tin nhắn (full khi đổi hội thoại; delta khi polling) ────────────────
  const loadMessages = useCallback(async (conversationId: number, delta: boolean) => {
    try {
      const url = delta
        ? `/api/conversations/${conversationId}/messages?since=${maxIdRef.current}`
        : `/api/conversations/${conversationId}/messages`
      const res = await fetch(url)
      if (!res.ok) return
      const data = await res.json()
      const incoming: ChatMessage[] = data.messages ?? []
      if (incoming.length === 0) return
      maxIdRef.current = Math.max(maxIdRef.current, ...incoming.map((m) => m.id))
      setMessages((prev) => {
        if (!delta) return incoming
        const seen = new Set(prev.map((m) => m.id))
        return [...prev, ...incoming.filter((m) => !seen.has(m.id))]
      })
    } catch { /* bỏ qua lỗi polling */ }
  }, [])

  // ── Tải danh sách phiên (booking) của hội thoại ─────────────────────────────
  const loadSessions = useCallback(async (conversationId: number) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/sessions`)
      if (!res.ok) return
      const data = await res.json()
      setSessions(data.sessions ?? [])
    } catch { /* bỏ qua */ }
  }, [])

  // ── Mở một hội thoại ────────────────────────────────────────────────────────
  const openConversation = useCallback((conversationId: number) => {
    setActiveId(conversationId)
    setMessages([])
    maxIdRef.current = 0
    loadMessages(conversationId, false)
    loadSessions(conversationId)
  }, [loadMessages, loadSessions])

  // ── Bootstrap: nếu vào từ ?reader= / ?customer= thì get-or-create rồi mở ─────
  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    ;(async () => {
      await loadConversations()
      const payload = initialReaderId
        ? { readerId: initialReaderId }
        : initialCustomerId
        ? { customerId: initialCustomerId }
        : null
      if (payload) {
        try {
          const res = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const data = await res.json()
          if (res.ok && data.conversation) {
            await loadConversations()
            openConversation(data.conversation.id)
          } else {
            toast.error(data.error ?? 'Không mở được hội thoại.')
          }
        } catch {
          toast.error('Lỗi kết nối. Vui lòng thử lại.')
        }
      }
    })()
  }, [initialReaderId, initialCustomerId, loadConversations, openConversation])

  // ── Polling danh sách hội thoại + phiên (pause khi tab ẩn) ──────────────────
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') loadConversations() }
    const t = setInterval(tick, LIST_POLL_MS)
    return () => clearInterval(t)
  }, [loadConversations])

  // ── Polling tin nhắn + phiên của hội thoại đang mở ──────────────────────────
  useEffect(() => {
    if (!activeId) return
    const tick = () => {
      if (document.visibilityState === 'visible') {
        loadMessages(activeId, true)
        loadSessions(activeId)  // cập nhật phase (sắp→đang diễn ra) theo thời gian
      }
    }
    const t = setInterval(tick, MSG_POLL_MS)
    return () => clearInterval(t)
  }, [activeId, loadMessages, loadSessions])

  // ── Tự cuộn xuống cuối khi có tin mới ───────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeSession = sessionBookingId
    ? sessions.find((s) => s.bookingId === sessionBookingId) ?? null
    : null

  // Khóa gửi tin khi xem phiên không phải "đang diễn ra"
  const sessionLocked = sessionBookingId != null && activeSession?.phase !== 'ongoing'

  // ── Gửi tin nhắn (text / media / sticker) ───────────────────────────────────
  async function sendMessage(payload: { type: MsgType; body?: string; mediaUrl?: string }) {
    if (!activeId || sending) return
    if (sessionLocked) { toast.error('Phiên này không nhận thêm tin nhắn.'); return }
    setSending(true)
    const tempId = -Date.now()
    const optimistic: ChatMessage = {
      id: tempId, senderUserId: currentUserId, bookingId: sessionBookingId,
      type: payload.type, body: payload.body ?? '', mediaUrl: payload.mediaUrl ?? null,
      createdAt: new Date().toISOString(), mine: true,
    }
    setMessages((prev) => [...prev, optimistic])
    try {
      const res = await fetch(`/api/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, bookingId: sessionBookingId ?? undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error(data.error ?? 'Gửi tin nhắn thất bại.')
        return
      }
      setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)))
      maxIdRef.current = Math.max(maxIdRef.current, data.message.id)
      loadConversations()
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setSending(false)
    }
  }

  function sendText() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    sendMessage({ type: 'TEXT', body: text })
  }

  // ── Ảnh ─────────────────────────────────────────────────────────────────────
  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh.'); return }
    try {
      const dataUrl = await resizeImage(file, 1024)
      if (dataUrl.length > MAX_MEDIA) { toast.error('Ảnh quá lớn.'); return }
      sendMessage({ type: 'IMAGE', mediaUrl: dataUrl })
    } catch {
      toast.error('Không đọc được ảnh.')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  // ── Ghi âm ───────────────────────────────────────────────────────────────────
  async function toggleRecording() {
    if (recording) {
      recorderRef.current?.stop()
      return
    }
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Trình duyệt không hỗ trợ ghi âm.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        setRecording(false)
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        const reader = new FileReader()
        reader.onload = () => {
          const dataUrl = reader.result as string
          if (dataUrl.length > MAX_MEDIA) { toast.error('Đoạn ghi âm quá dài.'); return }
          sendMessage({ type: 'AUDIO', mediaUrl: dataUrl })
        }
        reader.readAsDataURL(blob)
      }
      recorderRef.current = rec
      rec.start()
      setRecording(true)
    } catch {
      toast.error('Không truy cập được micro. Hãy cho phép quyền ghi âm.')
    }
  }

  // ── Reader hoàn thành session ───────────────────────────────────────────────
  async function completeSession() {
    if (!sessionBookingId || completing) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/bookings/${sessionBookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Không hoàn thành được.'); return }
      toast.success('Đã hoàn thành session.')
      if (activeId) loadSessions(activeId)
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setCompleting(false)
    }
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  // View "Tin nhắn" → chỉ DM (không thuộc phiên); view phiên → chỉ tin của phiên đó
  const shown = sessionBookingId
    ? messages.filter((m) => m.bookingId === sessionBookingId)
    : messages.filter((m) => m.bookingId === null)

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem-5rem)] lg:h-[calc(100vh-5rem)] flex">

          {/* Sidebar */}
          <div className={cn('w-full lg:w-80 border-r border-white/10 overflow-hidden flex flex-col', active && 'hidden lg:flex')}>
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Tin nhắn</h2>
            </div>
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground p-6">Chưa có cuộc trò chuyện nào.</p>
              ) : conversations.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { setSessionBookingId(null); openConversation(c.id) }}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left transition-colors',
                    activeId === c.id ? 'bg-purple-500/20' : 'hover:bg-white/5'
                  )}
                >
                  <div className="w-12 h-12 rounded-full ring-1 ring-white/10 shrink-0 bg-purple-500/20 flex items-center justify-center text-purple-200 font-semibold"
                    style={c.avatar ? { backgroundImage: `url("${c.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                    {!c.avatar && c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground truncate">{c.name}</span>
                      {c.unread > 0 && (
                        <span className="shrink-0 w-5 h-5 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">{c.unread}</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{c.lastMessage || 'Bắt đầu trò chuyện...'}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={cn('flex-1 flex-col overflow-hidden', active ? 'flex' : 'hidden lg:flex')}>
            {active ? (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => setActiveId(null)} className="lg:hidden shrink-0">
                      <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-200 font-semibold shrink-0"
                      style={active.avatar ? { backgroundImage: `url("${active.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                      {!active.avatar && active.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-foreground truncate">{active.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Reader hoàn thành session khi đang diễn ra */}
                    {isReader && activeSession?.phase === 'ongoing' && (
                      <Button size="sm" disabled={completing} onClick={completeSession}
                        className="bg-green-600 hover:bg-green-500 text-white mr-1">
                        {completing ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> …</> : 'Hoàn thành'}
                      </Button>
                    )}
                    {/* Icon gọi / video — trang trí, chưa hoạt động */}
                    <button title="Gọi thoại (sắp ra mắt)" disabled
                      className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5 transition-colors cursor-not-allowed">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button title="Gọi video (sắp ra mắt)" disabled
                      className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground hover:bg-white/5 transition-colors cursor-not-allowed">
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Bộ chuyển: Tin nhắn | Cuộc hẹn ▾ */}
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
                  <button
                    onClick={() => setSessionBookingId(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      sessionBookingId === null
                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
                    )}
                  >
                    Tin nhắn
                  </button>

                  {sessions.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            sessionBookingId !== null
                              ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
                          )}
                        >
                          {activeSession ? apptLabel(activeSession) : 'Cuộc hẹn'}
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72 bg-background/95 backdrop-blur-xl border-white/10 max-h-80 overflow-y-auto">
                        {sessions.map((s) => (
                          <DropdownMenuItem
                            key={s.bookingId}
                            onClick={() => setSessionBookingId(s.bookingId)}
                            className="flex items-center justify-between gap-2 cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {s.phase === 'ongoing' && (
                                <span className="relative flex w-2 h-2 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                  <span className="relative flex w-2 h-2 rounded-full bg-green-400" />
                                </span>
                              )}
                              <span className="truncate text-sm">{apptLabel(s)}</span>
                            </span>
                            <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px]', PHASE_LABEL[s.phase].className)}>
                              {PHASE_LABEL[s.phase].label}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>

                {/* Banner chi tiết phiên đang xem */}
                {sessionBookingId && activeSession && (
                  <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 text-xs text-purple-200 flex items-center justify-between gap-2">
                    <span className="truncate">
                      {apptLabel(activeSession)} · {activeSession.packageName || 'Tarot'}
                      <span className={cn('ml-2 px-1.5 py-0.5 rounded text-[10px]', PHASE_LABEL[activeSession.phase].className)}>
                        {PHASE_LABEL[activeSession.phase].label}
                      </span>
                    </span>
                    <button onClick={() => setSessionBookingId(null)} className="underline hover:text-white shrink-0">Về tin nhắn</button>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {shown.length === 0 && (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      {sessionBookingId ? 'Chưa có tin nhắn trong phiên này.' : 'Hãy gửi tin nhắn đầu tiên.'}
                    </p>
                  )}
                  {shown.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', msg.mine ? 'justify-end' : 'justify-start')}
                    >
                      {msg.type === 'STICKER' ? (
                        <div className="text-5xl leading-none py-1">{msg.body}</div>
                      ) : (
                        <div className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-2.5',
                          msg.mine
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                            : 'bg-white/10 text-foreground rounded-bl-sm'
                        )}>
                          {msg.type === 'IMAGE' && msg.mediaUrl && (
                            <Image src={msg.mediaUrl} alt="image" width={240} height={240}
                              className="rounded-lg max-h-60 w-auto object-cover mb-1" unoptimized />
                          )}
                          {msg.type === 'AUDIO' && msg.mediaUrl && (
                            <audio controls src={msg.mediaUrl} className="max-w-[220px] h-9" />
                          )}
                          {msg.body && <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.body}</p>}
                          <div className={cn('flex items-center gap-1 mt-0.5', msg.mine ? 'justify-end' : 'justify-start')}>
                            <span className="text-[10px] opacity-60">{fmt(msg.createdAt)}</span>
                            {msg.mine && msg.id > 0 && <CheckCheck className="w-3 h-3 opacity-60" />}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-background/50 backdrop-blur-sm shrink-0">
                  {sessionLocked ? (
                    <p className="text-center text-xs text-muted-foreground py-1.5">
                      {activeSession?.phase === 'upcoming'
                        ? 'Phiên sắp diễn ra — bạn có thể nhắn tin khi tới giờ hẹn.'
                        : activeSession?.phase === 'past'
                        ? 'Phiên đã hoàn thành — chỉ xem lại lịch sử.'
                        : 'Phiên chưa được xác nhận — chưa thể nhắn tin.'}
                    </p>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {/* Ảnh */}
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={sending}
                        title="Gửi ảnh"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-purple-300 hover:bg-white/5 transition-colors shrink-0">
                        <ImagePlus className="w-5 h-5" />
                      </button>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />

                      {/* Emoji */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" title="Emoji"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-purple-300 hover:bg-white/5 transition-colors shrink-0">
                            <Smile className="w-5 h-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 bg-background/95 backdrop-blur-xl border-white/10">
                          <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                            {EMOJIS.map((e, i) => (
                              <button key={i} onClick={() => setDraft((d) => d + e)}
                                className="text-xl hover:bg-white/10 rounded p-1 transition-colors">{e}</button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Sticker */}
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" title="Sticker"
                            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-purple-300 hover:bg-white/5 transition-colors shrink-0">
                            <Sticker className="w-5 h-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-72 bg-background/95 backdrop-blur-xl border-white/10">
                          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
                            {STICKERS.map((s, i) => (
                              <button key={i} onClick={() => sendMessage({ type: 'STICKER', body: s })}
                                className="text-3xl hover:bg-white/10 rounded p-1 transition-colors">{s}</button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>

                      {/* Ghi âm */}
                      <button type="button" onClick={toggleRecording} disabled={sending}
                        title={recording ? 'Dừng & gửi' : 'Ghi âm'}
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center transition-colors shrink-0',
                          recording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-muted-foreground hover:text-purple-300 hover:bg-white/5'
                        )}>
                        {recording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <Input
                        placeholder={sessionBookingId ? 'Đặt câu hỏi cho cuộc hẹn...' : 'Nhập tin nhắn...'}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
                        className="flex-1 bg-white/5 border-white/10 focus:border-purple-500/50"
                      />
                      <Button size="icon" onClick={sendText} disabled={!draft.trim() || sending}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0">
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="w-12 h-12 text-purple-400/30 mb-4" />
                <p className="text-muted-foreground mb-4">Chọn một cuộc trò chuyện để bắt đầu.</p>
                {!isReader && (
                  <Link href="/readers"><Button variant="outline" className="border-white/10">Tìm Reader</Button></Link>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileNav />
    </>
  )
}

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, MessageCircle, Clock, ImagePlus, Send, Loader2,
  Trash2, X, ShieldCheck, Bookmark, BookmarkCheck,
  Pencil, Check, AtSign, MoreHorizontal,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { resizeImage } from '@/lib/image'
import { toTokens, fromTokens, MENTION_TOKEN_RE, type Mention } from '@/lib/mention'
import { useAuthModal } from '@/contexts/auth-modal-context'
import Link from 'next/link'
import { Star, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Author {
  userId: number | null
  name: string
  avatar: string | null
  isReader: boolean
  isVerified: boolean
}
interface Post {
  id: number
  content: string
  imageUrl: string | null
  createdAt: string
  author: Author
  likeCount: number
  commentCount: number
  likedByMe: boolean
  savedByMe: boolean
  canDelete: boolean
  canEdit: boolean
}
interface Comment {
  id: number
  content: string
  createdAt: string
  author: Author
}
interface TagUser { id: number; name: string; avatar: string | null; isReader: boolean }

type FeedTab = 'feed' | 'liked' | 'saved' | 'mine'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'vừa xong'
  if (m < 60) return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} giờ trước`
  return `${Math.floor(h / 24)} ngày trước`
}

function Avatar({ author, size = 40 }: { author: Author; size?: number }) {
  if (author.avatar) {
    return (
      <div className="rounded-full overflow-hidden ring-2 ring-[#768064]/30 shrink-0" style={{ width: size, height: size }}>
        <Image src={author.avatar} alt={author.name} width={size} height={size} className="w-full h-full object-cover" unoptimized />
      </div>
    )
  }
  return (
    <div className="rounded-full bg-[#768064]/20 flex items-center justify-center shrink-0 text-[#768064]/70 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.4 }}>
      {author.name.charAt(0).toUpperCase()}
    </div>
  )
}

// Thông tin popup khi bấm mention
interface MentionProfile {
  userId: number
  name: string
  avatar: string | null
  isReader: boolean
  isVerified: boolean
  specialty: string[]
  rating: number | null
  readerInfoId: number | null
  customerInfoId: number | null
}

// Cache profile theo userId để không fetch lại
const profileCache = new Map<number, MentionProfile>()

// Chip mention bấm được → mở popup thông tin user/reader
function MentionChip({ name, userId }: { name: string; userId: number }) {
  const { user } = useAuthModal()
  const viewerIsReader = user?.role === 'READER' && user?.readerStatus === 'ACTIVE'
  const [profile, setProfile] = useState<MentionProfile | null>(profileCache.get(userId) ?? null)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (profile || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        profileCache.set(userId, data)
        setProfile(data)
      }
    } catch { /* bỏ qua */ }
    finally { setLoading(false) }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" onClick={load}
          className="text-[#768064] font-medium hover:underline">
          @{name}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-background/95 backdrop-blur-xl border-white/10 p-4">
        {!profile ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#768064]" /></div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.name} width={48} height={48}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-[#768064]/30" unoptimized />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#768064]/20 flex items-center justify-center text-[#768064]/70 font-semibold text-lg">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground truncate">{profile.name}</span>
                  {profile.isVerified && <ShieldCheck className="w-4 h-4 text-green-400 shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground">{profile.isReader ? 'Tarot Reader' : 'Khách hàng'}</span>
              </div>
            </div>

            {profile.isReader && (
              <>
                {profile.rating != null && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-foreground">{profile.rating.toFixed(1)}</span>
                  </div>
                )}
                {profile.specialty.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialty.slice(0, 4).map((s) => (
                      <span key={s} className="px-2 py-0.5 text-[11px] rounded-full bg-[#768064]/15 text-[#4C583E] border border-[#768064]/25">{s}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  {profile.readerInfoId && (
                    <>
                      <Link href={`/readers/${profile.readerInfoId}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full border-white/10 text-xs">
                          <UserCircle className="w-3.5 h-3.5 mr-1" /> Hồ sơ
                        </Button>
                      </Link>
                      <Link href={`/chat?reader=${profile.readerInfoId}`} className="flex-1">
                        <Button size="sm" className="w-full bg-[#4C583E] hover:bg-[#768064] text-white text-xs">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> Trò chuyện
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </>
            )}

            {/* Khách hàng: nút Nhắn tin chỉ hiện khi người xem là reader */}
            {!profile.isReader && viewerIsReader && profile.customerInfoId && (
              <Link href={`/chat?customer=${profile.customerInfoId}`} className="block">
                <Button size="sm" className="w-full bg-[#4C583E] hover:bg-[#768064] text-white text-xs">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" /> Nhắn tin
                </Button>
              </Link>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// Render nội dung có @mention (token "@[Tên](id)") → chip bấm được
function RichContent({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  const re = new RegExp(MENTION_TOKEN_RE.source, 'g')
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(<span key={key++}>{text.slice(last, m.index)}</span>)
    nodes.push(<MentionChip key={key++} name={m[1]} userId={Number(m[2])} />)
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(<span key={key++}>{text.slice(last)}</span>)
  return <>{nodes}</>
}

// ─── PostActionsMenu — nút ⋯ gộp Edit + Delete ───────────────────────────────
function PostActionsMenu({
  canEdit, canDelete, isEditing, onEdit, onDelete,
}: {
  canEdit: boolean
  canDelete: boolean
  isEditing?: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-36 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {canEdit && (
              <button
                onClick={() => { onEdit(); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors',
                  isEditing
                    ? 'text-[#4C583E] bg-[#768064]/10'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                )}
              >
                <Pencil className="w-3.5 h-3.5" />
                {isEditing ? 'Đang sửa' : 'Chỉnh sửa'}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => { onDelete(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa bài
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MentionTextarea ─────────────────────────────────────────────────────────
function MentionTextarea({
  value, onChange, mentions, onMentionsChange, placeholder, className, maxLength,
}: {
  value: string
  onChange: (v: string) => void
  mentions: Mention[]
  onMentionsChange: (m: Mention[]) => void
  placeholder?: string
  className?: string
  maxLength?: number
}) {
  const [suggestions, setSuggestions] = useState<TagUser[]>([])
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const ref = useRef<HTMLTextAreaElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    onChange(v)
    // Bỏ mention nếu tên không còn xuất hiện trong text (người dùng đã xóa)
    const stillThere = mentions.filter((m) => v.includes(`@${m.name}`))
    if (stillThere.length !== mentions.length) onMentionsChange(stillThere)
    // Detect @mention
    const cursor = e.target.selectionStart
    const before = v.slice(0, cursor)
    const match = before.match(/@([\w\sÀ-ỹ]*)$/)
    if (match) {
      const q = match[1]
      setMentionQuery(q)
      if (q.length >= 1) {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSuggestions(data.users ?? [])
      } else {
        setSuggestions([])
      }
    } else {
      setMentionQuery(null)
      setSuggestions([])
    }
  }

  const pickUser = (user: TagUser) => {
    if (!ref.current) return
    const cursor = ref.current.selectionStart
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const replaced = before.replace(/@[\w\sÀ-ỹ]*$/, `@${user.name} `)
    onChange(replaced + after)
    // Ghi nhận mention (theo tên hiển thị + userId) để convert thành token khi lưu
    if (!mentions.some((m) => m.userId === user.id && m.name === user.name)) {
      onMentionsChange([...mentions, { name: user.name, userId: user.id }])
    }
    setSuggestions([])
    setMentionQuery(null)
    setTimeout(() => ref.current?.focus(), 0)
  }

  return (
    <div className="relative">
      <Textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        maxLength={maxLength}
      />
      {suggestions.length > 0 && (
        <div className="absolute left-0 bottom-full mb-1 w-64 bg-background/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((u) => (
            <button key={u.id} onMouseDown={() => pickUser(u)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-left transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#768064]/20 shrink-0 overflow-hidden">
                {u.avatar
                  ? <Image src={u.avatar} alt={u.name} width={28} height={28} className="w-full h-full object-cover" unoptimized />
                  : <span className="w-full h-full flex items-center justify-center text-xs text-[#4C583E]">{u.name.charAt(0)}</span>}
              </div>
              <span className="text-sm text-foreground truncate">{u.name}</span>
              {u.isReader && <span className="text-[10px] text-[#768064] ml-auto">Reader</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Post Modal (Instagram style) ────────────────────────────────────────────
function PostModal({
  post, isLoggedIn, onClose, onLike, onSave, onDelete, onEdit,
}: {
  post: Post
  isLoggedIn: boolean
  onClose: () => void
  onLike: (p: Post) => void
  onSave: (p: Post) => void
  onDelete: (id: number) => void
  onEdit: (id: number, content: string, imageUrl: string | null) => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingCmts, setLoadingCmts] = useState(true)
  const [draft, setDraft] = useState('')
  const [draftMentions, setDraftMentions] = useState<Mention[]>([])
  const [sending, setSending] = useState(false)
  const [editing, setEditing] = useState(false)
  // post.content lưu dạng token → đổi về "@Tên" sạch cho ô soạn thảo
  const initialEdit = fromTokens(post.content)
  const [editContent, setEditContent] = useState(initialEdit.text)
  const [editMentions, setEditMentions] = useState<Mention[]>(initialEdit.mentions)
  const [editImage, setEditImage] = useState<string | null>(post.imageUrl)
  const editFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/posts/${post.id}/comments`)
      .then(r => r.json())
      .then(d => { if (d.comments) setComments(d.comments) })
      .finally(() => setLoadingCmts(false))
  }, [post.id])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const submitComment = async () => {
    const text = draft.trim()
    if (!text) return
    setSending(true)
    try {
      const res = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: toTokens(text, draftMentions) }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Lỗi'); return }
      setComments(prev => [...prev, data.comment])
      setDraft(''); setDraftMentions([])
    } catch { toast.error('Lỗi kết nối.') }
    finally { setSending(false) }
  }

  const saveEdit = async () => {
    if (!editContent.trim() && !editImage) return
    const tokenized = toTokens(editContent.trim(), editMentions)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: tokenized, imageUrl: editImage }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Sửa thất bại.'); return }
      onEdit(post.id, tokenized, editImage)
      setEditing(false)
      toast.success('Đã cập nhật bài viết.')
    } catch { toast.error('Lỗi kết nối.') }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row rounded-2xl overflow-hidden bg-card border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-foreground hover:bg-background">
          <X className="w-4 h-4" />
        </button>

        {/* Left: image */}
        {post.imageUrl ? (
          <div className="md:w-[55%] bg-background flex items-center justify-center min-h-[300px]">
            <Image src={post.imageUrl} alt="post" width={800} height={800}
              className="w-full h-full object-contain max-h-[90vh]" unoptimized />
          </div>
        ) : (
          <div className="hidden md:flex md:w-[45%] bg-gradient-to-br from-[#F7F3E8]/80 via-[#FBF5EC]/60 to-[#ECE0C8]/80 items-center justify-center p-8" />
        )}

        {/* Right: info + comments */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          {/* Author header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <Avatar author={post.author} size={36} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{post.author.name}</span>
                  {post.author.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-green-400" />}
                  {post.author.isReader && <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#768064]/20 text-[#4C583E]">Reader</span>}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
            {(post.canDelete || post.canEdit) && (
              <PostActionsMenu
                canEdit={post.canEdit}
                canDelete={post.canDelete}
                isEditing={editing}
                onEdit={() => setEditing(!editing)}
                onDelete={() => { onDelete(post.id); onClose() }}
              />
            )}
          </div>

          {/* Edit mode */}
          {editing ? (
            <div className="p-4 border-b border-white/10 shrink-0 space-y-3">
              <MentionTextarea value={editContent} onChange={setEditContent}
                mentions={editMentions} onMentionsChange={setEditMentions}
                placeholder="Nội dung bài viết..." maxLength={5000}
                className="min-h-[80px] bg-white/5 border-white/10 focus:border-[#768064]/50 resize-none text-sm" />
              {editImage && (
                <div className="relative inline-block">
                  <Image src={editImage} alt="edit" width={120} height={120} className="rounded-lg object-cover" unoptimized />
                  <button onClick={() => setEditImage(null)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center text-white">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => editFileRef.current?.click()} className="text-xs text-muted-foreground hover:text-[#4C583E] flex items-center gap-1">
                  <ImagePlus className="w-4 h-4" /> Đổi ảnh
                </button>
                <input ref={editFileRef} type="file" accept="image/*" className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (f) setEditImage(await resizeImage(f))
                  }} />
                <div className="ml-auto flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Hủy</Button>
                  <Button size="sm" onClick={saveEdit}
                    className="bg-[#4C583E] hover:bg-[#768064] text-white">
                    <Check className="w-3.5 h-3.5 mr-1" /> Lưu
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            post.imageUrl && post.content ? (
              <div className="px-4 py-3 border-b border-white/10 shrink-0">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                  <RichContent text={post.content} />
                </p>
              </div>
            ) : null
          )}

          {/* Comments list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {loadingCmts ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-[#768064]" /></div>
            ) : comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Chưa có bình luận nào</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="flex items-start gap-2.5">
                  <Avatar author={c.author} size={30} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-semibold text-foreground">{c.author.name}</span>
                      <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground break-words leading-relaxed">
                      <RichContent text={c.content} />
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Actions + input */}
          <div className="shrink-0 border-t border-white/10">
            <div className="flex items-center gap-4 px-4 py-3">
              <button onClick={() => onLike(post)}
                className={cn('flex items-center gap-1.5 text-sm transition-colors',
                  post.likedByMe ? 'text-red-400' : 'text-muted-foreground hover:text-red-400')}>
                <Heart className={cn('w-5 h-5', post.likedByMe && 'fill-current')} />
                <span>{post.likeCount}</span>
              </button>
              <button onClick={() => onSave(post)}
                className={cn('flex items-center gap-1.5 text-sm transition-colors ml-auto',
                  post.savedByMe ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400')}>
                {post.savedByMe ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
              </button>
            </div>

            {isLoggedIn && (
              <div className="flex items-center gap-2 px-4 pb-4">
                <div className="flex-1 relative">
                  <MentionTextarea value={draft} onChange={setDraft}
                    mentions={draftMentions} onMentionsChange={setDraftMentions}
                    placeholder="Bình luận... (@mention)" maxLength={2000}
                    className="h-9 min-h-0 bg-white/5 border-white/10 focus:border-[#768064]/50 resize-none text-sm py-1.5" />
                </div>
                <Button size="sm" variant="ghost" onClick={submitComment}
                  disabled={sending || !draft.trim()} className="text-[#4C583E] shrink-0">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ─── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({
  post, isLoggedIn, onLike, onSave, onDelete, onEdit, onClick,
}: {
  post: Post
  isLoggedIn: boolean
  onLike: (p: Post) => void
  onSave: (p: Post) => void
  onDelete: (id: number) => void
  onEdit: (id: number, content: string, imageUrl: string | null) => void
  onClick: () => void
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar author={post.author} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-foreground">{post.author.name}</span>
                {post.author.isVerified && <ShieldCheck className="w-4 h-4 text-green-400" />}
                {post.author.isReader && <span className="px-1.5 py-0.5 text-[10px] rounded bg-[#768064]/20 text-[#4C583E]">Reader</span>}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" /> {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>
          {post.canDelete && (
            <PostActionsMenu
              canEdit={post.canEdit}
              canDelete={post.canDelete}
              onEdit={() => onClick()}
              onDelete={() => onDelete(post.id)}
            />
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-foreground mb-3 leading-relaxed whitespace-pre-wrap break-words">
            <RichContent text={post.content} />
          </p>
        )}
        {post.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden cursor-pointer" onClick={onClick}>
            <Image src={post.imageUrl} alt="post" width={600} height={400}
              className="w-full h-auto object-cover max-h-80" unoptimized />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/10">
          <button onClick={() => onLike(post)}
            className={cn('flex items-center gap-1.5 text-sm transition-colors',
              post.likedByMe ? 'text-red-400' : 'text-muted-foreground hover:text-red-400')}>
            <Heart className={cn('w-5 h-5', post.likedByMe && 'fill-current')} /> {post.likeCount}
          </button>
          <button onClick={onClick}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#768064] transition-colors">
            <MessageCircle className="w-5 h-5" /> {post.commentCount}
          </button>
          <button onClick={() => onSave(post)} className="ml-auto transition-colors"
            title={post.savedByMe ? 'Bỏ lưu' : 'Lưu bài viết'}>
            {post.savedByMe
              ? <BookmarkCheck className="w-5 h-5 text-yellow-400" />
              : <Bookmark className="w-5 h-5 text-muted-foreground hover:text-yellow-400" />}
          </button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// ─── Main CommunityPage ───────────────────────────────────────────────────────
export function CommunityPage({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeTab, setActiveTab] = useState<FeedTab>('feed')
  const [posts, setPosts] = useState<Post[]>([])
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [modalPost, setModalPost] = useState<Post | null>(null)

  // Composer
  const [content, setContent] = useState('')
  const [mentions, setMentions] = useState<Mention[]>([])
  const [image, setImage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadFeed = useCallback(async (cursor: number | null, tab: FeedTab = 'feed') => {
    try {
      let url = `/api/posts${cursor ? `?cursor=${cursor}` : ''}`
      if (tab === 'liked') url = '/api/posts/liked'
      if (tab === 'saved') url = '/api/posts/saved'
      if (tab === 'mine')  url = '/api/posts/mine'

      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Không tải được bài viết.'); return }
      const newPosts: Post[] = data.posts ?? []
      setPosts(prev => (cursor ? [...prev, ...newPosts] : newPosts))
      setNextCursor(data.nextCursor ?? null)
    } catch {
      toast.error('Lỗi kết nối. Vui lòng thử lại.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setPosts([])
    loadFeed(null, activeTab)
  }, [activeTab, loadFeed])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Vui lòng chọn file ảnh.'); return }
    try { setImage(await resizeImage(file)) }
    catch { toast.error('Không đọc được ảnh.') }
    finally { if (fileRef.current) fileRef.current.value = '' }
  }

  async function submitPost() {
    if (!content.trim() && !image) return
    setPosting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: toTokens(content.trim(), mentions), imageUrl: image || undefined, isAnonymous: anonymous }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error ?? 'Đăng bài thất bại.'); return }
      setPosts(prev => [data.post, ...prev])
      setContent(''); setMentions([]); setImage(''); setAnonymous(false)
      toast.success('Đã đăng bài.')
    } catch { toast.error('Lỗi kết nối.') }
    finally { setPosting(false) }
  }

  function toggleLike(post: Post) {
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập.'); return }
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) } : p))
    if (modalPost?.id === post.id)
      setModalPost(prev => prev ? { ...prev, likedByMe: !prev.likedByMe, likeCount: prev.likeCount + (prev.likedByMe ? -1 : 1) } : null)
    fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likedByMe: d.liked, likeCount: d.likeCount } : p))
        if (modalPost?.id === post.id) setModalPost(prev => prev ? { ...prev, likedByMe: d.liked, likeCount: d.likeCount } : null)
      })
      .catch(() => {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likedByMe: post.likedByMe, likeCount: post.likeCount } : p))
      })
  }

  function toggleSave(post: Post) {
    if (!isLoggedIn) { toast.error('Vui lòng đăng nhập.'); return }
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, savedByMe: !p.savedByMe } : p))
    if (modalPost?.id === post.id) setModalPost(prev => prev ? { ...prev, savedByMe: !prev.savedByMe } : null)
    fetch(`/api/posts/${post.id}/save`, { method: 'POST' })
      .then(r => r.json())
      .then(d => {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, savedByMe: d.saved } : p))
        if (modalPost?.id === post.id) setModalPost(prev => prev ? { ...prev, savedByMe: d.saved } : null)
      })
      .catch(() => {
        setPosts(prev => prev.map(p => p.id === post.id ? { ...p, savedByMe: post.savedByMe } : p))
      })
  }

  function deletePost(postId: number) {
    fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      .then(r => r.json())
      .then(d => {
        if (d.success) { setPosts(prev => prev.filter(p => p.id !== postId)); toast.success('Đã xóa bài.') }
        else toast.error(d.error ?? 'Xóa thất bại.')
      })
      .catch(() => toast.error('Lỗi kết nối.'))
  }

  function editPost(postId: number, newContent: string, newImage: string | null) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent, imageUrl: newImage } : p))
    if (modalPost?.id === postId) setModalPost(prev => prev ? { ...prev, content: newContent, imageUrl: newImage } : null)
  }

  const TABS: { id: FeedTab; label: string }[] = [
    { id: 'feed',  label: 'Bảng tin' },
    { id: 'mine',  label: 'Của tôi' },
    { id: 'liked', label: 'Đã thích' },
    { id: 'saved', label: 'Đã lưu' },
  ]

  return (
    <>
      <CosmicBackground />
      <Header />

      <AnimatePresence>
        {modalPost && (
          <PostModal
            post={modalPost}
            isLoggedIn={isLoggedIn}
            onClose={() => setModalPost(null)}
            onLike={toggleLike}
            onSave={toggleSave}
            onDelete={deletePost}
            onEdit={editPost}
          />
        )}
      </AnimatePresence>

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Cộng đồng <span className="gradient-text">Mystic</span>
            </h1>
            <p className="text-muted-foreground">Chia sẻ, học hỏi và kết nối với những người yêu thích Tarot</p>
          </motion.div>

          {/* Composer */}
          {isLoggedIn && (
            <GlassCard className="p-4 mb-6 overflow-visible">
              <MentionTextarea
                value={content}
                onChange={setContent}
                mentions={mentions}
                onMentionsChange={setMentions}
                placeholder="Chia sẻ suy nghĩ của bạn... (dùng @ để tag người dùng)"
                className="min-h-[80px] bg-white/5 border-white/10 focus:border-[#768064]/50 resize-none mb-3 text-sm"
                maxLength={5000}
              />
              {image && (
                <div className="relative mb-3 inline-block">
                  <Image src={image} alt="preview" width={200} height={200} className="rounded-xl max-h-48 w-auto object-cover" unoptimized />
                  <button onClick={() => setImage('')}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#4C583E] transition-colors">
                    <ImagePlus className="w-4 h-4" /> Ảnh
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <button
                    type="button"
                    onClick={() => setAnonymous(!anonymous)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-all border',
                      anonymous
                        ? 'bg-[#768064]/20 border-[#768064]/40 text-[#4C583E]'
                        : 'bg-white/5 border-white/10 text-muted-foreground hover:border-[#768064]/30'
                    )}
                  >
                    <span className={cn(
                      'w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors',
                      anonymous ? 'bg-[#768064] border-[#768064]' : 'border-white/30'
                    )}>
                      {anonymous && <Check className="w-2 h-2 text-white" />}
                    </span>
                    Ẩn danh
                  </button>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AtSign className="w-3.5 h-3.5" /> để tag
                  </span>
                </div>
                <Button size="sm" disabled={posting || (!content.trim() && !image)} onClick={submitPost}
                  className="bg-gradient-to-r from-[#4C583E] to-[#2C3424] text-white">
                  {posting ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Đang đăng…</> : <><Send className="w-4 h-4 mr-1" />Đăng</>}
                </Button>
              </div>
            </GlassCard>
          )}

          {/* Tabs */}
          {isLoggedIn && (
            <div className="flex border-b border-white/10 mb-6">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={cn('flex-1 py-3 text-sm font-medium relative transition-colors',
                    activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/70')}>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="community-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#768064] to-[#4C583E]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Feed */}
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#768064]" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {activeTab === 'liked' ? 'Bạn chưa thích bài viết nào.' : activeTab === 'saved' ? 'Bạn chưa lưu bài viết nào.' : 'Chưa có bài viết nào.'}
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  isLoggedIn={isLoggedIn}
                  onLike={toggleLike}
                  onSave={toggleSave}
                  onDelete={deletePost}
                  onEdit={editPost}
                  onClick={() => setModalPost(post)}
                />
              ))}

              {nextCursor && activeTab === 'feed' && (
                <div className="flex justify-center">
                  <Button variant="outline" className="border-white/10" disabled={loadingMore}
                    onClick={() => { setLoadingMore(true); loadFeed(nextCursor, 'feed') }}>
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Xem thêm'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  )
}

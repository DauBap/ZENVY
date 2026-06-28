'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Paperclip, Mic, MoreVertical, Phone, Video,
  ChevronLeft, Check, CheckCheck, Smile,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OnlineIndicator } from '@/components/ui/online-indicator'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

interface Message {
  id: string
  senderId: string
  text: string
  timestamp: Date
  status: 'sent' | 'delivered' | 'read'
}

const mockMessages: Message[] = [
  { id: '1', senderId: 'reader', text: 'Chao ban! Minh la Luna. Ban co the chia se them ve cau hoi cua minh khong? 🌙', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'read' },
  { id: '2', senderId: 'user', text: 'Chao chi Luna! Em muon hoi ve moi quan he hien tai cua em a.', timestamp: new Date(Date.now() - 1000 * 60 * 25), status: 'read' },
  { id: '3', senderId: 'reader', text: 'Minh hieu roi. Cam xuc trong moi quan he doi khi rat phuc tap. Ban co the ke them khong? Minh se giup ban tim ra cau tra loi tu cac la bai.', timestamp: new Date(Date.now() - 1000 * 60 * 20), status: 'read' },
  { id: '4', senderId: 'user', text: 'Da, anh ay gan day hay ban va it nhan tin hon. Em khong biet la anh ay dang stressed hay co van de gi voi em.', timestamp: new Date(Date.now() - 1000 * 60 * 15), status: 'read' },
  { id: '5', senderId: 'reader', text: 'Cam on ban da chia se. De minh xem bai cho ban nhe... ✨', timestamp: new Date(Date.now() - 1000 * 60 * 10), status: 'read' },
]

export function ChatClient({ readers }: { readers: SerializedReader[] }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selected, setSelected] = useState<SerializedReader | null>(readers[0] ?? null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim() || !selected) return
    const msg: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: newMessage,
      timestamp: new Date(),
      status: 'sent',
    }
    setMessages((prev) => [...prev, msg])
    setNewMessage('')
    setTimeout(() => setIsTyping(true), 800)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        senderId: 'reader',
        text: 'Cam on ban da chia se! Minh dang xem bai va se phan hoi ngay a 🔮',
        timestamp: new Date(),
        status: 'sent',
      }])
    }, 3000)
  }

  const fmt = (d: Date) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem-5rem)] lg:h-[calc(100vh-5rem)] flex">

          {/* Sidebar */}
          <div className="hidden lg:block w-80 border-r border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Tin nhắn</h2>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {readers.slice(0, 6).map((reader) => (
                <button
                  key={reader.id}
                  onClick={() => setSelected(reader)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left transition-colors',
                    selected?.id === reader.id ? 'bg-purple-500/20' : 'hover:bg-white/5'
                  )}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-full ring-1 ring-white/10"
                      style={{ backgroundImage: `url("${reader.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={reader.isOnline} size="sm" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">{reader.name}</span>
                      {reader.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">San sang tra loi...</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            {selected && (
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <Link href="/readers" className="lg:hidden">
                    <Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button>
                  </Link>
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundImage: `url("${selected.avatar}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={selected.isOnline} size="sm" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{selected.name}</span>
                      {selected.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-xs text-green-400">Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-muted-foreground"><Phone className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground"><Video className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground"><MoreVertical className="w-5 h-5" /></Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex', msg.senderId === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    msg.senderId === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-foreground rounded-bl-sm'
                  )}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={cn('flex items-center gap-1 mt-0.5', msg.senderId === 'user' ? 'justify-end' : 'justify-start')}>
                      <span className="text-[10px] opacity-60">{fmt(msg.timestamp)}</span>
                      {msg.senderId === 'user' && (
                        msg.status === 'read'
                          ? <CheckCheck className="w-3 h-3 text-blue-400" />
                          : <Check className="w-3 h-3 opacity-60" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        {[0, 150, 300].map((d) => (
                          <span key={d} className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-background/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    className="pr-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />
    </>
  )
}

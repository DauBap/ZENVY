'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Send, Paperclip, Mic, MoreVertical, Phone, Video,
  ChevronLeft, Check, CheckCheck, Smile
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
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
  type: 'text' | 'voice' | 'image'
}

interface ChatPageProps {
  readers: Reader[]
}

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: 'reader',
    text: 'Chào bạn! Mình là Luna. Cảm ơn bạn đã đặt lịch với mình. Bạn có thể chia sẻ thêm về câu hỏi của mình không? 🌙',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'read',
    type: 'text',
  },
  {
    id: '2',
    senderId: 'user',
    text: 'Chào chị Luna! Em muốn hỏi về mối quan hệ hiện tại của em ạ. Em đang rất confused về cảm xúc của bạn trai em.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25),
    status: 'read',
    type: 'text',
  },
  {
    id: '3',
    senderId: 'reader',
    text: 'Mình hiểu rồi. Cảm xúc trong mối quan hệ đôi khi rất phức tạp. Bạn có thể kể thêm về những gì khiến bạn confused không? Mình sẽ giúp bạn tìm ra câu trả lời từ các lá bài.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    status: 'read',
    type: 'text',
  },
  {
    id: '4',
    senderId: 'user',
    text: 'Dạ, anh ấy gần đây hay bận và ít nhắn tin hơn. Em không biết là anh ấy đang stressed với công việc hay có vấn đề gì với em.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    status: 'read',
    type: 'text',
  },
  {
    id: '5',
    senderId: 'reader',
    text: 'Cảm ơn bạn đã chia sẻ. Để mình xem bài cho bạn nhé... ✨',
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    status: 'read',
    type: 'text',
  },
]

export function ChatPage({ readers }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState(readers[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversations = readers.filter((r) => r.isOnline).slice(0, 4)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'user',
      text: newMessage,
      timestamp: new Date(),
      status: 'sent',
      type: 'text',
    }

    setMessages([...messages, message])
    setNewMessage('')
    setTimeout(() => setIsTyping(true), 1000)
    setTimeout(() => {
      setIsTyping(false)
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'reader',
        text: 'Cảm ơn bạn đã chia sẻ! Mình đang xem bài và sẽ phản hồi ngay ạ 🔮',
        timestamp: new Date(),
        status: 'sent',
        type: 'text',
      }
      setMessages((prev) => [...prev, reply])
    }, 3000)
  }

  const formatTime = (date: Date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-16 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem-5rem)] lg:h-[calc(100vh-5rem)] flex">
          <div className="hidden lg:block w-80 border-r border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-foreground">Tin nhắn</h2>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {conversations.map((reader) => (
                <button
                  key={reader.id}
                  onClick={() => setSelectedConversation(reader)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 text-left transition-colors',
                    selectedConversation.id === reader.id ? 'bg-purple-500/20' : 'hover:bg-white/5'
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image src={reader.avatar} alt={reader.name} width={48} height={48} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <OnlineIndicator isOnline={reader.isOnline} size="sm" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground truncate">{reader.name}</span>
                      {reader.isVerified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">Đang sẵn sàng trả lời...</p>
                  </div>
                  <div className="text-xs text-muted-foreground">12:30</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image src={selectedConversation.avatar} alt={selectedConversation.name} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <OnlineIndicator isOnline={selectedConversation.isOnline} size="sm" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">{selectedConversation.name}</span>
                    {selectedConversation.isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <span className="text-xs text-green-400">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex',
                    message.senderId === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    message.senderId === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white/10 text-foreground rounded-bl-md'
                  )}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <div className={cn(
                      'flex items-center gap-1 mt-1',
                      message.senderId === 'user' ? 'justify-end' : 'justify-start'
                    )}>
                      <span className="text-[10px] opacity-60">{formatTime(message.timestamp)}</span>
                      {message.senderId === 'user' && (
                        message.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-blue-400" />
                        ) : (
                          <Check className="w-3 h-3 opacity-60" />
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="text-sm text-muted-foreground">Reader đang trả lời...</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-background/70 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-white/5 border-white/10"
                />
                <Button onClick={handleSend}>
                  <Send className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Mic className="w-4 h-4" />
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

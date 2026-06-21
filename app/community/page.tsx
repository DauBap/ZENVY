'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Heart, MessageCircle, Share2, Bookmark, MoreHorizontal,
  Send, TrendingUp, Clock, Users, Radio
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'feed', label: 'Feed', icon: TrendingUp },
  { id: 'anonymous', label: 'Ẩn danh', icon: Users },
  { id: 'live', label: 'Live', icon: Radio },
]

const posts = [
  {
    id: '1',
    author: {
      name: 'Luna Minh Nguyệt',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      isReader: true,
      isVerified: true,
    },
    content: 'Tuần này năng lượng của chòm sao Bọ Cạp đang rất mạnh! Đây là thời điểm tốt để nhìn lại và chữa lành những tổn thương cũ. Các bạn Bọ Cạp hãy dành thời gian cho bản thân nhé 🦂✨',
    image: null,
    likes: 234,
    comments: 45,
    shares: 12,
    createdAt: '2 giờ trước',
    isLiked: false,
    isSaved: false,
  },
  {
    id: '2',
    author: {
      name: 'Người dùng ẩn danh',
      avatar: null,
      isReader: false,
      isVerified: false,
    },
    content: 'Mình vừa xem tarot với một reader trên app và cảm thấy như được khai sáng. Những gì reader nói về mối quan hệ của mình hoàn toàn chính xác. Cảm ơn ZENVY! 💜',
    image: null,
    likes: 89,
    comments: 23,
    shares: 5,
    createdAt: '4 giờ trước',
    isLiked: true,
    isSaved: false,
  },
  {
    id: '3',
    author: {
      name: 'Đặng Mystic',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isReader: true,
      isVerified: true,
    },
    content: 'Lá bài "The Tower" thường khiến nhiều người lo lắng, nhưng thực ra nó mang ý nghĩa tích cực về sự thay đổi cần thiết. Những gì cũ kỹ cần được phá vỡ để xây dựng điều mới tốt đẹp hơn. Đừng sợ thay đổi! 🗼⚡',
    image: null,
    likes: 456,
    comments: 67,
    shares: 34,
    createdAt: '6 giờ trước',
    isLiked: false,
    isSaved: true,
  },
]

const liveStreams = [
  {
    id: '1',
    reader: {
      name: 'Thiên Nhi',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100',
    },
    title: 'Trả lời Q&A về Tình yêu',
    viewers: 234,
    isLive: true,
  },
  {
    id: '2',
    reader: {
      name: 'Yến Linh',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    },
    title: 'Oracle Reading buổi tối',
    viewers: 156,
    isLive: true,
  },
]

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed')
  const [newPost, setNewPost] = useState('')
  const [postsState, setPostsState] = useState(posts)

  const handleLike = (postId: string) => {
    setPostsState(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
        }
      }
      return post
    }))
  }

  const handleSave = (postId: string) => {
    setPostsState(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, isSaved: !post.isSaved }
      }
      return post
    }))
  }

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Cộng đồng <span className="gradient-text">Mystic</span>
            </h1>
            <p className="text-muted-foreground">
              Chia sẻ, học hỏi và kết nối với những người yêu thích Tarot
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-2 mb-6 overflow-x-auto hide-scrollbar"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all',
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-white/5 text-muted-foreground border border-white/10 hover:bg-white/10'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'live' && (
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-4">
                  <Textarea
                    placeholder="Chia sẻ suy nghĩ của bạn..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[80px] bg-white/5 border-white/10 focus:border-purple-500/50 resize-none mb-3"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        📷 Ảnh
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground">
                        😊 Emoji
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      disabled={!newPost.trim()}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Đăng
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Posts */}
              {postsState.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <GlassCard className="p-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {post.author.avatar ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-500/30">
                            <Image
                              src={post.author.avatar}
                              alt={post.author.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <span className="text-lg">🔮</span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-foreground">{post.author.name}</span>
                            {post.author.isVerified && (
                              <span className="text-blue-400">✓</span>
                            )}
                            {post.author.isReader && (
                              <span className="px-1.5 py-0.5 text-[10px] rounded bg-purple-500/20 text-purple-300">
                                Reader
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {post.createdAt}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </div>

                    {/* Post Content */}
                    <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={cn(
                            'flex items-center gap-1.5 text-sm transition-colors',
                            post.isLiked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
                          )}
                        >
                          <Heart className={cn('w-5 h-5', post.isLiked && 'fill-current')} />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-purple-400 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                          <Share2 className="w-5 h-5" />
                          {post.shares}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSave(post.id)}
                        className={cn(
                          'text-muted-foreground hover:text-yellow-400 transition-colors',
                          post.isSaved && 'text-yellow-400'
                        )}
                      >
                        <Bookmark className={cn('w-5 h-5', post.isSaved && 'fill-current')} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Live Streams */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Radio className="w-5 h-5 text-red-400" />
                    <h3 className="font-semibold text-foreground">Đang Live</h3>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-3">
                    {liveStreams.map((stream) => (
                      <div
                        key={stream.id}
                        className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-red-500/50">
                            <Image
                              src={stream.reader.avatar}
                              alt={stream.reader.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="absolute -bottom-0.5 -right-0.5 px-1 py-0.5 text-[8px] bg-red-500 text-white rounded font-medium">
                            LIVE
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground text-sm truncate">
                            {stream.reader.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {stream.title}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {stream.viewers}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              {/* Trending Topics */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GlassCard className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-foreground">Xu hướng</h3>
                  </div>
                  <div className="space-y-2">
                    {['#TarotTinhYeu', '#NewMoon', '#TheTower', '#HealingJourney', '#DailyReading'].map((tag, i) => (
                      <button
                        key={tag}
                        className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-purple-500/10 text-purple-300 text-sm transition-colors"
                      >
                        {tag}
                        <span className="text-xs text-muted-foreground ml-2">
                          {1234 - i * 200} posts
                        </span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileNav />
    </>
  )
}

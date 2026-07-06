'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Mail, Sparkles, LogOut, LayoutDashboard, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/layout/notification-bell'

const navLinks = [
  { href: '/readers', label: 'Readers' },
  { href: '/ai-tarot', label: 'AI Tarot', icon: Sparkles },
  { href: '/community', label: 'Cộng đồng' },
  { href: '/about', label: 'Về chúng tôi' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [messageUnreadCount, setMessageUnreadCount] = useState(0)
  const { openLogin, openRegister, user, isLoadingUser, logout } = useAuthModal()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!user) {
      setMessageUnreadCount(0)
      return
    }

    // Khi đang ở trang chat, badge không cần hiển thị (user đang đọc)
    if (pathname.startsWith('/chat')) {
      setMessageUnreadCount(0)
      return
    }

    let isActive = true

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/conversations/unread-count')
        if (!res.ok) return
        const data = await res.json()
        if (isActive) setMessageUnreadCount(data.count ?? 0)
      } catch {
        // Ignore optional fetch failures.
      }
    }

    fetchUnreadCount()
    // Poll mỗi 5 giây để badge cập nhật gần realtime
    const interval = window.setInterval(fetchUnreadCount, 5_000)

    // Fetch ngay khi user tab back vào trang
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchUnreadCount()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isActive = false
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [user, pathname])

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10'
          : 'bg-background/95 border-b border-white/10'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#768064] via-[#4C583E] to-[#2C3424] flex items-center justify-center">
                  <span className="text-2xl">☽</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-[#768064]/25 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">SAGETO</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Link key={link.href} href={link.href}
                    className={cn(
                      'text-sm transition-colors flex items-center gap-1.5 relative',
                      isActive
                        ? 'text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    )}>
                    {link.icon && <link.icon className={cn('w-4 h-4', isActive ? 'text-[#768064]' : 'text-[#768064]/60')} />}
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#768064] to-[#2C3424] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>

              {!isLoadingUser && user && (
                <Link href="/chat" className="relative">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Mail className="w-5 h-5" />
                    {messageUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1 leading-none">
                        {messageUnreadCount > 99 ? '99+' : messageUnreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {!isLoadingUser && user && (
                <NotificationBell />
              )}

              {isLoadingUser ? (
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              ) : user ? (
                <UserMenu user={user} onLogout={logout} />
              ) : (
                <>
                  <Button variant="ghost" onClick={() => openLogin()}
                    className="text-muted-foreground hover:text-foreground">
                    Đăng nhập
                  </Button>
                  <Button onClick={openRegister} className={cn(
                    'bg-gradient-to-r from-[#768064] to-[#4C583E]',
                    'hover:from-[#5f7154] hover:to-[#3f4f34]',
                    'text-white shadow-lg shadow-[#768064]/25')}>
                    Đăng ký
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden">
            <div className="bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
              <nav className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                  return (
                    <Link key={link.href} href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 py-3 px-4 rounded-xl transition-colors',
                        isActive
                          ? 'text-foreground font-semibold bg-[#768064]/10'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                      )}>
                      {link.icon && <link.icon className={cn('w-5 h-5', isActive ? 'text-[#768064]' : 'text-[#768064]/60')} />}
                      {link.label}
                    </Link>
                  )
                })}

                <div className="pt-4 border-t border-white/10 space-y-3">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2">
                        <UserAvatar user={user} size={36} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Dashboard</Button>
                      </Link>
                      <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => { logout(); setIsMobileMenuOpen(false) }}>
                        Đăng xuất
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full"
                        onClick={() => { openLogin(); setIsMobileMenuOpen(false) }}>
                        Đăng nhập
                      </Button>
                      <Button onClick={() => { openRegister(); setIsMobileMenuOpen(false) }}
                        className={cn('w-full bg-gradient-to-r from-[#768064] to-[#4C583E]',
                          'hover:from-[#5f7154] hover:to-[#3f4f34]', 'text-white')}>
                        Đăng ký miễn phí
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── User Avatar ──────────────────────────────────────────────────────────────
function UserAvatar({ user, size = 32 }: { user: { name: string; avatar: string | null }; size?: number }) {
  if (user.avatar) {
    return (
      <div className="rounded-full overflow-hidden ring-2 ring-[#768064]/40 shrink-0"
        style={{ width: size, height: size }}>
        <Image src={user.avatar} alt={user.name} width={size} height={size} className="object-cover" />
      </div>
    )
  }
  return (
    <div className="rounded-full bg-gradient-to-br from-[#768064] via-[#4C583E] to-[#2C3424] flex items-center justify-center shrink-0 ring-2 ring-[#768064]/40"
      style={{ width: size, height: size }}>
      <span className="text-white font-semibold" style={{ fontSize: size * 0.4 }}>
        {user.name.charAt(0).toUpperCase()}
      </span>
    </div>
  )
}

// ─── User Dropdown Menu ───────────────────────────────────────────────────────
function UserMenu({ user, onLogout }: { user: { name: string; email: string; avatar: string | null }; onLogout: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#768064]/50">
          <UserAvatar user={user} size={36} />
          <span className="text-sm font-medium text-foreground hidden xl:block max-w-[120px] truncate">
            {user.name}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-xl border-white/10">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="w-4 h-4" /> Hồ sơ
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem onClick={onLogout}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

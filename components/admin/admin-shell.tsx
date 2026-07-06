'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Calendar, CreditCard, Banknote,
  Settings, LogOut, Menu, X, ChevronRight, UserCheck, Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'
import type { JWTPayload } from '@/lib/auth'

const NAV = [
  { href: '/admin/dashboard',   label: 'Dashboard',            icon: LayoutDashboard },
  { href: '/admin/users',       label: 'Người dùng',           icon: Users },
  { href: '/admin/readers',     label: 'Duyệt Reader',         icon: UserCheck },
  { href: '/admin/bookings',    label: 'Lịch hẹn',             icon: Calendar },
  { href: '/admin/payments',    label: 'Thanh toán',           icon: CreditCard },
  { href: '/admin/withdrawals', label: 'Giải ngân & Rút tiền', icon: Banknote },
  { href: '/admin/specialties', label: 'Chủ đề',               icon: Sparkles },
]

export function AdminShell({ children, session }: { children: React.ReactNode; session: JWTPayload }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuthModal()

  const Sidebar = ({ mobile = false }) => (
    <aside className={cn(
      'flex flex-col h-full bg-card border-r border-white/10',
      mobile ? 'w-full' : 'w-60'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center text-lg">☽</div>
        <div>
          <div className="text-sm font-bold gradient-text">SageTo</div>
          <div className="text-[11px] text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-[#768064]/20 text-[#4C583E]' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}>
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="p-3 border-t border-white/10 space-y-0.5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#768064] to-[#4C583E] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {session.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground truncate">{session.name}</div>
            <div className="text-[11px] text-muted-foreground">Administrator</div>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut className="w-4 h-4" /> Đăng xuất
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-50 w-60">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-72">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/10 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-sm text-muted-foreground hidden sm:block">{session.email}</div>
        </header>

        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

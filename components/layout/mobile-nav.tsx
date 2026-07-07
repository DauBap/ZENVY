'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Users, Sparkles, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthModal } from '@/contexts/auth-modal-context'

const navItems = [
  { href: '/readers',   label: 'Readers',    icon: Users,         protected: false },
  { href: '/ai-tarot',  label: 'AI Tarot',   icon: Sparkles,      protected: false },
  { href: '/chat',      label: 'Chat',       icon: MessageSquare, protected: true  },
  { href: '/dashboard', label: 'Tài khoản',  icon: User,          protected: true  },
]

export function MobileNav() {
  const pathname = usePathname()
  const { user, openLogin } = useAuthModal()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-[#DADED8]/90 backdrop-blur-xl border-t border-[#DADED8]/40 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            const handleClick = (e: React.MouseEvent) => {
              if (item.protected && !user) {
                e.preventDefault()
                openLogin()
              }
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleClick}
                className="relative flex flex-col items-center justify-center gap-1 w-16 h-full"
              >
                <div className="relative">
                  <item.icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-[#768064]' : 'text-muted-foreground'
                    )}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -inset-2 bg-[#768064]/10 rounded-xl -z-10"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                </div>
                <span className={cn(
                  'text-[10px] font-medium transition-colors',
                  isActive ? 'text-[#768064]' : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

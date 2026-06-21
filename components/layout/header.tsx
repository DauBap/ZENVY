'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, Bell, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/readers', label: 'Readers' },
  { href: '/ai-tarot', label: 'AI Tarot', icon: Sparkles },
  { href: '/community', label: 'Cộng đồng' },
  { href: '/about', label: 'Về chúng tôi' },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/10'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-2xl">☽</span>
                </div>
                <div className="absolute inset-0 rounded-xl bg-purple-500/50 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                ZENVY
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  {link.icon && <link.icon className="w-4 h-4 text-purple-400" />}
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  className={cn(
                    'bg-gradient-to-r from-purple-600 to-indigo-600',
                    'hover:from-purple-500 hover:to-indigo-500',
                    'text-white shadow-lg shadow-purple-500/25'
                  )}
                >
                  Đăng ký
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-16 z-40 lg:hidden"
          >
            <div className="bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-xl">
              <nav className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 py-3 px-4 rounded-xl text-foreground hover:bg-white/5 transition-colors"
                  >
                    {link.icon && <link.icon className="w-5 h-5 text-purple-400" />}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button
                      className={cn(
                        'w-full bg-gradient-to-r from-purple-600 to-indigo-600',
                        'hover:from-purple-500 hover:to-indigo-500',
                        'text-white'
                      )}
                    >
                      Đăng ký miễn phí
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

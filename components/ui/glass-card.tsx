'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: 'purple' | 'gold' | 'blue' | 'olive' | 'none'
}

export function GlassCard({
  children,
  className,
  hover = true,
  glow = 'none',
  ...props
}: GlassCardProps) {
  const glowStyles = {
    purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]',
    olive: 'hover:shadow-[0_0_30px_rgba(165,179,139,0.3)]',
    gold: 'hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]',
    blue: 'hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]',
    none: '',
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-card/85 backdrop-blur-xl shadow-[0_12px_36px_-24px_rgba(44,52,36,0.28)]',
        'border border-[var(--border)]',
        hover && 'transition-all duration-300 hover:bg-card hover:border-[var(--ring)]',
        glowStyles[glow],
        className
      )}
      whileHover={hover ? { y: -4 } : undefined}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function GlassCardShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 -translate-x-full',
        'bg-gradient-to-r from-transparent via-white/10 to-transparent',
        'animate-[shimmer_2s_infinite]',
        className
      )}
    />
  )
}

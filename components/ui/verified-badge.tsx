'use client'

import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function VerifiedBadge({
  size = 'md',
  showText = false,
  className,
}: VerifiedBadgeProps) {
  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <CheckCircle
        className={cn(
          sizes[size],
          'text-blue-400 fill-blue-400/20'
        )}
      />
      {showText && (
        <span className={cn(textSizes[size], 'text-blue-400')}>
          Verified
        </span>
      )}
    </div>
  )
}

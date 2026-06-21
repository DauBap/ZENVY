'use client'

import { cn } from '@/lib/utils'

interface OnlineIndicatorProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function OnlineIndicator({
  isOnline,
  size = 'md',
  showText = false,
  className,
}: OnlineIndicatorProps) {
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className="relative flex">
        <span
          className={cn(
            sizes[size],
            'rounded-full',
            isOnline ? 'bg-green-500' : 'bg-gray-500'
          )}
        />
        {isOnline && (
          <span
            className={cn(
              sizes[size],
              'absolute inline-flex rounded-full bg-green-400 opacity-75 animate-ping'
            )}
          />
        )}
      </span>
      {showText && (
        <span
          className={cn(
            textSizes[size],
            isOnline ? 'text-green-400' : 'text-gray-400'
          )}
        >
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}

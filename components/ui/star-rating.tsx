'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const sizes = {
    sm: 'w-3 h-3',
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
      <div className="flex items-center">
        {Array.from({ length: maxRating }).map((_, index) => {
          const filled = index < Math.floor(rating)
          const partial = index === Math.floor(rating) && rating % 1 > 0

          return (
            <div key={index} className="relative">
              <Star
                className={cn(
                  sizes[size],
                  'text-gray-600'
                )}
              />
              {(filled || partial) && (
                <Star
                  className={cn(
                    sizes[size],
                    'absolute inset-0 text-yellow-400 fill-yellow-400',
                    partial && 'clip-path-[inset(0_50%_0_0)]'
                  )}
                  style={partial ? { clipPath: `inset(0 ${100 - (rating % 1) * 100}% 0 0)` } : undefined}
                />
              )}
            </div>
          )
        })}
      </div>
      {showValue && (
        <span className={cn('text-foreground font-medium ml-1', textSizes[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

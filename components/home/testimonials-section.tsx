'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Quote } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { StarRating } from '@/components/ui/star-rating'
import { VerifiedBadge } from '@/components/ui/verified-badge'
import type { SerializedTestimonial } from '@/lib/serializers'

interface TestimonialsSectionProps {
  testimonials: SerializedTestimonial[]
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { once: true, margin: '-100px' })

  return (
    <section className="py-16 lg:py-24 relative" ref={containerRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Người dùng <span className="gradient-text">nói gì</span> về chúng tôi
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hàng ngàn người đã tìm thấy sự rõ ràng và guidance thông qua ZENVY
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 h-full flex flex-col" glow="purple">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-purple-400/50 mb-4" />

                {/* Rating */}
                <StarRating rating={testimonial.rating} size="sm" className="mb-4" />

                {/* Comment */}
                <p className="text-sm text-foreground leading-relaxed flex-grow mb-6">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.userAvatar}
                      alt={testimonial.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">
                        {testimonial.userName}
                      </span>
                      {testimonial.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Reader: {testimonial.readerName}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 flex-wrap justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">98%</div>
              <div className="text-sm text-muted-foreground">Hài lòng</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">4.9★</div>
              <div className="text-sm text-muted-foreground">Rating TB</div>
            </div>
            <div className="w-px h-12 bg-white/10 hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold gradient-text">156K+</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

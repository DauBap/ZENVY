'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Search, SlidersHorizontal, X, Star, Sparkles,
  ChevronLeft, ChevronRight, ArrowRight, ArrowUpDown,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthModal } from '@/contexts/auth-modal-context'
import { ReaderCard } from '@/components/reader-card'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

type SortBy = 'newest' | 'rating' | 'price_asc' | 'price_desc'

interface ReadersPageProps {
  readers: SerializedReader[]
  specialties: string[]
}

// ─── Horizontal scroll section ────────────────────────────────────────────────
function ReaderScrollSection({
  title, icon, readers, badge, delay = 0, onViewAll,
}: {
  title: string
  icon: React.ReactNode
  readers: SerializedReader[]
  badge?: string
  delay?: number
  onViewAll: () => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // Kiểm tra scroll state khi component mount hoặc readers thay đổi
  useEffect(() => {
    updateScrollState()
    // Delay để đảm bảo DOM đã render
    const timer = setTimeout(updateScrollState, 100)
    return () => clearTimeout(timer)
  }, [readers])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
    setTimeout(updateScrollState, 350)
  }

  if (readers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mb-12"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
          </div>
          {badge && (
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#768064]/20 text-[#4C583E] border border-[#768064]/30">
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={cn(
              'w-8 h-8 rounded-full border flex items-center justify-center transition-all',
              canScrollLeft
                ? 'bg-white/10 border-white/30 text-foreground hover:text-white hover:bg-black/15'
                : 'bg-black/[0.05] border-white/10 text-black/30 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={cn(
              'w-8 h-8 rounded-full border flex items-center justify-center transition-all',
              canScrollRight
                ? 'bg-white/10 border-white/30 text-foreground hover:text-white hover:bg-black/15'
                : 'bg-black/[0.05] border-white/10 text-black/30 cursor-not-allowed'
            )}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-4 pb-3"
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          paddingTop: '8px',
        }}
      >
        {readers.map((reader, index) => (
          <div key={reader.id} className="shrink-0 w-[150px] sm:w-[168px]">
            <ReaderCard reader={reader} index={index} />
          </div>
        ))}
      </div>

      {/* Xem tất cả */}
      <div className="flex justify-center mt-5">
        <button
          onClick={onViewAll}
          className={cn(
            'flex items-center gap-2 px-8 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap',
            'bg-white/5 border border-white/10 text-muted-foreground',
            'hover:bg-[#768064]/10 hover:border-[#768064]/30 hover:text-[#4C583E]'
          )}
        >
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── Sort options ─────────────────────────────────────────────────────────────
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'rating',     label: 'Rating cao nhất' },
  { value: 'price_asc',  label: 'Giá thấp nhất' },
  { value: 'price_desc', label: 'Giá cao nhất' },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export function ReadersPage({ readers: initialReaders, specialties }: ReadersPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const searchParams = useSearchParams()
  const { openLogin, user } = useAuthModal()

  // Online status polling — cập nhật mỗi 30s mà không reload trang
  const [onlineMap, setOnlineMap] = useState<Record<number, boolean>>({})
  useEffect(() => {
    const fetchOnline = () => {
      fetch('/api/readers/online-status')
        .then(r => r.json())
        .then((data: Record<number, boolean>) => setOnlineMap(data))
        .catch(() => {})
    }
    fetchOnline()
    const id = setInterval(fetchOnline, 30_000)
    return () => clearInterval(id)
  }, [])

  // Merge online status vào readers
  const readers = initialReaders.map(r => ({
    ...r,
    isOnline: onlineMap[r.id] ?? r.isOnline,
  }))

  // Tự mở login modal khi redirect từ trang protected (?login=1)
  useEffect(() => {
    if (searchParams.get('login') === '1' && !user) {
      openLogin()
    }
  }, [searchParams, user, openLogin])
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)

  const allSectionRef = useRef<HTMLDivElement>(null)

  // Section previews
  const newReaders = [...readers].sort((a, b) => b.id - a.id).slice(0, 10)
  const featuredReaders = [...readers]
    .filter((reader) => reader.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20)

  // Scroll to all-readers section + apply sort
  const handleViewAll = (sort: SortBy) => {
    setSortBy(sort)
    setTimeout(() => {
      allSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // Filter + sort
  const filteredReaders = readers
    .filter((reader) => {
      const matchesSearch =
        reader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reader.bio.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSpecialty =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some((spec) => reader.specialty.includes(spec))
      const matchesOnline = !showOnlineOnly || reader.isOnline
      return matchesSearch && matchesSpecialty && matchesOnline
    })
    .sort((a, b) => {
      if (sortBy === 'newest')     return b.id - a.id
      if (sortBy === 'rating')     return b.rating - a.rating
      if (sortBy === 'price_asc')  return a.pricePerSession - b.pricePerSession
      if (sortBy === 'price_desc') return b.pricePerSession - a.pricePerSession
      return 0
    })

  const hasActiveFilters = searchQuery || selectedSpecialties.length > 0 || showOnlineOnly

  const toggleSpecialty = (spec: string) =>
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSpecialties([])
    setShowOnlineOnly(false)
    setSortBy('newest')
  }

  const handleSortMenuToggle = () => {
    setShowSortMenu(prev => !prev)
  }

  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label

  return (
    <>
      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Tìm <span className="gradient-text">Tarot Reader</span> của bạn
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {readers.filter(r => r.isVerified).length}+ Readers được xác minh. Đặt lịch ngay hôm nay.
            </p>
          </motion.div>

          {/* Reader Mới */}
          <ReaderScrollSection
            title="GESIGN"
            icon={<Sparkles className="w-5 h-5 text-[#4C583E]" />}
            readers={newReaders}
            badge="Mới tham gia"
            delay={0.1}
            onViewAll={() => handleViewAll('newest')}
          />

          {/* Reader Nổi Bật */}
          <ReaderScrollSection
            title="Reader Nổi Bật"
            icon={<Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
            readers={featuredReaders}
            badge="Top rating"
            delay={0.2}
            onViewAll={() => handleViewAll('rating')}
          />

          {/* ── Divider + anchor ── */}
          <div ref={allSectionRef} className="flex items-center gap-4 mb-8 scroll-mt-24">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-sm text-muted-foreground px-3 whitespace-nowrap">Tất cả Readers</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Search + Filter + Sort */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-6 relative z-10">
            <GlassCard className="p-4 overflow-visible">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mô tả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-[var(--border)] focus:border-[var(--ring)]"
                  />
                </div>
                <div className="flex gap-3 flex-wrap relative">
                  {/* Sort dropdown */}
                  <div className="relative">
                    <Button
                      variant="outline"
                      onClick={handleSortMenuToggle}
                      className={cn('border-[var(--border)] gap-2', showSortMenu && 'bg-[#768064]/20 border-[#768064]/30 text-[#768064]')}
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      {activeSortLabel}
                    </Button>

                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-2 w-44 z-[200] rounded-lg bg-background border border-[var(--border)] shadow-2xl overflow-hidden">
                        {SORT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setShowSortMenu(false) }}
                            className={cn(
                              'w-full text-left px-4 py-2.5 text-sm transition-colors',
                              sortBy === opt.value
                                ? 'bg-[#768064]/20 text-[#4C583E]'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button variant="outline"
                    onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                    className={cn('border-white/10', showOnlineOnly && 'bg-green-500/20 border-green-500/30 text-green-400')}>
                    <span className={cn('w-2 h-2 rounded-full mr-2', showOnlineOnly ? 'bg-green-500' : 'bg-gray-500')} />
                    Online
                  </Button>

                  <Button variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn('border-white/10', showFilters && 'bg-[#768064]/20 border-[#768064]/30 text-[#768064]')}>
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-4 border-t border-white/10">
                  <div className="mb-2 text-sm text-muted-foreground">Chuyên môn:</div>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <button key={spec} onClick={() => toggleSpecialty(spec)}
                        className={cn('px-3 py-1.5 text-sm rounded-full border transition-all',
                          selectedSpecialties.includes(spec)
                            ? 'bg-[#768064]/20 border-[#768064]/50 text-[#4C583E]'
                            : 'bg-white/5 border-[var(--border)] text-muted-foreground hover:border-[#768064]/30')}>
                        {spec}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          {/* Count */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <p className="text-sm text-muted-foreground">
              Hiển thị <span className="text-foreground font-medium">{filteredReaders.length}</span> readers
              {sortBy !== 'newest' && (
                <span className="ml-2 text-[#768064]">· {activeSortLabel}</span>
              )}
            </p>
            {selectedSpecialties.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedSpecialties.map((spec) => (
                  <span key={spec} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-[#768064]/20 text-[#4C583E] border border-[#768064]/30">
                    {spec}
                    <button onClick={() => toggleSpecialty(spec)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pt-2">
            {filteredReaders.map((reader, index) => (
              <ReaderCard key={reader.id} reader={reader} index={index} />
            ))}
          </div>

          {filteredReaders.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="text-6xl mb-4">🔮</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Không tìm thấy Reader</h3>
              <p className="text-muted-foreground mb-6">Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
              <Button onClick={clearFilters} variant="outline">Xóa bộ lọc</Button>
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}

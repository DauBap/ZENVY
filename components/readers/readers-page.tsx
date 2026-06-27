'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReaderCard } from '@/components/reader-card'
import { cn } from '@/lib/utils'
import type { SerializedReader } from '@/lib/serializers'

interface ReadersPageProps {
  readers: SerializedReader[]
  specialties: string[]
}

export function ReadersPage({ readers, specialties }: ReadersPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filteredReaders = readers.filter((reader) => {
    const matchesSearch =
      reader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reader.bio.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesSpecialty =
      selectedSpecialties.length === 0 ||
      selectedSpecialties.some((spec) => reader.specialty.includes(spec))

    const matchesOnline = !showOnlineOnly || reader.isOnline

    return matchesSearch && matchesSpecialty && matchesOnline
  })

  const toggleSpecialty = (spec: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSpecialties([])
    setShowOnlineOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedSpecialties.length > 0 || showOnlineOnly

  return (
    <>
      <CosmicBackground />
      <Header />

      <main className="relative min-h-screen pt-20 lg:pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
              Tìm <span className="gradient-text">Tarot Reader</span> của bạn
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Khám phá {readers.length}+ Readers được xác minh. Lọc theo specialty, rating và trạng thái online.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <GlassCard className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên hoặc mô tả..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowOnlineOnly(!showOnlineOnly)}
                    className={cn(
                      'border-white/10',
                      showOnlineOnly && 'bg-green-500/20 border-green-500/30 text-green-400'
                    )}
                  >
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        showOnlineOnly ? 'bg-green-500' : 'bg-gray-500'
                      )}
                    />
                    Online
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      'border-white/10',
                      showFilters && 'bg-purple-500/20 border-purple-500/30 text-purple-400'
                    )}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Bộ lọc
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-white/10"
                >
                  <div className="mb-2 text-sm text-muted-foreground">Chuyên môn:</div>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((spec) => (
                      <button
                        key={spec}
                        onClick={() => toggleSpecialty(spec)}
                        className={cn(
                          'px-3 py-1.5 text-sm rounded-full border transition-all',
                          selectedSpecialties.includes(spec)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-muted-foreground hover:border-purple-500/30'
                        )}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </GlassCard>
          </motion.div>

          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Hiển thị {filteredReaders.length} readers</p>
            {selectedSpecialties.length > 0 && (
              <div className="flex gap-2">
                {selectedSpecialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  >
                    {spec}
                    <button onClick={() => toggleSpecialty(spec)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <Footer />
      <MobileNav />
    </>
  )
}

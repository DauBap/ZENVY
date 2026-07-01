'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioPlayerProps {
  src: string
  className?: string
  compact?: boolean // compact = dùng trong chat bubble
}

export function AudioPlayer({ src, className, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrentTime(el.currentTime)
    const onMeta = () => setDuration(el.duration)
    const onEnd  = () => { setPlaying(false); setCurrentTime(0) }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('ended', onEnd)
    }
  }, [src])

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) { el.pause(); setPlaying(false) }
    else { el.play(); setPlaying(true) }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current
    if (!el) return
    el.currentTime = Number(e.target.value)
    setCurrentTime(Number(e.target.value))
  }

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={cn(
      'flex items-center gap-2.5 rounded-xl px-3 py-2',
      'bg-white/5 border border-white/10 backdrop-blur-sm',
      compact ? 'min-w-[180px] max-w-[220px]' : 'w-full',
      className
    )}>
      <audio ref={audioRef} src={src} muted={muted} preload="metadata" />

      {/* Play/Pause */}
      <button
        onClick={togglePlay}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all',
          'bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500',
          'shadow-md shadow-purple-500/30 text-white'
        )}
      >
        {playing
          ? <Pause className="w-3.5 h-3.5 fill-white" />
          : <Play className="w-3.5 h-3.5 fill-white ml-0.5" />}
      </button>

      {/* Progress + time */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
          {/* fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* scrubber */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={seek}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{fmt(currentTime)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Mute */}
      {!compact && (
        <button
          onClick={() => { setMuted(m => !m); if (audioRef.current) audioRef.current.muted = !muted }}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      )}
    </div>
  )
}

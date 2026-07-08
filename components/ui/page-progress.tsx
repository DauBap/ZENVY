'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function Bar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clear = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const finish = () => {
    clear()
    setProgress(100)
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 400)
  }

  useEffect(() => {
    clear()
    setProgress(0)
    setVisible(true)

    let val = 0
    intervalRef.current = setInterval(() => {
      val += (90 - val) * 0.08
      setProgress(Math.min(val, 90))
    }, 80)

    // Finish after short delay — page data is already available (RSC)
    timerRef.current = setTimeout(finish, 300)

    return clear
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  if (!visible) return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[2px] pointer-events-none"
      style={{
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #768064, #4C583E)',
        transition: progress === 100 ? 'width 0.15s ease-out' : 'width 0.08s linear',
        opacity: 1,
        boxShadow: '0 0 8px rgba(118,128,100,0.5)',
      }}
    />
  )
}

export function PageProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  )
}

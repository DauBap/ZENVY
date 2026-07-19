import { Suspense } from 'react'
import { Header } from '@/components/layout/header'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { BookingReturnClient } from '@/components/booking/booking-return-client'

export const dynamic = 'force-dynamic'

export default function BookingReturnPage() {
  return (
    <>
      <CosmicBackground />
      <Header />
      <main className="relative min-h-screen pt-20 pb-24 flex items-center justify-center">
        <Suspense fallback={null}>
          <BookingReturnClient />
        </Suspense>
      </main>
    </>
  )
}

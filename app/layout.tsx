import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthModalProvider } from '@/contexts/auth-modal-context'
import { AuthModal } from '@/components/auth/auth-modal'
import { NotificationToast } from '@/components/layout/notification-toast'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
})

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
})

export const metadata: Metadata = {
  title: 'ZENVY | Nền Tảng Booking Tarot Cao Cấp',
  description: 'Kết nối với các Tarot Reader được xác minh. Đặt lịch tư vấn, chat realtime, và khám phá AI Tarot miễn phí.',
  keywords: ['tarot', 'booking', 'tarot reader', 'tư vấn tarot', 'xem bói', 'bói bài'],
  authors: [{ name: 'ZENVY' }],
  creator: 'ZENVY',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://mystic-tarot.app',
    title: 'ZENVY | Nền Tảng Booking Tarot Cao Cấp',
    description: 'Kết nối với các Tarot Reader được xác minh',
    siteName: 'ZENVY',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZENVY',
    description: 'Nền Tảng Booking Tarot Cao Cấp',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0f0a1a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <AuthModalProvider>
          {children}
          <AuthModal />
          <NotificationToast />
          <Toaster />
        </AuthModalProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

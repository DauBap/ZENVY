import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthModalProvider } from '@/contexts/auth-modal-context'
import { AuthModal } from '@/components/auth/auth-modal'
import { NotificationToast } from '@/components/layout/notification-toast'
import { Toaster } from '@/components/ui/sonner'
import { PageProgress } from '@/components/ui/page-progress'
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
  metadataBase: new URL('https://sageto.net'),
  title: {
    default: 'SAGETO | Xem Tarot Online & Đặt Lịch Reader Chuyên Nghiệp',
    template: '%s | SAGETO',
  },
  description: 'Xem tarot online, đặt lịch tư vấn tình yêu và sự nghiệp với Tarot Reader được xác minh. Trải nghiệm AI Tarot miễn phí tại SAGETO.',
  keywords: ['xem tarot online', 'đặt lịch tarot', 'booking tarot', 'tarot reader', 'AI tarot'],
  authors: [{ name: 'SAGETO' }],
  creator: 'SAGETO',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f0a1a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable} bg-background`} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SAGETO" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <AuthModalProvider>
          <PageProgress />
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

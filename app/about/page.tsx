import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CosmicBackground } from '@/components/ui/floating-elements'
import { AboutPage } from '@/components/about/about-page'

export const metadata = {
  title: 'Về Chúng Tôi | SAGETO',
  description: 'SAGETO — nền tảng kết nối bạn với các Tarot Reader được xác minh, mang đến sự rõ ràng và insight cho cuộc sống.',
}

export default function AboutRoutePage() {
  return (
    <>
      <CosmicBackground />
      <Header />
      <AboutPage />
      <Footer />
      <MobileNav />
    </>
  )
}

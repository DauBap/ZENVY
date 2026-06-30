'use client'

import Link from 'next/link'
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  company: [
    { label: 'Về chúng tôi', href: '/about' },
    { label: 'Đội ngũ', href: '/team' },
    { label: 'Tuyển dụng', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  support: [
    { label: 'Trung tâm hỗ trợ', href: '/help' },
    { label: 'Liên hệ', href: '/contact' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Phản hồi', href: '/feedback' },
  ],
  legal: [
    { label: 'Điều khoản sử dụng', href: '/terms' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Chính sách hoàn tiền', href: '/refund' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
  readers: [
    { label: 'Trở thành Reader', href: '/become-reader' },
    { label: 'Reader Dashboard', href: '/reader-dashboard' },
    { label: 'Hướng dẫn Reader', href: '/reader-guide' },
    { label: 'Cộng đồng Reader', href: '/reader-community' },
  ],
}

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'Youtube' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
]

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Main Footer */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-2xl">☽</span>
              </div>
              <span className="text-xl font-bold gradient-text">ZENVY</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Nền tảng kết nối Tarot Reader hàng đầu Việt Nam. 
              Tìm kiếm sự rõ ràng trong cuộc sống với các chuyên gia được xác minh.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>support@mystic-tarot.app</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Đà Nẵng, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Công ty</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Pháp lý</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Readers</h3>
            <ul className="space-y-2">
              {footerLinks.readers.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 ZENVY. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

import './globals.css';
import AppChrome from '@/components/AppChrome';

export const metadata = {
  title: 'Zenvy - Nền tảng Tarot',
  description: 'Kết nối với các tarot reader',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}

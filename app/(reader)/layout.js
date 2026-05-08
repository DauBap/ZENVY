'use client';

import Link from 'next/link';
import { getRole } from '@/lib/roles';
import { useEffect, useState } from 'react';

export default function ReaderLayout({ children }) {
  const [role, setRole] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setRole(getRole());
  }, []);

  if (role !== 'reader') {
    return (
      <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', margin: '20px' }}>
        <p style={{ margin: 0 }}>
          ⚠️ Khu vực này chỉ dành cho Reader. Hãy đổi sang vai trò Reader bằng nút ở header.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: '100'
        }}
        className="sidebar-toggle-mobile"
      >
        {sidebarOpen ? '✕' : '☰'} Menu
      </button>

      {/* Sidebar */}
      <aside
        style={{
          backgroundColor: '#f5f5f5',
          padding: '20px',
          borderRadius: '4px',
          height: 'fit-content',
          position: 'sticky',
          top: '20px'
        }}
        className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}
      >
        <h3>Menu Reader</h3>
        <nav style={{ marginTop: '20px' }}>
          <Link href="/reader-dashboard" style={{ display: 'block', padding: '10px', marginBottom: '10px', backgroundColor: '#e3f2fd', borderRadius: '4px', textDecoration: 'none', color: '#0066cc' }} onClick={() => setSidebarOpen(false)}>
            Bảng điều khiển
          </Link>
          <Link href="/reader-profile" style={{ display: 'block', padding: '10px', marginBottom: '10px', textDecoration: 'none', color: '#0066cc' }} onClick={() => setSidebarOpen(false)}>
            Sửa hồ sơ
          </Link>
          <Link href="/reader-sessions" style={{ display: 'block', padding: '10px', marginBottom: '10px', textDecoration: 'none', color: '#0066cc' }} onClick={() => setSidebarOpen(false)}>
            Phiên
          </Link>
          <Link href="/reader-earnings" style={{ display: 'block', padding: '10px', marginBottom: '10px', textDecoration: 'none', color: '#0066cc' }} onClick={() => setSidebarOpen(false)}>
            Thu nhập
          </Link>
          <Link href="/reader-chat" style={{ display: 'block', padding: '10px', textDecoration: 'none', color: '#0066cc' }} onClick={() => setSidebarOpen(false)}>
            Tin nhắn
          </Link>
        </nav>
      </aside>

      <main>{children}</main>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 200px 1fr"] {
            grid-template-columns: 1fr !important;
          }

          .sidebar-toggle-mobile {
            display: block !important;
          }

          .sidebar {
            position: fixed !important;
            top: 0 !important;
            left: -250px !important;
            width: 250px !important;
            height: 100vh !important;
            z-index: 99 !important;
            transition: left 0.3s ease !important;
            padding: 80px 20px 20px 20px !important;
            overflow-y: auto !important;
          }

          .sidebar.mobile-open {
            left: 0 !important;
            box-shadow: 0 0 10px rgba(0,0,0,0.2) !important;
          }
        }
      `}</style>
    </div>
  );
}

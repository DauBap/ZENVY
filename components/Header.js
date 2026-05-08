'use client';

import Link from 'next/link';
import { getRole, setRole } from '@/lib/roles';
import { useState } from 'react';

export default function Header() {
  const role = getRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setMobileMenuOpen(false);
    window.location.href = '/';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header style={{ borderBottom: '1px solid #ccc', padding: '15px 20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>
            <Link href="/" style={{ textDecoration: 'none', color: '#000' }}>
              ✨ ZENVY
            </Link>
          </h1>
        </div>
      </div>

      
    </header>
  );
}

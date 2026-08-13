'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ isAdmin = false, user = null, onSignOut }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-brand">
          <div className="header-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="#2C3E50"/>
              <path d="M8 24V12L16 6L24 12V24H18V18H14V24H8Z" fill="#E67E22"/>
              <rect x="14" y="12" width="4" height="4" rx="0.5" fill="#2C3E50"/>
            </svg>
          </div>
          <div className="header-title-group">
            <span className="header-title">Sky Breeze</span>
            <span className="header-subtitle">Tikinti İzləmə Sistemi</span>
          </div>
        </Link>

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link href="/dashboard" className="header-nav-link">Dashboard</Link>
          {user ? (
            <>
              {user.email === 'kanan.gahramanov@seabreeze.az' && (
                <Link href="/admin" className="header-nav-link">Admin Panel</Link>
              )}
              <span className="header-user-badge" style={{ fontSize: '0.75rem', opacity: 0.8, color: 'var(--color-text-secondary, #666)' }}>
                {user.email}
              </span>
              <button onClick={onSignOut} className="header-nav-btn logout">Çıxış</button>
            </>
          ) : (
            <Link href="/" className="header-nav-link admin-link">Daxil ol</Link>
          )}
        </nav>

        <button
          className="header-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

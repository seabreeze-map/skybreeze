'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({
  isAdmin = false,
  user = null,
  onSignOut,
  period = null,
  onPeriodChange = null,
  onExportPDF = null
}) {
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

        {/* Top Period Switcher & Actions when in Dashboard */}
        {period && onPeriodChange && (
          <div className="header-period-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="period-segmented-control" style={{ padding: '3px', background: 'var(--color-bg)' }}>
              <button
                type="button"
                className={`period-segment-btn ${period === 'weekly' ? 'active' : ''}`}
                onClick={() => onPeriodChange('weekly')}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                📊 Həftəlik (Default)
              </button>
              <button
                type="button"
                className={`period-segment-btn ${period === 'monthly' ? 'active' : ''}`}
                onClick={() => onPeriodChange('monthly')}
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                🗓️ Aylıq
              </button>
            </div>

            {onExportPDF && (
              <button
                type="button"
                onClick={onExportPDF}
                className="btn btn--outline btn--sm no-print"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
                title="Səhifəni PDF kimi çap et və ya yüklə"
              >
                📄 PDF Yüklə
              </button>
            )}
          </div>
        )}

        <nav className={`header-nav ${mobileMenuOpen ? 'open' : ''}`}>
          {user ? (
            <>
              {user.email === 'kanan.gahramanov@seabreeze.az' ? (
                <>
                  <Link href="/dashboard" className="header-nav-link">Hesabat</Link>
                  <Link href="/admin" className="header-nav-link">Admin Panel</Link>
                </>
              ) : null}
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

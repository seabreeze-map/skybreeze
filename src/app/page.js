'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export default function PortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dateStr, setDateStr] = useState('');
  const [yearStr, setYearStr] = useState('');
  const router = useRouter();

  useEffect(() => {
    setLoaded(true);
    const now = new Date();
    const months = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avqust','sentyabr','oktyabr','noyabr','dekabr'];
    setDateStr(`${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()} | ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`);
    setYearStr(String(now.getFullYear()));
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setCheckingAuth(false);
      if (user) {
        if (user.email === 'kanan.gahramanov@seabreeze.az') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    });
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        setError('Email və ya parol səhvdir');
        setLoading(false);
        return;
      }

      // Admin → /admin, Guest → /dashboard
      const targetUrl = data.user?.email === 'kanan.gahramanov@seabreeze.az' ? '/admin' : '/dashboard';
      window.location.href = targetUrl;
    } catch (err) {
      console.error('Login error:', err);
      setError('Giriş zamanı xəta baş verdi');
      setLoading(false);
    }
  };

  return (
    <div className={`portal ${loaded ? 'portal--loaded' : ''}`}>
      {/* Full-screen background */}
      <div className="portal__bg">
        <img src="/hero-bg.jpg" alt="Sky Breeze Shahdag" />
        <div className="portal__overlay" />
      </div>

      {/* Main content: split layout */}
      <div className="portal__main">
        {/* Left: Branding */}
        <div className="portal__branding">
          <div className="portal__logo-wrap">
            <h1 className="portal__title">SKY BREEZE</h1>
            <div className="portal__subtitle">SHAHDAG</div>
            <div className="portal__tagline">
              <span className="portal__tagline-line" />
              <span>TİKİNTİ GEDİŞATI PORTALI</span>
              <span className="portal__tagline-line" />
            </div>
          </div>
        </div>

        {/* Right: Login card */}
        <div className="portal__form-area">
          <div className="portal__card">
            <h2 className="portal__card-title">Xoş gəlmisiniz!</h2>
            <p className="portal__card-desc">
              Tikinti işlərinin gedişatını izləmək üçün sistemə daxil olun.
            </p>

            {error && (
              <div className="portal__error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="portal__form">
              {/* Email */}
              <div className="portal__input-group">
                <svg className="portal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <input
                  type="email"
                  className="portal__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email ünvanınız"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="portal__input-group">
                <svg className="portal__input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="portal__input portal__input--password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifrəniz"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="portal__eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Şifrəni göstər"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Options */}
              <div className="portal__form-options">
                <label className="portal__checkbox-label">
                  <input
                    type="checkbox"
                    className="portal__checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="portal__checkbox-custom" />
                  Məni xatırla
                </label>
                <a href="#" className="portal__forgot-link">Şifrəni unutmusunuz?</a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="portal__submit"
                disabled={loading}
              >
                {loading ? (
                  <span className="portal__submit-spinner" />
                ) : null}
                {loading ? 'GİRİŞ EDİLİR...' : 'DAXİL OL'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="portal__footer">
        <div className="portal__footer-col">
          <span className="portal__status">
            <span className="portal__status-dot" />
            Sistem aktivdir
          </span>
          <span className="portal__footer-sub">Last update: {dateStr}</span>
        </div>
        <div className="portal__footer-col portal__footer-col--center">
          <span className="portal__footer-text">© {yearStr} Sky Breeze Shahdag</span>
          <span className="portal__footer-sub">Bütün hüquqlar qorunur.</span>
        </div>
        <div className="portal__footer-col portal__footer-col--right">
          <span className="portal__footer-text">v1.0.0</span>
          <Link href="/dashboard" className="portal__footer-link">📊 Gedişata baxış</Link>
        </div>
      </div>
    </div>
  );
}

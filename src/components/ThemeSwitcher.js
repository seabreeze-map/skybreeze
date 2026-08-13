'use client';
import { useState, useEffect, useRef } from 'react';

const THEMES = [
  {
    id: 'classic',
    name: 'Klassik',
    desc: 'Navy & narıncı tikinti teması',
    colors: ['#2C3E50', '#E67E22', '#ECF0F1', '#fff'],
  },
  {
    id: 'dark',
    name: 'Qaranlıq',
    desc: 'Müasir qaranlıq interfeys',
    colors: ['#0d1117', '#38bdf8', '#161b22', '#c9d1d9'],
  },
  {
    id: 'arctic',
    name: 'Buzlu',
    desc: 'Soyuq mavi tonlar',
    colors: ['#1e6091', '#7dd3fc', '#f0f7ff', '#fff'],
  },
  {
    id: 'earth',
    name: 'Torpaq',
    desc: 'İsti torpaq rəngləri',
    colors: ['#5D4037', '#D4A76A', '#FFF8F0', '#fff'],
  },
  {
    id: 'corporate',
    name: 'Korporativ',
    desc: 'Təmiz professional dizayn',
    colors: ['#1565C0', '#42A5F5', '#F5F7FA', '#fff'],
  },
];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('classic');
  const panelRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('sb-theme') || 'classic';
    setCurrent(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectTheme = (id) => {
    setCurrent(id);
    localStorage.setItem('sb-theme', id);
    document.documentElement.setAttribute('data-theme', id);
  };

  return (
    <div className="theme-switcher" ref={panelRef}>
      {/* Toggle Button */}
      <button
        className="theme-switcher__btn"
        onClick={() => setOpen(!open)}
        aria-label="Tema dəyiş"
        title="Tema dəyiş"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="2.5"/>
          <circle cx="17.5" cy="10.5" r="2.5"/>
          <circle cx="8.5" cy="7.5" r="2.5"/>
          <circle cx="6.5" cy="12.5" r="2.5"/>
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
        </svg>
      </button>

      {/* Panel */}
      <div className={`theme-switcher__panel ${open ? 'theme-switcher__panel--open' : ''}`}>
        <div className="theme-switcher__header">
          <span className="theme-switcher__title">Tema Seçimi</span>
          <button className="theme-switcher__close" onClick={() => setOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="theme-switcher__list">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              className={`theme-switcher__item ${current === theme.id ? 'theme-switcher__item--active' : ''}`}
              onClick={() => selectTheme(theme.id)}
            >
              <div className="theme-switcher__swatches">
                {theme.colors.map((c, i) => (
                  <span key={i} className="theme-switcher__swatch" style={{ background: c }} />
                ))}
              </div>
              <div className="theme-switcher__info">
                <span className="theme-switcher__name">{theme.name}</span>
                <span className="theme-switcher__desc">{theme.desc}</span>
              </div>
              {current === theme.id && (
                <svg className="theme-switcher__check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

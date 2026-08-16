'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PackageChart({ data = [], period = 'weekly' }) {
  const [hiddenKeys, setHiddenKeys] = useState([]);

  if (!data || data.length === 0) return null;

  const chartData = data.map(pkg => ({
    name: pkg.name.replace('Paket ', 'P').replace('Sky Breeze Cəmi', 'Cəmi'),
    fullName: pkg.name,
    Plan: pkg.plan,
    Fakt: pkg.fact,
    Kənarlaşma: pkg.currDeviation,
  }));

  const toggleKey = (key) => {
    setHiddenKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    const visiblePayload = payload.filter(p => !hiddenKeys.includes(p.dataKey));
    if (visiblePayload.length === 0) return null;

    const item = data.find(d => d.name.replace('Paket ', 'P').replace('Sky Breeze Cəmi', 'Cəmi') === label) || {};
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__title" style={{ fontWeight: 600, marginBottom: '6px' }}>{item.name || label}</p>
        {visiblePayload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            {p.name}: <strong>{p.value}%</strong>
          </p>
        ))}
        {item.currDeviation !== undefined && (
          <p style={{
            margin: '4px 0 0 0',
            paddingTop: '4px',
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            fontSize: '12px',
            color: item.currDeviation >= 0 ? '#27AE60' : '#E74C3C',
            fontWeight: 600
          }}>
            Kənarlaşma: {item.currDeviation >= 0 ? `+${item.currDeviation}%` : `${item.currDeviation}%`}
          </p>
        )}
        {item.trend && <p className="chart-tooltip__trend" style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>Trend: {item.trend}</p>}
      </div>
    );
  };

  const renderCustomLegend = () => {
    const items = [
      { key: 'Plan', name: 'Plan %', color: '#2980B9' },
      { key: 'Fakt', name: 'Fakt %', color: '#E67E22' },
    ];

    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', paddingTop: '10px', fontSize: '13px' }}>
        {items.map(item => {
          const isHidden = hiddenKeys.includes(item.key);
          return (
            <div
              key={item.key}
              onClick={() => toggleKey(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                userSelect: 'none',
                opacity: isHidden ? 0.35 : 1,
                textDecoration: isHidden ? 'line-through' : 'none',
                transition: 'all 0.2s ease',
              }}
              title={isHidden ? `${item.name} yandırmaq üçün klikləyin` : `${item.name} söndürmək üçün klikləyin`}
            >
              <span style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isHidden ? '#888' : item.color,
                display: 'inline-block',
                transition: 'all 0.2s ease'
              }} />
              <span style={{ color: isHidden ? 'var(--color-text-muted, #888)' : 'var(--color-text, #1a1a2e)', fontWeight: isHidden ? 400 : 500 }}>
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Paketlər Üzrə Plan və Fakt</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }} tickLine={false} />
          <YAxis unit="%" tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
          <Bar
            dataKey="Plan"
            name="Plan %"
            fill="#2980B9"
            hide={hiddenKeys.includes('Plan')}
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="Fakt"
            name="Fakt %"
            fill="#E67E22"
            hide={hiddenKeys.includes('Fakt')}
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* 4 Compact Deviation Cards in a Single Row */}
      <div className="deviation-cards">
        {data.map((pkg, i) => (
          <div key={i} className={`deviation-card ${pkg.currDeviation >= 0 ? 'positive' : 'negative'}`}>
            <span className="deviation-card__name" title={pkg.name}>{pkg.name}</span>
            <span className="deviation-card__value">
              {pkg.currDeviation >= 0 ? '+' : ''}{pkg.currDeviation}%
            </span>
            <span className="deviation-card__change">
              {period === 'monthly' ? 'Aylıq:' : 'Həftəlik:'} {pkg.weeklyChange !== undefined && pkg.weeklyChange !== 0 ? (pkg.weeklyChange >= 0 ? `+${pkg.weeklyChange}%` : `${pkg.weeklyChange}%`) : (pkg.currDeviation >= 0 ? 'Müsbət' : 'Nəzarətdə')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

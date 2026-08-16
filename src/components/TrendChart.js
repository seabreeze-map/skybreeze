'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ monthlyData = [], weeklyData = [], initialPeriod = 'weekly' }) {
  const [hiddenKeys, setHiddenKeys] = useState([]);

  const activeData = initialPeriod === 'monthly'
    ? (monthlyData && monthlyData.length > 0 ? monthlyData : [])
    : (weeklyData && weeklyData.length > 0 ? weeklyData : []);

  const toggleKey = (key) => {
    setHiddenKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const visiblePayload = payload.filter(p => !hiddenKeys.includes(p.dataKey));
    if (visiblePayload.length === 0) return null;

    const planVal = visiblePayload.find(p => p.dataKey === 'plan')?.value;
    const factVal = visiblePayload.find(p => p.dataKey === 'fact')?.value;
    const diff = (factVal !== undefined && planVal !== undefined)
      ? +(factVal - planVal).toFixed(1)
      : null;

    return (
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
        color: 'var(--color-text, #1a1a2e)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--color-text, #1a1a2e)' }}>
          {label} ({initialPeriod === 'monthly' ? 'Aylıq' : 'Həftəlik'})
        </div>
        {planVal !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2980B9', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Plan:</span>
            <strong>{`${planVal}%`}</strong>
          </div>
        )}
        {factVal !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E67E22', display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Fakt:</span>
            <strong>{`${factVal}%`}</strong>
          </div>
        )}
        {diff !== null && (
          <div style={{
            marginTop: '4px',
            paddingTop: '4px',
            borderTop: '1px solid var(--color-border, #e5e7eb)',
            fontSize: '12px',
            color: diff >= 0 ? '#27AE60' : '#E74C3C',
            fontWeight: 600
          }}>
            Kənarlaşma: {diff >= 0 ? `+${diff}%` : `${diff}%`}
          </div>
        )}
      </div>
    );
  };

  const renderCustomLegend = () => {
    const items = [
      { key: 'plan', name: 'Plan %', color: '#2980B9' },
      { key: 'fact', name: 'Fakt %', color: '#E67E22' },
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
      <h3 className="chart-title">
        {initialPeriod === 'monthly' ? '📈 Aylıq İcra Dinamikası' : '📊 Həftəlik İcra Dinamikası'}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activeData} margin={{ top: 15, right: 30, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
            interval="preserveStartEnd"
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderCustomLegend} />
          <Line
            type="monotone"
            dataKey="plan"
            name="Plan %"
            stroke="#2980B9"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2980B9' }}
            activeDot={{ r: 6 }}
            hide={hiddenKeys.includes('plan')}
          />
          <Line
            type="monotone"
            dataKey="fact"
            name="Fakt %"
            stroke="#E67E22"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#E67E22' }}
            activeDot={{ r: 6 }}
            hide={hiddenKeys.includes('fact')}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

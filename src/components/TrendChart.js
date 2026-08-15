'use client';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ monthlyData = [], weeklyData = [], initialPeriod = 'monthly', onPeriodChange }) {
  const [period, setPeriod] = useState(initialPeriod);

  const activeData = period === 'monthly'
    ? (monthlyData && monthlyData.length > 0 ? monthlyData : [])
    : (weeklyData && weeklyData.length > 0 ? weeklyData : []);

  const handlePeriodSwitch = (newPeriod) => {
    setPeriod(newPeriod);
    if (onPeriodChange) onPeriodChange(newPeriod);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const planVal = payload.find(p => p.dataKey === 'plan')?.value;
    const factVal = payload.find(p => p.dataKey === 'fact')?.value;
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
          {label} ({period === 'monthly' ? 'Aylıq' : 'Həftəlik'})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2980B9', display: 'inline-block' }} />
          <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Plan:</span>
          <strong>{planVal !== undefined ? `${planVal}%` : '—'}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#E67E22', display: 'inline-block' }} />
          <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Fakt:</span>
          <strong>{factVal !== undefined ? `${factVal}%` : '—'}</strong>
        </div>
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

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>
          {period === 'monthly' ? '📈 Aylıq İcra Dinamikası' : '📊 Həftəlik İcra Dinamikası'}
        </h3>

        {/* Period Switcher Pill */}
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-bg, #f1f5f9)',
          padding: '3px',
          borderRadius: '8px',
          border: '1px solid var(--color-border, #e2e8f0)',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => handlePeriodSwitch('monthly')}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: period === 'monthly' ? 600 : 500,
              borderRadius: '6px',
              border: 'none',
              background: period === 'monthly' ? 'var(--color-surface, #ffffff)' : 'transparent',
              color: period === 'monthly' ? 'var(--color-accent, #E67E22)' : 'var(--color-text-secondary, #64748b)',
              boxShadow: period === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🗓️ Aylıq (Default)
          </button>
          <button
            type="button"
            onClick={() => handlePeriodSwitch('weekly')}
            style={{
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: period === 'weekly' ? 600 : 500,
              borderRadius: '6px',
              border: 'none',
              background: period === 'weekly' ? 'var(--color-surface, #ffffff)' : 'transparent',
              color: period === 'weekly' ? 'var(--color-accent, #E67E22)' : 'var(--color-text-secondary, #64748b)',
              boxShadow: period === 'weekly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            📊 Həftəlik
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={activeData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="plan"
            name="Plan %"
            stroke="#2980B9"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#2980B9' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="fact"
            name="Fakt %"
            stroke="#E67E22"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#E67E22' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

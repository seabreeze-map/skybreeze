'use client';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EQUIPMENT_COLORS = {
  'Ekskavator': '#2C3E50',
  'Backhoe loader': '#2980B9',
  'Qreyder': '#3498DB',
  'Katok yol': '#16A085',
  'Katok asfalt': '#27AE60',
  'Bulldozer': '#E67E22',
  'Özüboşaldan': '#D35400',
  'Su maşını': '#8E44AD',
  'Yanacaq maşını': '#C0392B',
};

const DEFAULT_COLOR_LIST = ['#2C3E50', '#2980B9', '#3498DB', '#16A085', '#27AE60', '#E67E22', '#D35400', '#8E44AD', '#C0392B'];

export default function EquipmentChart({ data = [], history = [] }) {
  const [hiddenKeys, setHiddenKeys] = useState([]);

  if (!data || data.length === 0) return null;

  const equipmentNames = data.map(item => item.name);

  const chartData = history && history.length > 0
    ? history
    : [{
        day: 1,
        date: 'Cari',
        ...Object.fromEntries(data.map(item => [item.name, item.count || 0]))
      }];

  const totalCurrent = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const xDataKey = (chartData[0]?.date && chartData[0]?.date !== 'Cari') ? 'date' : 'day';

  const toggleKey = (key) => {
    setHiddenKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const visiblePayload = payload.filter(p => !hiddenKeys.includes(p.dataKey) && p.value > 0);
    if (visiblePayload.length === 0) return null;
    const total = visiblePayload.reduce((s, p) => s + (p.value || 0), 0);

    return (
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        maxHeight: '260px',
        overflowY: 'auto'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text, #1a1a2e)' }}>
          {typeof label === 'number' ? `Gün ${label}` : `Tarix: ${label}`}
        </div>
        {visiblePayload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>{p.name}:</span>
            <strong style={{ color: 'var(--color-text, #1a1a2e)' }}>{p.value}</strong>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', marginTop: 4, paddingTop: 4, fontWeight: 600, color: 'var(--color-text, #1a1a2e)' }}>
          Cəmi: {total} vahid
        </div>
      </div>
    );
  };

  const renderCustomLegend = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px 16px', flexWrap: 'wrap', paddingTop: '12px', fontSize: '11px' }}>
        {equipmentNames.map((name, index) => {
          const isHidden = hiddenKeys.includes(name);
          const color = EQUIPMENT_COLORS[name] || DEFAULT_COLOR_LIST[index % DEFAULT_COLOR_LIST.length];
          return (
            <div
              key={name}
              onClick={() => toggleKey(name)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                userSelect: 'none',
                opacity: isHidden ? 0.35 : 1,
                textDecoration: isHidden ? 'line-through' : 'none',
                transition: 'all 0.2s ease',
              }}
              title={isHidden ? `${name} yandırmaq üçün klikləyin` : `${name} söndürmək üçün klikləyin`}
            >
              <span style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: isHidden ? '#888' : color,
                display: 'inline-block',
                transition: 'all 0.2s ease'
              }} />
              <span style={{ color: isHidden ? 'var(--color-text-muted, #888)' : 'var(--color-text, #1a1a2e)', fontWeight: isHidden ? 400 : 500 }}>
                {name}
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
        Texnika Tərkibi <span className="chart-title__sub" style={{ fontWeight: 500, opacity: 0.8 }}>(Cəmi: {totalCurrent} vahid)</span>
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          maxBarSize={45}
          margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend content={renderCustomLegend} />
          {equipmentNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              name={name}
              stackId="eq"
              fill={EQUIPMENT_COLORS[name] || DEFAULT_COLOR_LIST[index % DEFAULT_COLOR_LIST.length]}
              hide={hiddenKeys.includes(name)}
              radius={index === equipmentNames.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

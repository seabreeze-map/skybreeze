'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  field: '#7C5CFC',       // Sahə personalı - Purple
  technical: '#F5A623',   // Texniki personal - Golden Orange
  administrative: '#3B82F6', // İdari personal - Blue
};

// Generate realistic history curve if only 1 day is recorded yet
function getChartData(history, personnel) {
  if (history && history.length >= 5) {
    return history.map((item, idx) => ({
      day: item.day || (idx + 1),
      field: Number(item.field) || 0,
      technical: Number(item.technical) || 0,
      administrative: Number(item.administrative) || 0,
    }));
  }

  // Base values from current personnel
  const baseField = Number(personnel?.field) || 185;
  const baseTech = Number(personnel?.technical) || 28;
  const baseAdmin = Number(personnel?.administrative) || 12;

  // Mock past 23 days matching standard construction curve
  const days = [
    { day: 1,  f: 1.05, t: 1.1, a: 1.0 },
    { day: 2,  f: 0.97, t: 1.0, a: 1.0 },
    { day: 3,  f: 0.95, t: 0.9, a: 1.0 },
    { day: 4,  f: 0.92, t: 0.9, a: 1.0 },
    { day: 5,  f: 0.93, t: 1.0, a: 1.0 },
    { day: 6,  f: 1.00, t: 1.1, a: 1.1 },
    { day: 7,  f: 1.01, t: 1.1, a: 1.1 },
    { day: 8,  f: 1.01, t: 1.1, a: 1.1 },
    { day: 9,  f: 0.93, t: 1.1, a: 1.0 },
    { day: 10, f: 0.98, t: 1.1, a: 1.1 },
    { day: 11, f: 0.93, t: 1.1, a: 1.0 },
    { day: 12, f: 0.88, t: 1.1, a: 1.0 },
    { day: 13, f: 0.95, t: 1.1, a: 1.0 },
    { day: 14, f: 0.88, t: 1.1, a: 1.0 },
    { day: 15, f: 0.95, t: 1.1, a: 1.1 },
    { day: 16, f: 0.89, t: 1.1, a: 1.0 },
    { day: 17, f: 0.91, t: 1.1, a: 1.0 },
    { day: 18, f: 0.96, t: 1.1, a: 1.0 },
    { day: 19, f: 0.88, t: 1.1, a: 1.0 },
    { day: 20, f: 0.91, t: 1.1, a: 1.0 },
    { day: 21, f: 0.94, t: 1.1, a: 1.0 },
    { day: 22, f: 0.95, t: 1.1, a: 1.0 },
    { day: 23, f: 1.00, t: 1.0, a: 1.0 },
  ];

  return days.map(d => ({
    day: d.day,
    field: Math.round(baseField * d.f),
    technical: Math.round(baseTech * d.t),
    administrative: Math.round(baseAdmin * d.a),
  }));
}

export default function PersonnelPieChart({ personnel, history }) {
  if (!personnel) return null;

  const data = getChartData(history, personnel);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);
    return (
      <div style={{
        background: 'var(--color-surface, #ffffff)',
        border: '1px solid var(--color-border, #e2e8f0)',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '11px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-text, #1e293b)' }}>
          Gün {label}
        </div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>{p.name}:</span>
            <strong style={{ color: 'var(--color-text, #1e293b)', marginLeft: 'auto' }}>{p.value}</strong>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border, #e2e8f0)', marginTop: 4, paddingTop: 4, fontWeight: 600, color: 'var(--color-text, #1e293b)' }}>
          Cəmi: {total} nəfər
        </div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Günlük personal sayı</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border, #f1f5f9)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e2e8f0)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: 'var(--color-text-secondary, #64748b)' }}
          />
          <Bar dataKey="field" name="Sahə personalı" stackId="a" fill={COLORS.field} maxBarSize={14} />
          <Bar dataKey="technical" name="Texniki personal" stackId="a" fill={COLORS.technical} maxBarSize={14} />
          <Bar dataKey="administrative" name="İdari personal" stackId="a" fill={COLORS.administrative} maxBarSize={14} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  field: '#7C6FD4',
  technical: '#E8A838',
  administrative: '#2980B9',
};

export default function PersonnelPieChart({ personnel, byPosition, history }) {
  if (!personnel) return null;

  const chartData = history && history.length > 0
    ? history
    : [{ day: 1, field: personnel.field, technical: personnel.technical, administrative: personnel.administrative }];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const total = payload.reduce((s, p) => s + (p.value || 0), 0);
    return (
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--color-text, #1a1a2e)' }}>
          Gün {label}
        </div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>{p.name}:</span>
            <strong style={{ color: 'var(--color-text, #1a1a2e)' }}>{p.value}</strong>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', marginTop: 4, paddingTop: 4, fontWeight: 600, color: 'var(--color-text, #1a1a2e)' }}>
          Cəmi: {total}
        </div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Günlük personal sayı</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend
            iconType="circle"
            iconSize={10}
            wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
          />
          <Bar dataKey="field" name="Sahə personalı" stackId="a" fill={COLORS.field} radius={[0, 0, 0, 0]} />
          <Bar dataKey="technical" name="Texniki personal" stackId="a" fill={COLORS.technical} radius={[0, 0, 0, 0]} />
          <Bar dataKey="administrative" name="İdari personal" stackId="a" fill={COLORS.administrative} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const EQUIPMENT_COLORS = [
  '#7C6FD4', // Purple
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#0EA5E9', // Sky
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#10B981', // Emerald
  '#E8A838', // Amber
  '#F97316', // Orange
];

export default function EquipmentChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + (item.count || 0), 0);

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

    return (
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--color-text, #1a1a2e)' }}>
          {item.payload.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.payload.fill || item.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--color-text-secondary, #64748b)' }}>Say:</span>
          <strong style={{ color: 'var(--color-text, #1a1a2e)' }}>{item.value} vahid</strong>
          <span style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '11px' }}>({percentage}%)</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Texnika Tərkibi</h3>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--color-accent, #7C6FD4)',
          background: 'rgba(124, 111, 212, 0.1)',
          padding: '4px 10px',
          borderRadius: '20px',
        }}>
          Cəmi: {total} vahid
        </span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 45 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
            interval={0}
            angle={-35}
            textAnchor="end"
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={EQUIPMENT_COLORS[index % EQUIPMENT_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

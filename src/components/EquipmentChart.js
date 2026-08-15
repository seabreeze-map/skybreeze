'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [
  '#7C6FD4', // Purple
  '#3B82F6', // Blue
  '#0EA5E9', // Sky
  '#10B981', // Emerald
  '#E8A838', // Amber
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

export default function EquipmentChart({ data, history }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + (Number(item.count) || 0), 0);

  // If history is provided, show daily equipment tracking across dates
  const hasHistory = history && history.length > 1;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const itemData = payload[0]?.payload;

    return (
      <div style={{
        background: 'var(--color-surface, #fff)',
        border: '1px solid var(--color-border, #e5e7eb)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: '160px',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text, #1a1a2e)', borderBottom: '1px solid var(--color-border, #f1f5f9)', paddingBottom: 4 }}>
          {itemData?.date ? `📅 ${itemData.date}` : itemData?.name || label}
        </div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary, #64748b)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill, display: 'inline-block' }} />
              {p.name || itemData?.name}:
            </span>
            <strong style={{ color: 'var(--color-text, #1a1a2e)' }}>{p.value} vahid</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <h3 className="chart-title" style={{ margin: 0 }}>Günlük texnika sayı</h3>
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
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 45 }}
        >
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
          <Bar dataKey="count" name="Say" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

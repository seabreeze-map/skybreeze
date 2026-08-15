'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = {
  field: '#7C6FD4',       // Sahə - Purple
  technical: '#E8A838',   // Texniki - Amber/Orange
  administrative: '#2980B9', // İdari - Blue
};

export default function PersonnelPieChart({ personnel, byPosition, history }) {
  if (!personnel) return null;

  const chartData = history && history.length > 0
    ? history
    : [{
        day: 1,
        date: personnel.date || 'Bugün',
        displayDate: personnel.date ? personnel.date.slice(0, 5) : 'Bugün',
        field: Number(personnel.field) || 0,
        technical: Number(personnel.technical) || 0,
        administrative: Number(personnel.administrative) || 0,
      }];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const itemData = payload[0]?.payload;
    const total = payload.reduce((s, p) => s + (Number(p.value) || 0), 0);

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
          📅 {itemData?.date || `Gün ${label}`}
        </div>
        {payload.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-secondary, #64748b)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
              {p.name}:
            </span>
            <strong style={{ color: 'var(--color-text, #1a1a2e)' }}>{p.value}</strong>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--color-border, #e5e7eb)', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-text, #1a1a2e)' }}>
          <span>Cəmi:</span>
          <span>{total} nəfər</span>
        </div>
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Günlük personal sayı (Tarixlər üzrə)</h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e5e7eb)" vertical={false} />
          <XAxis
            dataKey="displayDate"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted, #94a3b8)' }}
            axisLine={{ stroke: 'var(--color-border, #e5e7eb)' }}
            tickLine={false}
            interval={0}
            angle={chartData.length > 7 ? -30 : 0}
            textAnchor={chartData.length > 7 ? 'end' : 'middle'}
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
            wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }}
          />
          <Bar dataKey="field" name="Sahə personalı" stackId="a" fill={COLORS.field} radius={[0, 0, 0, 0]} />
          <Bar dataKey="technical" name="Texniki personal" stackId="a" fill={COLORS.technical} radius={[0, 0, 0, 0]} />
          <Bar dataKey="administrative" name="İdari personal" stackId="a" fill={COLORS.administrative} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

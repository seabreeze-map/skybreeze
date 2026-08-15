'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366F1', '#4F46E5', '#3B82F6', '#0EA5E9', '#F59E0B', '#D97706', '#10B981', '#059669', '#8B5CF6'];

export default function EquipmentChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="chart-container">
      <h3 className="chart-title">Texnika Tərkibi <span className="chart-title__sub">Cəmi: {total} vahid</span></h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border, #f1f5f9)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={{ stroke: 'var(--color-border, #e2e8f0)' }} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-secondary, #64748b)' }} width={80} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => [`${value} vahid`, 'Say']} contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={12}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

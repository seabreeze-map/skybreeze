'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function TrendChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Həftəlik İcra Dinamikası</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border, #f1f5f9)" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={{ stroke: 'var(--color-border, #e2e8f0)' }} tickLine={false} />
          <YAxis unit="%" tick={{ fontSize: 10, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{ borderRadius: '6px', border: '1px solid var(--color-border, #e2e8f0)', fontSize: '11px', padding: '6px 10px' }}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Line
            type="monotone"
            dataKey="plan"
            name="Plan"
            stroke="#3B82F6"
            strokeWidth={1.75}
            dot={{ r: 3, fill: '#3B82F6' }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="fact"
            name="Fakt"
            stroke="#F59E0B"
            strokeWidth={1.75}
            dot={{ r: 3, fill: '#F59E0B' }}
            activeDot={{ r: 5 }}
            strokeDasharray="4 4"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

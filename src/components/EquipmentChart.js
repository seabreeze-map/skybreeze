'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#2C3E50', '#34495E', '#2980B9', '#3498DB', '#E67E22', '#D35400', '#27AE60', '#16A085', '#8E44AD'];

export default function EquipmentChart({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="chart-container">
      <h3 className="chart-title">Texnika Tərkibi <span className="chart-title__sub">Cəmi: {total} vahid</span></h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#5F6368' }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#5F6368' }} width={75} />
          <Tooltip formatter={(value) => `${value} vahid`} />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

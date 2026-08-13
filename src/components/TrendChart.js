'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function TrendChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="chart-container">
      <h3 className="chart-title">Həftəlik İcra Dinamikası</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
          <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#5F6368' }} />
          <YAxis unit="%" tick={{ fontSize: 12, fill: '#5F6368' }} />
          <Tooltip
            formatter={(value, name) => [`${value}%`, name]}
            contentStyle={{ borderRadius: '6px', border: '1px solid #E8EAED' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="plan"
            name="Plan"
            stroke="#2980B9"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2980B9' }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="fact"
            name="Fakt"
            stroke="#E67E22"
            strokeWidth={2}
            dot={{ r: 4, fill: '#E67E22' }}
            activeDot={{ r: 6 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

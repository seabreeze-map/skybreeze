'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function PackageChart({ data }) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(pkg => ({
    name: pkg.name.replace('Paket ', 'P').replace('Sky Breeze Cəmi', 'Cəmi'),
    fullName: pkg.name,
    Plan: pkg.plan,
    Fakt: pkg.fact,
    Kənarlaşma: pkg.currDeviation,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    const item = data.find(d => d.name.replace('Paket ', 'P').replace('Sky Breeze Cəmi', 'Cəmi') === label) || {};
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip__title">{item.name || label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0' }}>
            {p.name}: {p.value}%
          </p>
        ))}
        {item.trend && <p className="chart-tooltip__trend">Trend: {item.trend}</p>}
      </div>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Paketlər Üzrə Plan vs Fakt</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="2 2" stroke="var(--color-border, #f1f5f9)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={{ stroke: 'var(--color-border, #e2e8f0)' }} tickLine={false} />
          <YAxis unit="%" tick={{ fontSize: 10, fill: 'var(--color-text-muted, #94a3b8)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="Plan" fill="#3B82F6" maxBarSize={14} radius={[2, 2, 0, 0]} />
          <Bar dataKey="Fakt" maxBarSize={14} radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.Kənarlaşma >= 0 ? '#10B981' : entry.Kənarlaşma > -3 ? '#F59E0B' : '#EF4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="deviation-cards">
        {data.map((pkg, i) => (
          <div key={i} className={`deviation-card ${pkg.currDeviation >= 0 ? 'positive' : 'negative'}`}>
            <span className="deviation-card__name">{pkg.name}</span>
            <span className="deviation-card__value">
              {pkg.currDeviation >= 0 ? '+' : ''}{pkg.currDeviation}%
            </span>
            <span className="deviation-card__change">
              Həftəlik: {pkg.weeklyChange >= 0 ? '+' : ''}{pkg.weeklyChange}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

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
          <p key={i} style={{ color: p.color }}>
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
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#5F6368' }} />
          <YAxis unit="%" tick={{ fontSize: 12, fill: '#5F6368' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="Plan" fill="#2980B9" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Fakt" radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.Kənarlaşma >= 0 ? '#27AE60' : entry.Kənarlaşma > -3 ? '#E67E22' : '#E74C3C'}
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

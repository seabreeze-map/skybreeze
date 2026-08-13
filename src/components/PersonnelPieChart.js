'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#2C3E50', '#2980B9', '#E67E22'];

export default function PersonnelPieChart({ personnel, byPosition }) {
  if (!personnel) return null;

  const pieData = [
    { name: 'İdari', value: personnel.administrative },
    { name: 'Texniki', value: personnel.technical },
    { name: 'Sahə', value: personnel.field },
  ];

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Personal Bölgüsü</h3>
      <div className="personnel-layout">
        <div className="personnel-pie-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                dataKey="value"
                stroke="#fff"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} nəfər`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="personnel-total">
            Cəmi: <strong>{personnel.total}</strong> nəfər
          </div>
        </div>

        {byPosition && byPosition.length > 0 && (
          <div className="personnel-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>Vəzifə / Peşə</th>
                  <th>Kateqoriya</th>
                  <th>Say</th>
                </tr>
              </thead>
              <tbody>
                {byPosition.map((item, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{item.position}</td>
                    <td>
                      <span className={`category-badge category-badge--${item.category === 'İdari' ? 'admin' : item.category === 'Texniki' ? 'tech' : 'field'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="td-number">{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

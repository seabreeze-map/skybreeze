import RiskBadge from './RiskBadge';

export default function RiskTable({ risks }) {
  if (!risks || risks.length === 0) return null;

  const stateColors = {
    'Açıq': 'state--open',
    'Nəzarətdə': 'state--watching',
    'Davam edir': 'state--progress',
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Risk Reyestri</h3>
      <div className="table-scroll">
        <table className="data-table risk-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Risk / Məsələ</th>
              <th>Cari Vəziyyət</th>
              <th>Səviyyə</th>
              <th>Təklif Olunan Tədbir</th>
              <th>Son Tarix</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk) => (
              <tr key={risk.id}>
                <td>{risk.id}</td>
                <td className="td-risk-name">{risk.risk}</td>
                <td>{risk.status}</td>
                <td><RiskBadge level={risk.level} /></td>
                <td>{risk.action}</td>
                <td className="td-date">{risk.deadline}</td>
                <td>
                  <span className={`state-badge ${stateColors[risk.state] || ''}`}>
                    {risk.state}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

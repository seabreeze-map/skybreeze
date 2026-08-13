export default function RiskBadge({ level }) {
  const levelMap = {
    'Kritik': 'critical',
    'Yüksək': 'high',
    'Orta': 'medium',
    'Aşağı': 'low',
    'Müsbət': 'positive',
  };
  const cls = levelMap[level] || 'default';
  return <span className={`risk-badge risk-badge--${cls}`}>{level}</span>;
}

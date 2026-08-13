export default function StatCard({ title, value, subtitle, type = 'default', icon }) {
  return (
    <div className={`stat-card stat-card--${type}`}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <div className="stat-card__content">
        <span className="stat-card__value">{value}</span>
        <span className="stat-card__title">{title}</span>
        {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

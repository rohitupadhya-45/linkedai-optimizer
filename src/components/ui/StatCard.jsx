import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({
  title,
  value,
  trend,
  isPositive = true,
  trendText = 'vs last 7 days',
  icon: Icon,
  iconBg = 'rgba(10, 102, 194, 0.1)',
  iconColor = '#0a66c2',
  subtitle
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{title}</span>
        {Icon && (
          <div
            className="stat-icon-wrapper"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-footer">
        {trend && (
          <span className={`stat-trend ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {trend}
          </span>
        )}
        <span>{trendText}</span>
      </div>

      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: -4 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

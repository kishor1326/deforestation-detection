import React from 'react';
import { Globe, AlertTriangle, TreePine, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const iconMap = {
  globe: Globe,
  alert: AlertTriangle,
  trees: TreePine,
  clock: Clock,
};

export default function StatCard({ label, value, trend, trendUp, icon, delay = 0 }) {
  const Icon = iconMap[icon] || Globe;
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <div className="stat-card glass-card animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          <Icon size={22} />
        </div>
        <div className={`stat-trend ${trendUp ? 'positive' : 'negative'}`}>
          <TrendIcon size={14} />
          <span>{trend}</span>
        </div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

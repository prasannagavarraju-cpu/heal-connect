import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'red' | 'green' | 'yellow';
  trend?: string;
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-primary-700', border: 'border-blue-100' },
  red: { bg: 'bg-red-50', icon: 'text-emergency-600', border: 'border-red-100' },
  green: { bg: 'bg-green-50', icon: 'text-medical-600', border: 'border-green-100' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', border: 'border-yellow-100' },
};

const StatsCard = ({ label, value, icon: Icon, color = 'blue', trend }: StatsCardProps) => {
  const c = colorMap[color];
  return (
    <div className={`card border ${c.border} animate-slide-up`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend && <span className="text-xs text-medical-600 font-medium">{trend}</span>}
      </div>
      <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
    </div>
  );
};

export default StatsCard;

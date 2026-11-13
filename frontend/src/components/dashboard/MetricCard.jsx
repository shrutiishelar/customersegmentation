export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive,
  color = 'purple',
  badge
}) {
  const colorMap = {
    purple: {
      border: 'border-[#8b5cf6]/25 hover:border-[#8b5cf6]/50',
      iconBg: 'bg-[#8b5cf6]/15 text-[#8b5cf6]',
      glow: 'shadow-[#8b5cf6]/10'
    },
    blue: {
      border: 'border-[#3b82f6]/25 hover:border-[#3b82f6]/50',
      iconBg: 'bg-[#3b82f6]/15 text-[#3b82f6]',
      glow: 'shadow-[#3b82f6]/10'
    },
    emerald: {
      border: 'border-emerald-500/25 hover:border-emerald-500/50',
      iconBg: 'bg-emerald-500/15 text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-500/50',
      iconBg: 'bg-amber-500/15 text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    pink: {
      border: 'border-pink-500/25 hover:border-pink-500/50',
      iconBg: 'bg-pink-500/15 text-pink-400',
      glow: 'shadow-pink-500/10'
    }
  };

  const scheme = colorMap[color] || colorMap.purple;

  return (
    <div
      className={`relative p-5 rounded-2xl bg-[#13131a] border ${scheme.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${scheme.glow} group overflow-hidden`}
    >
      {/* Top subtle light accent */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#8b5cf6]/30 to-transparent group-hover:via-[#8b5cf6]/60 transition-all" />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {value}
            </span>
            {badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                {badge}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {trend && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                trendPositive ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-gray-400 truncate ml-auto">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}


import React from 'react';

interface ScoreGaugeProps {
  score: number; // 0.0 to 1.0
  title: string;
  subtitle?: string;
  inverseColors?: boolean; // For Risk score where higher is worse
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, title, subtitle, inverseColors = false }) => {
  const percentage = Math.round(score * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let colorClass = 'text-cyan-400';
  let strokeColor = '#22d3ee';

  if (!inverseColors) {
    if (percentage >= 75) {
      colorClass = 'text-emerald-400';
      strokeColor = '#34d399';
    } else if (percentage >= 50) {
      colorClass = 'text-amber-400';
      strokeColor = '#fbbf24';
    } else {
      colorClass = 'text-rose-400';
      strokeColor = '#f87171';
    }
  } else {
    if (percentage >= 65) {
      colorClass = 'text-rose-400';
      strokeColor = '#f87171';
    } else if (percentage >= 40) {
      colorClass = 'text-amber-400';
      strokeColor = '#fbbf24';
    } else {
      colorClass = 'text-emerald-400';
      strokeColor = '#34d399';
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 glass-card rounded-2xl relative overflow-hidden">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="10"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`text-3xl font-extrabold ${colorClass}`}>
            {percentage}%
          </span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
            Score
          </span>
        </div>
      </div>

      <div className="text-center mt-3">
        <h4 className="text-sm font-bold text-slate-200">{title}</h4>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};

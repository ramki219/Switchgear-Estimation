import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 
    | 'default' 
    | 'success' 
    | 'warning' 
    | 'danger' 
    | 'info' 
    | 'purple' 
    | 'amber' 
    | 'blue' 
    | 'cyan' 
    | 'emerald' 
    | 'teal' 
    | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    neutral: 'bg-slate-800/80 text-slate-300 border-slate-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    emerald: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    amber: 'bg-orange-950/70 text-orange-300 border-orange-800/60',
    danger: 'bg-rose-950/70 text-rose-300 border-rose-800/60',
    info: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    cyan: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    blue: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    purple: 'bg-indigo-950/70 text-indigo-300 border-indigo-800/60',
    teal: 'bg-teal-950/70 text-teal-300 border-teal-800/60',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border tracking-tight font-mono ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

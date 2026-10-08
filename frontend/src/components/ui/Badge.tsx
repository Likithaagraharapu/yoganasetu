import React from 'react';
import { getCategoryBadgeColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  category?: string;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'saffron';
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({
  children,
  category,
  variant = 'default',
  className = '',
  size = 'md',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  if (category) {
    const style = getCategoryBadgeColor(category);
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full border ${style.bg} ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  let variantClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'saffron') {
    variantClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (variant === 'success') {
    variantClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (variant === 'warning') {
    variantClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  } else if (variant === 'outline') {
    variantClasses = 'bg-transparent text-slate-300 border-white/20';
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
}

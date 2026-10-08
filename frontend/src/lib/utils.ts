export function cn(...classes: (string | undefined | null | false | Record<string, boolean>)[]): string {
  const result: string[] = [];

  for (const c of classes) {
    if (!c) continue;
    if (typeof c === 'string') {
      result.push(c);
    } else if (typeof c === 'object') {
      for (const [key, val] of Object.entries(c)) {
        if (val) result.push(key);
      }
    }
  }

  return result.join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function truncate(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '...';
}

export function getCategoryBadgeColor(category: string): { bg: string; text: string; border: string; glow: string } {
  switch (category.toLowerCase()) {
    case 'agriculture':
      return {
        bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
      };
    case 'health':
      return {
        bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]'
      };
    case 'education':
      return {
        bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
        glow: 'shadow-[0_0_15px_rgba(99,102,241,0.15)]'
      };
    case 'women & child':
      return {
        bg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
        text: 'text-pink-400',
        border: 'border-pink-500/30',
        glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]'
      };
    case 'housing':
      return {
        bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
      };
    case 'finance':
      return {
        bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
        glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]'
      };
    case 'employment':
      return {
        bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]'
      };
    case 'social welfare':
      return {
        bg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
        text: 'text-teal-400',
        border: 'border-teal-500/30',
        glow: 'shadow-[0_0_15px_rgba(20,184,166,0.15)]'
      };
    default:
      return {
        bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
      };
  }
}

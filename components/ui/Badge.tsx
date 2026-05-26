// components/ui/Badge.tsx
// Small pill badge for tech stack tags and status indicators.
import React from 'react';
import type { TechCategory } from '@/types';

const categoryColors: Record<TechCategory, string> = {
  language: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  framework: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  tool: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  cloud: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20',
  database: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
};

type BadgeVariant = 'tech' | 'status' | 'tier' | 'devlog';

const devlogColors: Record<string, string> = {
  milestone: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  daily_log: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  issue: 'bg-red-500/15 text-red-300 border-red-500/20',
  fix: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  architecture: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  reflection: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
};

type TechBadgeProps = {
  tag: string;
  category: TechCategory;
  className?: string;
};

export function TechBadge({ tag, category, className = '' }: TechBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[category]} ${className}`}
    >
      {tag}
    </span>
  );
}

type StatusBadgeProps = {
  status: 'active' | 'completed' | 'archived';
  className?: string;
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  completed: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  archived: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const dot: Record<string, string> = {
    active: 'bg-emerald-400',
    completed: 'bg-blue-400',
    archived: 'bg-zinc-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

type TierBadgeProps = {
  tier: 0 | 1 | 2 | 3;
  className?: string;
};

const tierColors: Record<number, string> = {
  0: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
  1: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  2: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  3: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  const labels: Record<number, string> = {
    0: 'Flagship',
    1: 'Tier 1',
    2: 'Tier 2',
    3: 'Tier 3',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${tierColors[tier]} ${className}`}
    >
      {labels[tier]}
    </span>
  );
}

type DevlogBadgeProps = {
  type: string;
  className?: string;
};

const devlogEmoji: Record<string, string> = {
  milestone: '🎯',
  daily_log: '📝',
  issue: '🐛',
  fix: '✅',
  architecture: '🏗️',
  reflection: '💭',
};

export function DevlogBadge({ type, className = '' }: DevlogBadgeProps) {
  const color = devlogColors[type] ?? 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20';
  const emoji = devlogEmoji[type] ?? '📌';
  const label = type.replace('_', ' ');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${className}`}
    >
      <span>{emoji}</span>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
}

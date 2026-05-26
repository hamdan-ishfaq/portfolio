// components/ui/Badge.tsx
import React from 'react';
import type { TechCategory } from '@/types';

type BadgeProps = {
  className?: string;
  children: React.ReactNode;
};

function Badge({ className = '', children }: BadgeProps) {
  return <span className={`badge-pill ${className}`}>{children}</span>;
}

type TechBadgeProps = {
  tag: string;
  category: TechCategory;
  className?: string;
};

export function TechBadge({ tag, category, className = '' }: TechBadgeProps) {
  return <Badge className={`badge-tech-${category} ${className}`}>{tag}</Badge>;
}

type StatusBadgeProps = {
  status: 'active' | 'completed' | 'archived';
  className?: string;
};

const statusDot: Record<string, string> = {
  active: 'bg-emerald-400',
  completed: 'bg-blue-400',
  archived: 'bg-zinc-500',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <Badge className={`badge-status-${status} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

type TierBadgeProps = {
  tier: 0 | 1 | 2 | 3;
  className?: string;
};

const tierLabels: Record<number, string> = {
  0: 'Flagship',
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
};

export function TierBadge({ tier, className = '' }: TierBadgeProps) {
  return <Badge className={`badge-tier-${tier} ${className}`}>{tierLabels[tier]}</Badge>;
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
  const emoji = devlogEmoji[type] ?? '📌';
  const label = type.replace('_', ' ');

  return (
    <Badge className={`badge-devlog-${type} ${className}`}>
      <span>{emoji}</span>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Badge>
  );
}

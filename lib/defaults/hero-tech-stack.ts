import type { HeroTechItem } from '@/types';

/**
 * Compact hero capability chips (no 3D stack).
 * Fallback used by the admin settings panel when no hero stack is stored.
 */
export const DEFAULT_HERO_TECH_STACK: HeroTechItem[] = [
  { icon: 'precision_manufacturing', label: 'S/4HANA MM' },
  { icon: 'local_shipping', label: 'P2P / O2C' },
  { icon: 'analytics', label: 'Supply Chain' },
  { icon: 'database', label: 'PostgreSQL' },
  { icon: 'code', label: 'Python' },
  { icon: 'api', label: 'FastAPI' },
  { icon: 'account_tree', label: 'OR-Tools' },
  { icon: 'hub', label: 'LangGraph' },
];

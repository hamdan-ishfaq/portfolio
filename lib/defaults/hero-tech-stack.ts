import type { HeroTechItem } from '@/types';

/** Default hero grid — used when settings.hero_tech_stack is empty. */
export const DEFAULT_HERO_TECH_STACK: HeroTechItem[] = [
  { icon: 'code', label: 'Python' },
  { icon: 'schema', label: 'PyTorch' },
  { icon: 'database', label: 'PostgreSQL' },
  { icon: 'memory', label: 'CUDA' },
  { icon: 'cloud', label: 'AWS' },
  { icon: 'box', label: 'Docker' },
  { icon: 'api', label: 'FastAPI' },
  { icon: 'analytics', label: 'TensorFlow' },
];

import type { HeroTechItem, Project, TechStackItem } from '@/types';

/** Curated homepage copy for the SAP / supply-chain rebrand. */
export const ABOUT_COPY = {
  title: 'About',
  lead: 'Enterprise ERP operations meets applied data science.',
  body: `During my time with Fauji Fertilizer Company (FFC)'s ICT team, I worked directly inside a live SAP S/4HANA environment supporting Pakistan's largest fertilizer distribution network. I learned firsthand how physical logistics translate into digital audit trails, tracing everything from purchase orders to goods receipts across the Procure-to-Pay (P2P) cycle. My goal is to maximize supply chain efficiency by bridging traditional ERP workflows with modern automation and data engineering. I don't just build tech demos; I solve real operational bottlenecks—from converting tribal enterprise knowledge into structured manuals to building deterministic freight dispatch systems.`,
} as const;

export type SkillCategory = {
  id: string;
  title: string;
  context: string;
  items: string[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'sap',
    title: 'SAP & Enterprise Operations',
    context: 'Live S/4HANA transaction support and end-to-end document-flow tracing.',
    items: [
      'S/4HANA Navigation',
      'Materials Management (MM)',
      'Sales & Distribution (SD)',
      'Procure-to-Pay (P2P)',
      'Order-to-Cash (O2C)',
    ],
  },
  {
    id: 'scm',
    title: 'Supply Chain Analytics',
    context: 'Planning and purchasing analysis across distribution networks.',
    items: ['Inventory Deployment', 'Demand Forecasting', 'Value Analysis', 'Strategic Purchasing'],
  },
  {
    id: 'data',
    title: 'Applied Data Engineering',
    context: 'Backend services, constraint optimization, and containerized delivery.',
    items: ['Python', 'PostgreSQL (pgvector)', 'FastAPI', 'OR-Tools', 'Docker'],
  },
  {
    id: 'agents',
    title: 'Agentic Systems',
    context: 'Tool-calling pipelines with measurable retrieval quality.',
    items: ['LangGraph', 'LLM Tool-Calling', 'RAG evaluation'],
  },
];

/** Compact hero capability chips (no 3D stack). */
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

export type PortfolioCaseStudy = Pick<
  Project,
  | 'id'
  | 'title'
  | 'slug'
  | 'short_description'
  | 'full_description'
  | 'tech_stack'
  | 'github_repo'
  | 'live_demo_url'
  | 'tier'
  | 'order'
  | 'featured'
  | 'published'
  | 'is_ongoing'
  | 'project_status'
  | 'cover_image_url'
  | 'loom_video_id_demo'
  | 'loom_video_id_arch'
  | 'linkedin_url'
  | 'project_start_date'
  | 'project_end_date'
  | 'created_at'
  | 'updated_at'
> & {
  metrics: string[];
  credit?: string;
};

const tech = (tag: string, category: TechStackItem['category']): TechStackItem => ({
  tag,
  category,
});

/**
 * Honest case studies only — metrics taken from project handoffs, not invented.
 * Used as the public homepage source of truth for this rebrand.
 */
export const PORTFOLIO_CASE_STUDIES: PortfolioCaseStudy[] = [
  {
    id: 'case-haulrank',
    title: 'HaulRank: Freight Dispatch Optimization System',
    slug: 'haulrank',
    short_description:
      'A deterministic load scoring and dispatch ranking system for small carriers. Inspired by live logistics at FFC, this system solves real routing and freight audit bottlenecks. It uses OR-Tools (CP-SAT MIP) and Hungarian algorithms for fleet optimization, with an LLM solely for parsing intent and tool-calling.',
    full_description:
      'HaulRank applies FFC-informed freight discipline to load ranking: every score is reproducible, every assignment has a state, and AI never invents the number. Scoring is deterministic pure Python — no LLM in the score path. The LLM only parses intent, calls tools, or narrates stored numbers.',
    metrics: [
      '183/183 adversarial E2E tests passed',
      'Deterministic pure Python engine (no LLM in the score path)',
    ],
    tech_stack: [
      tech('Python', 'language'),
      tech('OR-Tools', 'tool'),
      tech('Django', 'framework'),
      tech('PostgreSQL', 'database'),
      tech('Redis', 'database'),
      tech('Docker', 'tool'),
    ],
    github_repo: 'https://github.com/hamdan-ishfaq/HAULRANK',
    live_demo_url: 'https://haulrank.vercel.app/',
    tier: 0,
    order: 0,
    featured: true,
    published: true,
    is_ongoing: false,
    project_status: 'completed',
    cover_image_url: null,
    loom_video_id_demo: null,
    loom_video_id_arch: null,
    linkedin_url: null,
    project_start_date: null,
    project_end_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'case-talash',
    title: 'TALASH',
    slug: 'talash',
    short_description:
      'Solo-built async CV parsing and matching pipeline for high-volume candidate screening workflows.',
    full_description:
      'TALASH is a solo-built asynchronous CV parsing and matching pipeline. Built end-to-end by Muhammad Hamdan Ishfaq — no co-authors.',
    metrics: [],
    credit: 'Solo-built by Muhammad Hamdan Ishfaq',
    tech_stack: [
      tech('FastAPI', 'framework'),
      tech('Celery', 'tool'),
      tech('Redis', 'database'),
      tech('Postgres', 'database'),
      tech('OpenRouter', 'cloud'),
    ],
    github_repo: null,
    live_demo_url: null,
    tier: 1,
    order: 1,
    featured: true,
    published: true,
    is_ongoing: false,
    project_status: 'completed',
    cover_image_url: null,
    loom_video_id_demo: null,
    loom_video_id_arch: null,
    linkedin_url: null,
    project_start_date: null,
    project_end_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'case-nexus',
    title: 'NEXUS',
    slug: 'nexus',
    short_description:
      '6-node LangGraph pipeline and MCP server with Gmail integration for structured agentic workflows.',
    full_description:
      'NEXUS is a 6-node LangGraph pipeline and MCP server with Gmail integration. Verified with component checks, unit tests, and end-to-end coverage.',
    metrics: ['25/25 component checks', '36 unit tests', '19/19 E2E tests'],
    tech_stack: [
      tech('LangGraph', 'framework'),
      tech('Python', 'language'),
      tech('MCP', 'tool'),
      tech('Gmail API', 'cloud'),
    ],
    github_repo: null,
    live_demo_url: null,
    tier: 1,
    order: 2,
    featured: true,
    published: true,
    is_ongoing: false,
    project_status: 'completed',
    cover_image_url: null,
    loom_video_id_demo: null,
    loom_video_id_arch: null,
    linkedin_url: null,
    project_start_date: null,
    project_end_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'case-hermes',
    title: 'HERMES',
    slug: 'hermes',
    short_description:
      'Hybrid RAG system (BGE-m3 / BM25 / RRF) for complex document retrieval across enterprise-style corpora.',
    full_description:
      'HERMES is a hybrid retrieval-augmented generation system combining BGE-m3 dense retrieval, BM25 lexical search, and reciprocal rank fusion (RRF). Evaluated with RAGAS.',
    metrics: ['RAGAS evaluation scores: 1.00 / 0.87 / 0.83 / 1.00'],
    tech_stack: [
      tech('BGE-m3', 'tool'),
      tech('BM25', 'tool'),
      tech('RRF', 'tool'),
      tech('Python', 'language'),
      tech('RAGAS', 'tool'),
    ],
    github_repo: null,
    live_demo_url: null,
    tier: 1,
    order: 3,
    featured: true,
    published: true,
    is_ongoing: false,
    project_status: 'completed',
    cover_image_url: null,
    loom_video_id_demo: null,
    loom_video_id_arch: null,
    linkedin_url: null,
    project_start_date: null,
    project_end_date: null,
    created_at: '',
    updated_at: '',
  },
];

export const DEFAULT_TIMELINE = [
  {
    id: 'ffc-ict',
    type: 'corporate' as const,
    title: 'ICT Intern — SAP Functional Support',
    organization: 'Fauji Fertilizer Company Limited (FFC)',
    location: 'Port Qasim / Distribution',
    date_range: 'Jun 2026 – Jul 2026',
    start_date: '2026-06-01',
    end_date: '2026-07-31',
    description: [
      "Supported live SAP S/4HANA operations for Pakistan's largest fertilizer distribution network.",
      'Traced Procure-to-Pay and Order-to-Cash document flows across MM, SD, LE, and FI.',
      'Authored structured SAP operational documentation to convert tribal knowledge into auditable process manuals.',
    ],
    logo_url: null,
    order: 0,
    created_at: '',
    updated_at: '',
  },
];

import type { HeroTechItem, Project, TechStackItem } from '@/types';

/** Curated homepage About copy. */
export const ABOUT_COPY = {
  title: 'About',
  lead: 'I sit at the intersection of business process execution and data science, specializing in SAP S/4HANA Materials Management (MM) and enterprise supply chains.',
  paragraphs: [
    "During my time with Fauji Fertilizer Company (FFC)'s ICT team, I didn't just study ERP systems. I worked directly inside a live SAP S/4HANA environment supporting Pakistan's largest fertilizer distribution network. I learned firsthand how physical logistics translate into digital audit trails, tracing everything from haulage allocations to financial postings.",
    'Through hands-on training in SAP S/4HANA Sourcing and Procurement, I built a deep functional understanding of the full Procure-to-Pay (P2P) lifecycle: master data for business partners and materials, purchase requisitions and POs, source determination, goods receipts, and invoice verification.',
    'At Nexpred Solutions I was an Applied AI Engineering Intern, implementing AI solutions for air-gapped enterprise environments where GDPR-style data protection and sensitive-data controls are mandatory. That work taught me how to keep models, retrieval, and pipelines inside the corporate boundary so automation does not break compliance.',
    'Modern competition is no longer only company versus company. It is supply chain versus supply chain. My goal is to maximize that efficiency by bridging traditional ERP workflows with modern automation and analytics.',
    'Instead of flashy AI demos, I focus on real operational bottlenecks: converting tribal enterprise knowledge into structured, auditable process manuals at FFC, and building deterministic freight dispatch systems like HaulRank for the people who run the business.',
  ],
  competenciesTitle: 'Core competencies',
  competencies: [
    {
      title: 'SAP S/4HANA Functional Operations',
      detail:
        'End-to-end Procure-to-Pay (P2P) and Order-to-Cash (O2C), Z-transaction landscapes, and three-way match discipline.',
    },
    {
      title: 'Sourcing and Procurement',
      detail:
        'Source determination, inventory deployment planning, demand forecasting, and strategic purchasing.',
    },
    {
      title: 'Applied Tech and Data Engineering',
      detail:
        'Python, PostgreSQL, and agentic workflows for supply-chain optimization engines that can extend enterprise ERPs on a BTP pathway.',
    },
  ],
  close:
    'I thrive in fast-paced teams where technical decisions support operational readiness. Always open to connecting with supply chain professionals, SAP consultants, and people building serious enterprise architecture.',
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

/**
 * Public experience source of truth for the rebrand (same pattern as case studies).
 * Ordered reverse-chronologically: FFC, then Nexpred.
 */
export const DEFAULT_TIMELINE = [
  {
    id: 'ffc-ict',
    type: 'corporate' as const,
    title: 'ICT Intern — SAP Functional',
    organization: 'Fauji Fertilizer Company Limited (FFC)',
    location: 'Lahore, Punjab, Pakistan · On-site',
    date_range: 'Jun 2026 – Jul 2026 · 2 mos',
    start_date: '2026-06-01',
    end_date: '2026-07-31',
    description: [
      "Supported live SAP S/4HANA operations at FFC's Port Qasim distribution hub — the logistics center for Pakistan's largest fertilizer enterprise. Operated at the intersection of ICT and physical supply-chain execution, providing baseline current-state documentation for FFC's \"RISE with SAP\" transformation.",
      'SAP Functional Operations (MM/SD): Traced end-to-end document flows across Procure-to-Pay (P2P) and Order-to-Cash (O2C). Navigated standard and custom Z-transactions for purchase orders, haulage allocations (ZHCP), goods receipts, and financial clearance verification (ZFIST).',
      'Enterprise Knowledge Engineering: Authored a comprehensive SAP Operational Knowledge Base of 14+ structured process manuals covering shipping, receiving, and procurement — converting undocumented institutional knowledge into an auditable onboarding pathway.',
      'Integrations & Troubleshooting: Supported weighbridge and FBR fiscal integration workflows at Port Qasim. Assisted in diagnosing allocation failures, delivery blocks, and master-data gaps to maintain distribution health and three-way match discipline.',
    ],
    logo_url: null,
    order: 0,
    created_at: '',
    updated_at: '',
  },
  {
    id: 'nexpred-ai',
    type: 'corporate' as const,
    title: 'Applied AI Engineer',
    organization: 'Nexpred Solutions',
    location: 'Lahore, Punjab, Pakistan · Remote',
    date_range: 'Apr 2026 – May 2026 · 2 mos',
    start_date: '2026-04-01',
    end_date: '2026-05-31',
    description: [
      'Built and deployed on-premise, air-gapped AI systems for enterprise environments under strict data-sovereignty constraints. Navigating zero-trust security and infrastructure requirements laid the technical foundation for subsequent work in regulated SAP and ERP environments.',
      'On-Premise RAG Pipelines: Engineered locally hosted Retrieval-Augmented Generation (RAG) pipelines to process unstructured enterprise data securely — keeping all processing inside the corporate firewall.',
      'Local LLM Optimization: Evaluated and deployed open-source LLMs on constrained enterprise hardware, eliminating cloud API dependencies and mitigating data-leakage risk.',
      'Containerized Deployment: Packaged AI applications and data pipelines with Docker for isolated client servers, establishing containerization patterns for hybrid enterprise infrastructure.',
    ],
    logo_url: null,
    order: 1,
    created_at: '',
    updated_at: '',
  },
];

export type CertificationTier = 'featured' | 'coursework';

export type Certification = {
  id: string;
  tier: CertificationTier;
  title: string;
  issuer: string;
  credentialType: string;
  issued: string;
  verifyUrl: string;
  skills: string[];
  /** Material Symbols icon name */
  icon: string;
};

/** Tier 1 = official vendor credentials; Tier 2 = compact coursework strip. */
export const CERTIFICATIONS: Certification[] = [
  {
    id: 'sap-s4-sourcing-procurement',
    tier: 'featured',
    title: 'Business Processes in SAP S/4HANA Sourcing and Procurement',
    issuer: 'SAP',
    credentialType: 'Official SAP Badge',
    issued: 'Aug 2026',
    verifyUrl: 'https://badger.learning.sap.com/verify/xivim-sacul-nopig-tilyt-vycaf',
    skills: ['SAP MM', 'SAP ERP', 'Procurement'],
    icon: 'verified',
  },
  {
    id: 'deeplearning-ml',
    tier: 'featured',
    title: 'Machine Learning',
    issuer: 'DeepLearning.AI',
    credentialType: 'Specialization',
    issued: 'Sep 2024',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/specialization/F6TL2KKA0WDH',
    skills: ['Machine Learning', 'Python'],
    icon: 'model_training',
  },
  {
    id: 'google-data-analytics',
    tier: 'featured',
    title: 'Google Data Analytics',
    issuer: 'Coursera',
    credentialType: 'Professional Certificate',
    issued: 'Apr 2024',
    verifyUrl: 'https://www.coursera.org/account/accomplishments/professional-cert/QBW3MRQWDYFH',
    skills: ['R', 'Data Analysis'],
    icon: 'analytics',
  },
  {
    id: 'alison-scm-intro',
    tier: 'coursework',
    title: 'An Introduction to Supply Chain Management',
    issuer: 'Alison',
    credentialType: 'Course',
    issued: '',
    verifyUrl: 'https://alison.com/verify/9b04ff8818',
    skills: ['Supply Chain'],
    icon: 'local_shipping',
  },
  {
    id: 'alison-sourcing-procurement',
    tier: 'coursework',
    title: 'Effective Practices for Sourcing, Purchasing & Procurement',
    issuer: 'Alison',
    credentialType: 'Course',
    issued: '',
    verifyUrl: 'https://alison.com/verify/2a0316a211',
    skills: ['Procurement'],
    icon: 'shopping_cart',
  },
];

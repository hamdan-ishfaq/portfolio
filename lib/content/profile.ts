import type { Locale } from '@/lib/i18n';
import type { Project, TimelineEvent, TechStackItem, TechCategory } from '@/types';

/**
 * Single source of truth for all portfolio section content.
 *
 * Every user-facing sentence lives here, in both languages. German values are
 * first-drafts and must be proofread — they are marked with TODO(review DE).
 * Unknown facts are marked TODO(confirm) / TODO(link) and must not be invented.
 */

export type L10n = { en: string; de: string };
export type L10nList = { en: string[]; de: string[] };
export type L10nNullable = L10n | null;

/* ───────────────────────────── Profile ───────────────────────────── */

export type ExperienceItem = {
  id: string;
  title: L10n;
  organization: string;
  location: L10nNullable;
  dateRange: L10n;
  startDate: string | null;
  endDate: string | null;
  isPresent: boolean;
  type: 'corporate' | 'academic' | 'achievement';
  bullets: L10nList;
};

export type CapabilityGroup = {
  id: string;
  title: L10n;
  /** Optional short gloss; omitted rather than invented. */
  context?: L10n;
  /** Skill names / proper nouns — language-neutral. */
  items: string[];
};

export type CredentialTier = 'official' | 'specialization' | 'certificate' | 'coursework';

export type CredentialItem = {
  id: string;
  tier: CredentialTier;
  title: string;
  issuer: string;
  credentialType: L10n;
  issued: L10nNullable;
  /** null → TODO(link): render without a link. */
  verifyUrl: string | null;
  skills: string[];
  /** Material Symbols icon name. */
  icon: string;
};

export type CaseStudyData = {
  id: string;
  slug: string;
  title: string;
  short: L10n;
  full: L10n;
  metrics: L10nList;
  credit: L10nNullable;
  tech: TechStackItem[];
  githubRepo: string | null;
  liveDemoUrl: string | null;
  tier: 0 | 1 | 2 | 3;
  order: number;
  featured: boolean;
  published: boolean;
  isOngoing: boolean;
  projectStatus: 'active' | 'completed' | 'archived';
  projectStartDate: string | null;
  projectEndDate: string | null;
};

const tech = (tag: string, category: TechCategory): TechStackItem => ({ tag, category });

export const PROFILE = {
  name: 'MUHAMMAD HAMDAN ISHFAQ',
  badge: {
    en: 'Open to roles: Supply Chain Analytics · Data Analysis · AI Engineering (Remote)',
    de: 'Offen für Rollen: Supply-Chain-Analytik · Datenanalyse · AI Engineering (remote)', // TODO(review DE)
  },
  hero: {
    subline: {
      en: 'Supply chain analytics and AI engineering · SAP S/4HANA (MM/SD) exposure · AI Engineer @ AI Solutions Lab · Ex-FFC · Ex-MachVis · Ex-NexPred',
      de: 'Supply-Chain-Analytik und AI Engineering · SAP S/4HANA (MM/SD)-Erfahrung · AI Engineer @ AI Solutions Lab · Ex-FFC · Ex-MachVis · Ex-NexPred', // TODO(review DE)
    },
    statement: {
      en: 'I turn operational and sales data into forecasts, dashboards and working systems for supply chains — and I build and test the AI systems that power them.',
      de: 'Ich verwandle operative und Vertriebsdaten in Prognosen, Dashboards und funktionierende Systeme für Lieferketten — und baue und teste die KI-Systeme, die sie antreiben.', // TODO(review DE)
    },
    proof: {
      en: [
        'Analyzed 10 years of fertilizer sales data at FFC and forecast regional demand peaks to support warehouse stocking',
        'Traced end-to-end Procure-to-Pay and Order-to-Cash document flows in live SAP S/4HANA',
        'Built and tested AI systems: HaulRank, HERMES, NEXUS',
      ],
      de: [
        '10 Jahre Düngemittel-Vertriebsdaten bei FFC analysiert und regionale Nachfragespitzen prognostiziert, um die Lagerbestückung zu unterstützen', // TODO(review DE)
        'End-to-End-Dokumentenflüsse von Procure-to-Pay und Order-to-Cash in live SAP S/4HANA nachverfolgt', // TODO(review DE)
        'KI-Systeme gebaut und getestet: HaulRank, HERMES, NEXUS', // TODO(review DE)
      ],
    },
  },
  about: {
    title: { en: 'About', de: 'Über mich' },
    paragraphs: {
      en: [
        "I'm a final-year Data Science student at NUST SEECS (graduating June 2027) who wants to work on supply chain analytics for manufacturers: demand forecasting, inventory and planning.",
        'At Fauji Fertilizer Company I worked inside a live SAP S/4HANA environment and traced how physical movements become document flows in Procure-to-Pay and Order-to-Cash. I also analyzed ten years of the company\u2019s sales data to forecast where and when demand would peak, so regional warehouses could be stocked accordingly.',
        "On the engineering side I build and test AI systems: a hybrid retrieval system evaluated with RAGAS, a freight dispatch optimizer, and an agentic email pipeline. I'm currently an AI Engineer at AI Solutions Lab. I'm available remotely, with flexible hours for US time zones.",
      ],
      de: [
        'Ich bin Data-Science-Student im Abschlussjahr an der NUST SEECS (Abschluss Juni 2027) und möchte an Supply-Chain-Analytik für Hersteller arbeiten: Bedarfsprognose, Bestandsplanung und Planung.', // TODO(review DE)
        'Bei Fauji Fertilizer Company habe ich in einer live SAP S/4HANA-Umgebung gearbeitet und nachverfolgt, wie physische Bewegungen zu Dokumentenflüssen in Procure-to-Pay und Order-to-Cash werden. Außerdem habe ich zehn Jahre Vertriebsdaten des Unternehmens analysiert, um zu prognostizieren, wo und wann die Nachfrage ihren Höhepunkt erreichen würde, damit regionale Lager entsprechend bestückt werden können.', // TODO(review DE)
        'Auf der Engineering-Seite baue und teste ich KI-Systeme: ein hybrides Retrieval-System, bewertet mit RAGAS, einen Fracht-Dispatch-Optimierer und eine agentische E-Mail-Pipeline. Derzeit bin ich AI Engineer bei AI Solutions Lab. Ich bin remote verfügbar, mit flexiblen Zeiten für US-Zeitzonen.', // TODO(review DE)
      ],
    },
  },
  experience: {
    title: { en: 'Experience', de: 'Erfahrung' },
    lead: {
      en: 'Internships across supply chain analytics, SAP operations and applied AI.',
      de: 'Praktika in Supply-Chain-Analytik, SAP-Operations und angewandter KI.', // TODO(review DE)
    },
    items: [
      {
        id: 'ai-solutions-lab',
        title: { en: 'AI Engineer', de: 'AI Engineer' },
        organization: 'AI Solutions Lab',
        // TODO(confirm): role location not supplied.
        location: null,
        dateRange: { en: 'Sep 2026 – Present', de: 'Sep. 2026 – Heute' },
        startDate: '2026-09-01',
        endDate: null,
        isPresent: true,
        type: 'corporate',
        bullets: {
          en: [
            'AI-based Simulation System for Disaster Management: a simulation framework for training personnel to evacuate densely populated workplaces safely (3D simulation, digital twin, reinforcement learning, deep learning).',
          ],
          de: [
            'KI-basiertes Simulationssystem für Katastrophenmanagement: ein Simulationsframework, um Personal darin zu schulen, stark bevölkerte Arbeitsplätze sicher zu evakuieren (3D-Simulation, Digital Twin, Reinforcement Learning, Deep Learning).', // TODO(review DE)
          ],
        },
      },
      {
        id: 'machvis',
        title: { en: 'AI Infrastructure Intern', de: 'AI Infrastructure Intern' },
        organization: 'MachVis',
        // TODO(confirm): role location not supplied.
        location: null,
        dateRange: { en: 'Aug 2026 – Sep 2026', de: 'Aug. 2026 – Sep. 2026' },
        startDate: '2026-08-01',
        endDate: '2026-09-30',
        isPresent: false,
        type: 'corporate',
        bullets: {
          en: [
            // TODO(confirm): "Track 1" wording to be verified.
            'VRAM-aware task router and inference gateway across multiple GPU machines. Only Track 1 of the plan was built.',
          ],
          de: [
            'VRAM-bewusster Task-Router und Inferenz-Gateway über mehrere GPU-Maschinen. Nur Track 1 des Plans wurde umgesetzt.', // TODO(review DE)
          ],
        },
      },
      {
        id: 'ffc-ict',
        title: {
          en: 'ICT Intern, SAP and Data Analytics',
          de: 'ICT-Praktikant, SAP und Datenanalyse',
        },
        organization: 'Fauji Fertilizer Company Limited (FFC)',
        // TODO(confirm): Lahore vs Port Qasim vs other.
        location: { en: 'TODO(confirm)', de: 'TODO(confirm)' },
        dateRange: { en: 'Jun 2026 – Jul 2026', de: 'Jun. 2026 – Jul. 2026' },
        startDate: '2026-06-01',
        endDate: '2026-07-31',
        isPresent: false,
        type: 'corporate',
        bullets: {
          en: [
            'Worked in a live SAP S/4HANA environment in ICT/Distribution, tracing Procure-to-Pay and Order-to-Cash flows across MM and SD.',
            "Provided baseline current-state documentation supporting FFC's \u2018RISE with SAP\u2019 transformation.",
            'Authored 14+ structured process manuals (shipping, receiving, procurement) that turn undocumented know-how into onboarding material.',
            'Analyzed 10 years of company urea and DAP sales by period, region and company: seasonality, market-share peaks, and a forecast of which regions and periods would peak, to support regional warehouse stocking decisions (no figures).',
            'Built a market-intelligence dashboard (Plotly Dash prototype, Power BI final deliverable).',
          ],
          de: [
            'In einer live SAP S/4HANA-Umgebung in ICT/Distribution gearbeitet und Procure-to-Pay- sowie Order-to-Cash-Flüsse über MM und SD nachverfolgt.', // TODO(review DE)
            'Basisdokumentation des Ist-Zustands als Unterstützung für FFCs „RISE with SAP“-Transformation bereitgestellt.', // TODO(review DE)
            'Über 14 strukturierte Prozesshandbücher (Versand, Wareneingang, Beschaffung) erstellt, die undokumentiertes Wissen in Onboarding-Material überführen.', // TODO(review DE)
            '10 Jahre Harnstoff- und DAP-Absatzdaten des Unternehmens nach Zeitraum, Region und Gesellschaft analysiert: Saisonalität, Marktanteilsspitzen und eine Prognose, welche Regionen und Zeiträume ihren Höhepunkt erreichen würden, um die regionale Lagerbestückung zu unterstützen (keine Zahlen).', // TODO(review DE)
            'Ein Marktintelligenz-Dashboard erstellt (Plotly-Dash-Prototyp, Power BI als finales Deliverable).', // TODO(review DE)
          ],
        },
      },
      {
        id: 'nexpred-ai',
        title: { en: 'Applied AI Engineer', de: 'Applied AI Engineer' },
        organization: 'NexPred Solutions',
        // TODO(confirm): role location not supplied.
        location: null,
        dateRange: { en: 'Apr 2026 – May 2026', de: 'Apr. 2026 – Mai 2026' },
        startDate: '2026-04-01',
        endDate: '2026-05-31',
        isPresent: false,
        type: 'corporate',
        bullets: {
          en: [
            'Worked on the Truck Checker computer-vision project (truckchecker.ai).',
            // TODO(confirm): on-premise RAG bullet to be verified.
            'Engineered locally hosted Retrieval-Augmented Generation (RAG) pipelines to process unstructured enterprise data securely, keeping all processing inside the corporate firewall.',
            // TODO(confirm): local LLM bullet to be verified.
            'Evaluated and deployed open-source LLMs on constrained enterprise hardware, eliminating cloud API dependencies and reducing data-leakage risk.',
            // TODO(confirm): Docker bullet to be verified.
            'Packaged AI applications and data pipelines with Docker for isolated client servers.',
          ],
          de: [
            'Am Computer-Vision-Projekt Truck Checker mitgearbeitet (truckchecker.ai).', // TODO(review DE)
            'Lokal gehostete Retrieval-Augmented-Generation-(RAG-)Pipelines entwickelt, um unstrukturierte Unternehmensdaten sicher zu verarbeiten und alle Verarbeitung innerhalb der Unternehmens-Firewall zu halten.', // TODO(review DE)
            'Open-Source-LLMs auf leistungsbeschränkter Unternehmenshardware evaluiert und bereitgestellt, um Cloud-API-Abhängigkeiten zu eliminieren und das Risiko von Datenabflüssen zu verringern.', // TODO(review DE)
            'KI-Anwendungen und Datenpipeline mit Docker für isolierte Kundenserver verpackt.', // TODO(review DE)
          ],
        },
      },
    ] satisfies ExperienceItem[],
  },
  capabilities: {
    title: { en: 'Capabilities', de: 'Kompetenzen' },
    lead: {
      en: 'Four areas: SAP operations, supply chain analytics, data engineering and AI systems.',
      de: 'Vier Bereiche: SAP-Operations, Supply-Chain-Analytik, Data Engineering und KI-Systeme.', // TODO(review DE)
    },
    aria: { en: 'Capabilities', de: 'Kompetenzen' },
    groups: [
      {
        id: 'sap',
        title: { en: 'SAP and Enterprise Operations', de: 'SAP und Unternehmensprozesse' }, // TODO(review DE)
        items: ['S/4HANA navigation', 'MM and SD process flows', 'Procure-to-Pay', 'Order-to-Cash'],
      },
      {
        id: 'scm',
        title: { en: 'Supply Chain Analytics', de: 'Supply-Chain-Analytik' }, // TODO(review DE)
        items: [
          'demand analysis and forecasting',
          'sales and seasonality analysis',
          'dashboards (Plotly Dash, Power BI)',
        ],
      },
      {
        id: 'data',
        title: { en: 'Data and Backend Engineering', de: 'Data- und Backend-Engineering' }, // TODO(review DE)
        items: [
          'Python',
          'SQL',
          'PostgreSQL (pgvector)',
          'FastAPI',
          'Django REST',
          'OR-Tools',
          'Docker',
        ],
      },
      {
        id: 'ai',
        title: { en: 'AI Systems', de: 'KI-Systeme' }, // TODO(review DE)
        items: ['RAG and GraphRAG', 'LangGraph', 'MCP', 'LLM tool-calling', 'RAGAS evaluation'],
      },
    ] satisfies CapabilityGroup[],
  },
  credentials: {
    title: {
      en: 'Credentials & Professional Development',
      de: 'Nachweise & berufliche Weiterbildung', // TODO(review DE)
    },
    lead: {
      en: 'SAP Learning course badges, then specializations and verified coursework.',
      de: 'SAP-Lernkurs-Badges, danach Spezialisierungen und verifizierte Kursarbeit.', // TODO(review DE)
    },
    aria: {
      en: 'Credentials and professional development',
      de: 'Nachweise und berufliche Weiterbildung', // TODO(review DE)
    },
    tier1: { en: 'Official credentials', de: 'Offizielle Nachweise' },
    tier2: { en: 'Professional development', de: 'Berufliche Weiterbildung' }, // TODO(review DE)
    tier2Hint: { en: 'Verified coursework', de: 'Verifizierte Kursarbeit' }, // TODO(review DE)
    tier3: { en: 'Coursework', de: 'Kursarbeit' }, // TODO(review DE)
    items: [
      {
        id: 'sap-s4-sourcing-procurement',
        tier: 'official',
        title: 'Business Processes in SAP S/4HANA Sourcing and Procurement',
        issuer: 'SAP',
        credentialType: { en: 'SAP Learning course badge', de: 'SAP-Lernkurs-Badge' }, // TODO(review DE)
        issued: { en: 'Aug 2026', de: 'Aug. 2026' },
        verifyUrl: 'https://badger.learning.sap.com/verify/xivim-sacul-nopig-tilyt-vycaf',
        skills: ['SAP MM', 'SAP ERP', 'Procurement'],
        icon: 'verified',
      },
      {
        id: 'sap-basic-erp-processes',
        tier: 'official',
        title: 'Executing Basic ERP Processes with SAP S/4HANA',
        issuer: 'SAP',
        credentialType: { en: 'SAP Learning course badge', de: 'SAP-Lernkurs-Badge' }, // TODO(review DE)
        // TODO(confirm): issue date not supplied.
        issued: null,
        // TODO(link): badge URL not supplied.
        verifyUrl: null,
        skills: ['SAP S/4HANA', 'ERP'],
        icon: 'verified',
      },
      {
        id: 'sap-cross-application-processes',
        tier: 'official',
        title: 'Configuring Cross-Application Processes in SAP S/4HANA (Advanced)',
        issuer: 'SAP',
        credentialType: { en: 'SAP Learning course badge', de: 'SAP-Lernkurs-Badge' }, // TODO(review DE)
        // TODO(confirm): issue date not supplied.
        issued: null,
        // TODO(link): badge URL not supplied.
        verifyUrl: null,
        skills: ['SAP S/4HANA', 'Process Configuration'],
        icon: 'verified',
      },
      {
        id: 'sap-sales-essentials',
        tier: 'official',
        title: 'Sales Essentials',
        issuer: 'SAP',
        credentialType: { en: 'SAP Learning course badge', de: 'SAP-Lernkurs-Badge' }, // TODO(review DE)
        // TODO(confirm): issue date not supplied.
        issued: null,
        // TODO(link): badge URL not supplied.
        verifyUrl: null,
        skills: ['SAP SD', 'Sales'],
        icon: 'verified',
      },
      {
        id: 'deeplearning-ml',
        tier: 'specialization',
        title: 'Machine Learning',
        issuer: 'DeepLearning.AI',
        credentialType: { en: 'Specialization', de: 'Spezialisierung' }, // TODO(review DE)
        issued: { en: 'Sep 2024', de: 'Sep. 2024' },
        verifyUrl: 'https://www.coursera.org/account/accomplishments/specialization/F6TL2KKA0WDH',
        skills: ['Machine Learning', 'Python'],
        icon: 'model_training',
      },
      {
        id: 'google-data-analytics',
        tier: 'certificate',
        title: 'Google Data Analytics',
        issuer: 'Coursera',
        credentialType: { en: 'Professional Certificate', de: 'Berufszertifikat' }, // TODO(review DE)
        issued: { en: 'Apr 2024', de: 'Apr. 2024' },
        verifyUrl:
          'https://www.coursera.org/account/accomplishments/professional-cert/QBW3MRQWDYFH',
        skills: ['R', 'Data Analysis'],
        icon: 'analytics',
      },
      {
        id: 'alison-scm-intro',
        tier: 'coursework',
        title: 'An Introduction to Supply Chain Management',
        issuer: 'Alison',
        credentialType: { en: 'Course', de: 'Kurs' },
        issued: null,
        verifyUrl: 'https://alison.com/verify/9b04ff8818',
        skills: ['Supply Chain'],
        icon: 'local_shipping',
      },
      {
        id: 'alison-sourcing-procurement',
        tier: 'coursework',
        title: 'Effective Practices for Sourcing, Purchasing & Procurement',
        issuer: 'Alison',
        credentialType: { en: 'Course', de: 'Kurs' },
        issued: null,
        verifyUrl: 'https://alison.com/verify/2a0316a211',
        skills: ['Procurement'],
        icon: 'shopping_cart',
      },
    ] satisfies CredentialItem[],
  },
  caseStudies: {
    titleBefore: { en: 'Case studies with', de: 'Fallstudien mit' }, // TODO(review DE)
    titleAccent: { en: 'evidence', de: 'Nachweis' }, // TODO(review DE)
    titleAfter: { en: ', not pitch decks.', de: ', nicht mit Pitch-Decks.' }, // TODO(review DE)
    lead: {
      en: 'Operational systems and applied builds with verified tests, no invented metrics.',
      de: 'Betriebliche Systeme und angewandte Builds mit verifizierten Tests, keine erfundenen Kennzahlen.', // TODO(review DE)
    },
    items: [
      {
        id: 'case-haulrank',
        slug: 'haulrank',
        title: 'HaulRank: Freight Dispatch Optimization System',
        short: {
          en: 'A deterministic load scoring and dispatch ranking system for small carriers. It solves real routing and freight audit bottlenecks with OR-Tools (CP-SAT MIP) and Hungarian algorithms for fleet optimization, with an LLM solely for parsing intent and tool-calling.',
          // TODO(confirm): previously said "Inspired by live logistics at FFC".
          de: 'Ein deterministisches Lastbewertungs- und Dispatch-Ranking-System für kleine Frachtführer. Es löst Routing- und Frachtaudit-Engpässe mit OR-Tools (CP-SAT MIP) und Hungarian-Algorithmen zur Flottenoptimierung; ein LLM dient ausschließlich dem Parsen von Absichten und Tool-Calling.', // TODO(review DE)
        },
        full: {
          en: 'HaulRank applies freight discipline to load ranking: every score is reproducible, every assignment has a state, and AI never invents the number. Scoring is deterministic pure Python — no LLM in the score path. The LLM only parses intent, calls tools, or narrates stored numbers.',
          de: 'HaulRank wendet Frachtdisziplin auf das Last-Ranking an: jede Bewertung ist reproduzierbar, jede Zuweisung hat einen Status und die KI erfindet niemals die Zahl. Die Bewertung ist deterministisches reines Python – kein LLM im Score-Pfad. Das LLM parst nur Absichten, ruft Tools auf oder erzählt gespeicherte Zahlen.', // TODO(review DE)
        },
        metrics: {
          en: [
            '183/183 adversarial E2E tests passed',
            'Deterministic pure Python engine (no LLM in the score path)',
          ],
          de: [
            '183/183 adversarial E2E-Tests bestanden', // TODO(review DE)
            'Deterministische reine Python-Engine (kein LLM im Score-Pfad)', // TODO(review DE)
          ],
        },
        credit: null,
        tech: [
          tech('Python', 'language'),
          tech('OR-Tools', 'tool'),
          tech('Django', 'framework'),
          tech('PostgreSQL', 'database'),
          tech('Redis', 'database'),
          tech('Docker', 'tool'),
        ],
        githubRepo: 'https://github.com/hamdan-ishfaq/HAULRANK',
        liveDemoUrl: 'https://haulrank.vercel.app/',
        tier: 0,
        order: 0,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-ffc-demand-analysis',
        slug: 'ffc-demand-analysis',
        title: 'FFC Demand Analysis',
        short: {
          en: 'Descriptive and lightly predictive analysis of 10 years of company urea and DAP sales by period, region and company, plus a market-intelligence dashboard, to support regional warehouse stocking. Company data not published for confidentiality.',
          de: 'Deskriptive und leicht prädiktive Analyse von 10 Jahren Harnstoff- und DAP-Absatzdaten des Unternehmens nach Zeitraum, Region und Gesellschaft, plus ein Marktintelligenz-Dashboard zur Unterstützung der regionalen Lagerbestückung. Unternehmensdaten aus Vertraulichkeitsgründen nicht veröffentlicht.', // TODO(review DE)
        },
        full: {
          en: 'Method (company data not disclosed):\n\n- Source: 10 years of company urea and DAP sales by period, region and company.\n- Descriptive analysis: seasonality by fertilizer type, and market-share peaks.\n- Predictive part: a small model forecasting which regions and periods would peak.\n- Dashboard: Plotly Dash prototype, then a Power BI final deliverable.\n\nPurpose: supply chain planning for regional warehouse stocking.\n\nCompany data not published for confidentiality.',
          de: 'Methode (Unternehmensdaten nicht offengelegt):\n\n- Quelle: 10 Jahre Harnstoff- und DAP-Absatzdaten des Unternehmens nach Zeitraum, Region und Gesellschaft.\n- Deskriptive Analyse: Saisonalität nach Düngemitteltyp und Marktanteilsspitzen.\n- Prädiktiver Teil: ein kleines Modell, das prognostiziert, welche Regionen und Zeiträume ihren Höhepunkt erreichen.\n- Dashboard: Plotly-Dash-Prototyp, danach ein Power-BI-Deliverable.\n\nZweck: Supply-Chain-Planung für die regionale Lagerbestückung.\n\nUnternehmensdaten aus Vertraulichkeitsgründen nicht veröffentlicht.', // TODO(review DE)
        },
        metrics: {
          en: ['Company data not published for confidentiality.'],
          de: ['Unternehmensdaten aus Vertraulichkeitsgründen nicht veröffentlicht.'], // TODO(review DE)
        },
        credit: null,
        tech: [tech('Python', 'language'), tech('Plotly Dash', 'tool'), tech('Power BI', 'tool')],
        githubRepo: null,
        liveDemoUrl: null,
        tier: 1,
        order: 1,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-hermes',
        slug: 'hermes',
        title: 'HERMES',
        short: {
          en: 'Hybrid retrieval-augmented generation: BGE-m3 dense retrieval, BM25 lexical search, reciprocal rank fusion (RRF) and a cross-encoder, exposed through an MCP server.',
          de: 'Hybride Retrieval-Augmented Generation: dichte BGE-m3-Suche, lexikalische BM25-Suche, Reciprocal Rank Fusion (RRF) und ein Cross-Encoder, bereitgestellt über einen MCP-Server.', // TODO(review DE)
        },
        full: {
          en: 'HERMES is a hybrid retrieval-augmented generation system combining BGE-m3 dense retrieval, BM25 lexical search, reciprocal rank fusion (RRF) and a cross-encoder reranker, exposed through an MCP server. Evaluated with RAGAS on a 20-question gold set I wrote: the set is small and self-authored, so the scores are directional rather than a formal benchmark.',
          de: 'HERMES ist ein hybrides Retrieval-Augmented-Generation-System, das dichte BGE-m3-Suche, lexikalische BM25-Suche, Reciprocal Rank Fusion (RRF) und einen Cross-Encoder-Reranker kombiniert und über einen MCP-Server bereitgestellt wird. Mit RAGAS auf einem von mir erstellten 20-Fragen-Gold-Set bewertet: Das Set ist klein und selbst erstellt, daher sind die Werte richtungsweisend und keine formale Benchmark.', // TODO(review DE)
        },
        metrics: {
          en: [
            'Faithfulness: 1.00',
            'Answer relevancy: 0.87',
            'Context precision: 0.83',
            'Context recall: 1.00',
            'RAGAS on a 20-question gold set I authored (small, self-authored).',
          ],
          de: [
            'Treue (Faithfulness): 1.00', // TODO(review DE)
            'Antwortrelevanz: 0.87', // TODO(review DE)
            'Kontextpräzision: 0.83', // TODO(review DE)
            'Kontextabdeckung (Recall): 1.00', // TODO(review DE)
            'RAGAS auf einem von mir erstellten 20-Fragen-Gold-Set (klein, selbst erstellt).', // TODO(review DE)
          ],
        },
        credit: null,
        tech: [
          tech('BGE-m3', 'tool'),
          tech('BM25', 'tool'),
          tech('RRF', 'tool'),
          tech('Cross-encoder', 'tool'),
          tech('Python', 'language'),
          tech('RAGAS', 'tool'),
          tech('MCP', 'tool'),
        ],
        githubRepo: 'https://github.com/hamdan-ishfaq/HERMES',
        liveDemoUrl: null,
        tier: 1,
        order: 2,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-nexus',
        slug: 'nexus',
        title: 'NEXUS',
        short: {
          en: '6-node LangGraph pipeline and MCP server with Gmail integration for structured agentic workflows.',
          de: '6-Knoten-LangGraph-Pipeline und MCP-Server mit Gmail-Integration für strukturierte agentische Workflows.', // TODO(review DE)
        },
        full: {
          en: 'NEXUS is a 6-node LangGraph pipeline and MCP server with Gmail integration. Verified with component checks, unit tests, and end-to-end coverage.',
          de: 'NEXUS ist eine 6-Knoten-LangGraph-Pipeline und ein MCP-Server mit Gmail-Integration. Verifiziert mit Komponenten-Checks, Unit-Tests und End-to-End-Abdeckung.', // TODO(review DE)
        },
        metrics: {
          en: ['25/25 component checks', '36 unit tests', '19/19 E2E tests'],
          de: ['25/25 Komponenten-Checks', '36 Unit-Tests', '19/19 E2E-Tests'], // TODO(review DE)
        },
        credit: null,
        tech: [
          tech('LangGraph', 'framework'),
          tech('Python', 'language'),
          tech('MCP', 'tool'),
          tech('Gmail API', 'cloud'),
        ],
        githubRepo: null,
        liveDemoUrl: null,
        tier: 1,
        order: 3,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-jurisguard-v2',
        slug: 'jurisguard-v2',
        title: 'JurisGuard V2',
        short: {
          en: 'Air-gapped on-premise legal RAG with local inference and role-based access control, designed around GDPR, BDSG and BSI requirements for the DACH market. Includes a 17-test suite.',
          de: 'Air-gapped On-Premise-Legal-RAG mit lokaler Inferenz und rollenbasierter Zugriffskontrolle, konzipiert entlang den Anforderungen von DSGVO, BDSG und BSI für den DACH-Markt. Inklusive 17-Test-Suite.', // TODO(review DE)
        },
        full: {
          en: 'JurisGuard V2 is an air-gapped, on-premise legal retrieval system with local inference and role-based access control, designed around GDPR, BDSG and BSI requirements for the DACH market. It is not certified compliant; the design is aligned to those requirements. The build includes a 17-test suite.',
          de: 'JurisGuard V2 ist ein air-gapped On-Premise- Rechts-Retrieval-System mit lokaler Inferenz und rollenbasierter Zugriffskontrolle, konzipiert entlang den Anforderungen von DSGVO, BDSG und BSI für den DACH-Markt. Es ist nicht zertifiziert konform; das Design orientiert sich an diesen Anforderungen. Der Build umfasst eine 17-Test-Suite.', // TODO(review DE)
        },
        metrics: {
          en: ['17-test suite', 'On-premise, local inference', 'Role-based access control'],
          de: ['17-Test-Suite', 'On-Premise, lokale Inferenz', 'Rollenbasierte Zugriffskontrolle'], // TODO(review DE)
        },
        credit: null,
        tech: [tech('Python', 'language'), tech('PostgreSQL', 'database'), tech('Docker', 'tool')],
        githubRepo: null,
        liveDemoUrl: null,
        tier: 1,
        order: 4,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-talash',
        slug: 'talash',
        title: 'TALASH',
        short: {
          en: 'Asynchronous CV parsing and matching pipeline for high-volume candidate screening workflows. Two-person university project; I built the pipeline.',
          de: 'Asynchrone Lebenslauf-Parsing- und Matching-Pipeline für Screening-Workflows mit hohem Volumen. Zwei-Personen-Universitätsprojekt; die Pipeline habe ich gebaut.', // TODO(review DE)
        },
        full: {
          en: 'TALASH is an asynchronous CV parsing and matching pipeline built with FastAPI, Celery, Redis, Postgres and OpenRouter. It was a two-person university project; I built the pipeline.',
          de: 'TALASH ist eine asynchrone Lebenslauf-Parsing- und Matching-Pipeline, gebaut mit FastAPI, Celery, Redis, Postgres und OpenRouter. Es war ein Zwei-Personen-Universitätsprojekt; die Pipeline habe ich gebaut.', // TODO(review DE)
        },
        metrics: {
          en: [],
          de: [],
        },
        credit: {
          en: 'Two-person university project; I built the pipeline.',
          de: 'Zwei-Personen-Universitätsprojekt; die Pipeline habe ich gebaut.', // TODO(review DE)
        },
        tech: [
          tech('FastAPI', 'framework'),
          tech('Celery', 'tool'),
          tech('Redis', 'database'),
          tech('Postgres', 'database'),
          tech('OpenRouter', 'cloud'),
        ],
        githubRepo: null,
        liveDemoUrl: null,
        tier: 1,
        order: 5,
        featured: true,
        published: true,
        isOngoing: false,
        projectStatus: 'completed',
        projectStartDate: null,
        projectEndDate: null,
      },
      {
        id: 'case-final-year-project',
        slug: 'final-year-project',
        title: 'Final Year Project',
        short: {
          en: 'Secure, Offline AI System for Legal Research and Workflow Support in Judicial Environments — a three-person team where I lead the GraphRAG and retriever work. In progress.',
          de: 'Sicheres, Offline-KI-System für juristische Recherche und Workflow-Unterstützung in Justizumgebungen – ein Drei-Personen-Team, in dem ich die GraphRAG- und Retriever-Arbeit leite. In Arbeit.', // TODO(review DE)
        },
        full: {
          en: 'An in-progress final-year project: a secure, offline AI system for legal research and workflow support in judicial environments. It is a three-person team, and I lead the GraphRAG and retriever work, focused on grounded legal retrieval. No outcome claims yet.',
          de: 'Ein laufendes Abschlussprojekt: ein sicheres, Offline-KI-System für juristische Recherche und Workflow-Unterstützung in Justizumgebungen. Es ist ein Drei-Personen-Team, und ich leite die GraphRAG- und Retriever-Arbeit mit Fokus auf fundiertes juristisches Retrieval. Noch keine Ergebnisaussagen.', // TODO(review DE)
        },
        metrics: { en: [], de: [] },
        credit: null,
        tech: [
          tech('GraphRAG', 'tool'),
          tech('Python', 'language'),
          tech('PostgreSQL', 'database'),
        ],
        githubRepo: null,
        liveDemoUrl: null,
        tier: 1,
        order: 6,
        featured: true,
        published: true,
        isOngoing: true,
        projectStatus: 'active',
        projectStartDate: null,
        projectEndDate: null,
      },
    ] satisfies CaseStudyData[],
  },
} as const;

/* ───────────────────────────── Selectors ───────────────────────────── */

export type ResolvedCaseStudy = Project & { metrics: string[]; credit?: string };

export function pick(value: L10n, locale: Locale): string {
  return value[locale];
}

export function resolveCaseStudy(study: CaseStudyData, locale: Locale): ResolvedCaseStudy {
  return {
    id: study.id,
    title: study.title,
    slug: study.slug,
    short_description: study.short[locale],
    full_description: study.full[locale],
    cover_image_url: null,
    tech_stack: study.tech,
    github_repo: study.githubRepo,
    loom_video_id_demo: null,
    loom_video_id_arch: null,
    linkedin_url: null,
    live_demo_url: study.liveDemoUrl,
    project_start_date: study.projectStartDate,
    project_end_date: study.projectEndDate,
    is_ongoing: study.isOngoing,
    project_status: study.projectStatus,
    tier: study.tier,
    order: study.order,
    featured: study.featured,
    published: study.published,
    created_at: '',
    updated_at: '',
    metrics: study.metrics[locale],
    ...(study.credit ? { credit: study.credit[locale] } : {}),
  };
}

export function getStaticCaseStudy(slug: string): CaseStudyData | undefined {
  return PROFILE.caseStudies.items.find((item) => item.slug === slug);
}

export function getCaseStudies(locale: Locale): ResolvedCaseStudy[] {
  return PROFILE.caseStudies.items
    .filter((item) => item.published)
    .sort((a, b) => a.order - b.order)
    .map((item) => resolveCaseStudy(item, locale));
}

export function getExperience(locale: Locale): TimelineEvent[] {
  return PROFILE.experience.items.map((item, index) => ({
    id: item.id,
    type: item.type,
    title: item.title[locale],
    organization: item.organization,
    location: item.location ? item.location[locale] : '',
    date_range: item.dateRange[locale],
    start_date: item.startDate ?? '',
    end_date: item.endDate,
    description: item.bullets[locale],
    logo_url: null,
    order: index,
  }));
}

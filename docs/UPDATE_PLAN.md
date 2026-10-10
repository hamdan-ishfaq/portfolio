# UPDATE_PLAN — Two-lane content refresh

Branch: `content-refresh` · Follows `docs/AUDIT.md` · No secrets referenced.

## 0. Guiding decisions (agreed)

1. **Single source of truth:** `lib/content/profile.ts` holds **all section content** (hero, about, experience, capabilities, credentials, case studies) as bilingual `{ en, de }` values. `lib/i18n/messages/*` keeps only short UI-chrome strings (nav, buttons, form labels, tabs, aria, errors).
2. **Static case-study actions:** the detail page resolves the DB project **by slug**. If a matching UUID row exists, Demo Request + Discussion work as today; if not, the page renders **read-only** (no Request Live Demo, no comment form) with a short note.
3. **Dead code is deleted** in 3h (`DocumentFlowTicker`, `SupplyChainNetwork`, `DEFAULT_HERO_TECH_STACK`, and the migrated `lib/content/portfolio.ts`).
4. **DE proofreading:** every German value starts as a draft and carries a `// TODO(review DE)` marker. All such strings are listed in the final report.
5. **Unknowns** become `TODO(confirm)` in code (rule 3) and are listed in the final report. No invented metrics, dates, employers, links or screenshots.
6. **Confidentiality:** no FFC figures, charts, region names, market-share numbers, SAP Z-codes (ZHCP/ZFIST) or weighbridge/FBR details. No CGPA, phone or address.

---

## 1. New file: `lib/content/profile.ts` (the single source of truth)

### 1.1 Schema

```ts
import type { Locale } from '@/lib/i18n';
import type { Project, TechStackItem } from '@/types';

export type L10n = { en: string; de: string };
export type L10nList = { en: string[]; de: string[] };
export type L10nNullable = L10n | null;

export type ExperienceItem = {
  id: string;
  title: L10n;
  organization: string;              // proper noun — same in both languages
  location: L10nNullable;            // null = omit; 'TODO(confirm)' = visible placeholder
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
  context?: L10n;                    // optional — omitted rather than invented
  items: string[];                   // proper nouns / skill names — language-neutral
};

export type CredentialTier = 'official' | 'specialization' | 'certificate' | 'coursework';

export type CredentialItem = {
  id: string;
  tier: CredentialTier;
  title: string;                     // proper noun
  issuer: string;
  credentialType: L10n;
  issued: L10nNullable;
  verifyUrl: string | null;          // null = TODO(link): render non-link card
  skills: string[];
  icon: string;                      // Material Symbols
};

export type CaseStudyData = {
  id: string;                        // non-UUID, e.g. 'case-jurisguard-v2'
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

export const PROFILE: {
  name: string;
  badge: L10n;
  hero: { subline: L10n; statement: L10n; proof: L10nList };
  about: { title: L10n; paragraphs: L10nList };
  experience: ExperienceItem[];
  capabilities: { title: L10n; lead: L10n; aria: L10n; groups: CapabilityGroup[] };
  credentials: { title: L10n; lead: L10n; aria: L10n; tier1: L10n; tier2: L10n; tier2Hint: L10n; items: CredentialItem[] };
  caseStudies: { titleBefore: L10n; titleAccent: L10n; titleAfter: L10n; lead: L10n; aria: L10n; items: CaseStudyData[] };
};

// Selectors (pure, tree-shake friendly)
export function pick(value: L10n, locale: Locale): string;
export function resolveCaseStudy(study: CaseStudyData, locale: Locale): Project;
export function getStaticCaseStudy(slug: string): CaseStudyData | undefined;
export function getCaseStudies(locale: Locale): Project[];   // sorted by order, published only
export function getExperience(locale: Locale): /* TimelineEvent-shaped */ ...;
```

`resolveCaseStudy` / `getExperience` flatten `{en,de}` → plain strings for the active locale so existing components (`ProjectCard`, `ProjectClientWrapper`, `Timeline`) keep their current prop shapes with minimal churn.

### 1.2 Content (EN verbatim from brief; DE = draft, all `TODO(review DE)`)

**Identity / badge / hero**

| Field          | EN                                                                                                                              | DE (draft)                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| name           | `MUHAMMAD HAMDAN ISHFAQ`                                                                                                        | same                                                                                                                                         |
| badge          | Open to roles: Supply Chain Analytics · Data Analysis · AI Engineering (Remote)                                                 | Offen für Rollen: Supply-Chain-Analytik · Datenanalyse · AI Engineering (remote)                                                             |
| hero.subline   | Supply chain analytics and AI engineering · SAP S/4HANA (MM/SD) exposure · AI Engineer @ AI Solutions Lab · Ex-FFC · Ex-NexPred | Supply-Chain-Analytik und AI Engineering · SAP S/4HANA (MM/SD)-Erfahrung · AI Engineer @ AI Solutions Lab · Ex-FFC · Ex-NexPred              |
| hero.statement | I turn operational and sales data into forecasts, dashboards and working systems for supply chains.                             | Ich verwandle operative und Vertriebsdaten in Prognosen, Dashboards und funktionierende Systeme für Lieferketten.                            |
| hero.proof[0]  | Analyzed 10 years of fertilizer sales data at FFC and forecast regional demand peaks to support warehouse stocking              | 10 Jahre Düngemittel-Vertriebsdaten bei FFC analysiert und regionale Nachfragespitzen prognostiziert, um die Lagerbestückung zu unterstützen |
| hero.proof[1]  | Traced end-to-end Procure-to-Pay and Order-to-Cash document flows in live SAP S/4HANA                                           | End-to-End-Dokumentenflüsse von Procure-to-Pay und Order-to-Cash in live SAP S/4HANA nachverfolgt                                            |
| hero.proof[2]  | Built and tested AI systems: HaulRank, HERMES, NEXUS                                                                            | KI-Systeme gebaut und getestet: HaulRank, HERMES, NEXUS                                                                                      |

**About** — title `About` / `Über mich`. The three paragraphs are used exactly as supplied; DE drafted below. The old `lead`, `competencies` and `close` blocks are removed (clichés / duplication with Capabilities).

> EN P1 — I'm a final-year Data Science student at NUST SEECS (graduating June 2027) who wants to work on supply chain analytics for manufacturers: demand forecasting, inventory and planning.
> DE P1 — Ich bin Data-Science-Student im Abschlussjahr an der NUST SEECS (Abschluss Juni 2027) und möchte an Supply-Chain-Analytik für Hersteller arbeiten: Bedarfsprognose, Bestandsplanung und Planung.
>
> EN P2 — At Fauji Fertilizer Company I worked inside a live SAP S/4HANA environment and traced how physical movements become document flows in Procure-to-Pay and Order-to-Cash. I also analyzed ten years of the company's sales data to forecast where and when demand would peak, so regional warehouses could be stocked accordingly.
> DE P2 — Bei Fauji Fertilizer Company habe ich in einer live SAP S/4HANA-Umgebung gearbeitet und nachverfolgt, wie physische Bewegungen zu Dokumentenflüssen in Procure-to-Pay und Order-to-Cash werden. Außerdem habe ich zehn Jahre Vertriebsdaten des Unternehmens analysiert, um zu prognostizieren, wo und wann die Nachfrage ihren Höhepunkt erreichen würde, damit regionale Lager entsprechend bestückt werden können.
>
> EN P3 — On the engineering side I build and test AI systems: a hybrid retrieval system evaluated with RAGAS, a freight dispatch optimizer, and an agentic email pipeline. I'm currently an AI Engineer at AI Solutions Lab. I'm available remotely, with flexible hours for US time zones.
> DE P3 — Auf der Engineering-Seite baue und teste ich KI-Systeme: ein hybrides Retrieval-System, bewertet mit RAGAS, einen Fracht-Dispatch-Optimierer und eine agentische E-Mail-Pipeline. Derzeit bin ich AI Engineer bei AI Solutions Lab. Ich bin remote verfügbar, mit flexiblen Zeiten für US-Zeitzonen.

**Experience** (newest first)

Section: title `Experience` / `Erfahrung`; lead (new, neutral) EN "Internships across supply chain analytics, SAP operations and applied AI." / DE "Praktika in Supply-Chain-Analytik, SAP-Operations und angewandter KI." `TODO(review DE)`

1. **AI Solutions Lab — AI Engineer** · Sept 2026 – present · location `null`
   - EN: "AI-based Simulation System for Disaster Management: a simulation framework for training personnel to evacuate densely populated workplaces safely (3D simulation, digital twin, reinforcement learning, deep learning)."
   - DE: "KI-basiertes Simulationssystem für Katastrophenmanagement: ein Simulationsframework, um Personal darin zu schulen, stark bevölkerte Arbeitsplätze sicher zu evakuieren (3D-Simulation, Digital Twin, Reinforcement Learning, Deep Learning)."
   - `// TODO(confirm): exact job title; keep description high level.`
2. **MachVis — AI Infrastructure Intern** · Aug 2026 – Sep 2026 · location `null`
   - EN: "VRAM-aware task router and inference gateway across multiple GPU machines. Only Track 1 of the plan was built." `// TODO(confirm): Track 1 wording.`
   - DE: "VRAM-bewusster Task-Router und Inferenz-Gateway über mehrere GPU-Maschinen. Nur Track 1 des Plans wurde umgesetzt."
3. **Fauji Fertilizer Company Limited (FFC) — ICT Intern, SAP and Data Analytics** · Jun 2026 – Jul 2026 · location `'TODO(confirm)'` `// TODO(confirm): Lahore vs Port Qasim vs other.`
   - Bullet 1 EN: "Worked in a live SAP S/4HANA environment in ICT/Distribution, tracing Procure-to-Pay and Order-to-Cash flows across MM and SD." (no Z-codes)
   - Bullet 2 EN: "Authored 14+ structured process manuals (shipping, receiving, procurement) that turn undocumented know-how into onboarding material."
   - Bullet 3 EN: "Analyzed 10 years of company urea and DAP sales by period, region and company: seasonality, market-share peaks, and a forecast of which regions and periods would peak, to support regional warehouse stocking decisions (no figures)."
   - Bullet 4 EN: "Built a market-intelligence dashboard (Plotly Dash prototype, Power BI final deliverable)."
   - Bullet 5 (kept, generic, already on site) EN: "Provided baseline current-state documentation supporting FFC's 'RISE with SAP' transformation." (weighbridge/FBR + ZHCP/ZFIST removed)
   - DE drafts for all five with `TODO(review DE)`.
4. **NexPred Solutions — Applied AI Engineer** · Apr 2026 – May 2026 · location `null`
   - Bullet 1 EN: "Worked on the Truck Checker computer-vision project (truckchecker.ai)."
   - Bullets 2–4: existing on-premise RAG / local LLM / Docker bullets kept verbatim but each tagged `// TODO(confirm)`.
   - DE drafts with `TODO(review DE)`.

**Capabilities** — no ordinal numbers; `context` omitted. Section title `Capabilities` / `Kompetenzen`; lead EN "Four areas: SAP operations, supply chain analytics, data engineering and AI systems." / DE "Vier Bereiche: SAP-Operations, Supply-Chain-Analytik, Data Engineering und KI-Systeme." `TODO(review DE)`

| Group                         | Items                                                                                                 |
| ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| SAP and Enterprise Operations | S/4HANA navigation · MM and SD process flows · Procure-to-Pay · Order-to-Cash                         |
| Supply Chain Analytics        | demand analysis and forecasting · sales and seasonality analysis · dashboards (Plotly Dash, Power BI) |
| Data and Backend Engineering  | Python · SQL · PostgreSQL (pgvector) · FastAPI · Django REST · OR-Tools · Docker                      |
| AI Systems                    | RAG and GraphRAG · LangGraph · MCP · LLM tool-calling · RAGAS evaluation                              |

Only EN/DE titles need translating. **No AWS.**

**Credentials** — section title `Credentials & Professional Development` / `Nachweise & berufliche Weiterbildung`; `tier1` = "SAP Learning course badges" where relevant (never "certification"). `credentialType` per SAP item = "SAP Learning course badge" / "SAP-Lernkurs-Badge".

| Tier           | Item                                                              | Issuer          | credentialType            | issued        | verify              |
| -------------- | ----------------------------------------------------------------- | --------------- | ------------------------- | ------------- | ------------------- |
| official       | Business Processes in SAP S/4HANA Sourcing and Procurement        | SAP             | SAP Learning course badge | Aug 2026      | existing URL        |
| official       | Executing Basic ERP Processes with SAP S/4HANA                    | SAP             | SAP Learning course badge | TODO(confirm) | `null` → TODO(link) |
| official       | Configuring Cross-Application Processes in SAP S/4HANA (Advanced) | SAP             | SAP Learning course badge | TODO(confirm) | `null` → TODO(link) |
| official       | Sales Essentials                                                  | SAP             | SAP Learning course badge | TODO(confirm) | `null` → TODO(link) |
| specialization | Machine Learning                                                  | DeepLearning.AI | Specialization            | Sep 2024      | existing URL        |
| certificate    | Google Data Analytics                                             | Coursera        | Professional Certificate  | Apr 2024      | existing URL        |
| coursework     | An Introduction to Supply Chain Management                        | Alison          | Course                    | —             | existing URL        |
| coursework     | Effective Practices for Sourcing, Purchasing and Procurement      | Alison          | Course                    | —             | existing URL        |

**Case studies** — order: HaulRank, FFC Demand Analysis, HERMES, NEXUS, JurisGuard V2, TALASH, Final Year Project.

| Order | Slug                  | Title                                          | Notes                                                                                                                                                                                                                                                                                               |
| ----- | --------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | `haulrank`            | HaulRank: Freight Dispatch Optimization System | Keep text + `183/183 adversarial E2E`; **remove** "Inspired by live logistics at FFC" from public copy, leave `// TODO(confirm)` in source.                                                                                                                                                         |
| 1     | `ffc-demand-analysis` | FFC Demand Analysis                            | New. Method only; "Company data not published for confidentiality." No figures/regions/charts.                                                                                                                                                                                                      |
| 2     | `hermes`              | HERMES                                         | Hybrid RAG (BGE-m3 + BM25 + RRF + cross-encoder) + MCP server. Metrics labelled: Faithfulness 1.00 · Answer relevancy 0.87 · Context precision 0.83 · Context recall 1.00, plus caveat "RAGAS on a 20-question gold set I authored (small, self-authored)." Repo `github.com/hamdan-ishfaq/HERMES`. |
| 3     | `nexus`               | NEXUS                                          | Keep text and numbers exactly: 25/25 component checks · 36 unit tests · 19/19 E2E.                                                                                                                                                                                                                  |
| 4     | `jurisguard-v2`       | JurisGuard V2                                  | New. Air-gapped on-premise legal RAG, local inference, RBAC, designed around GDPR/BDSG/BSI for DACH, 17-test suite. Never "certified compliant".                                                                                                                                                    |
| 5     | `talash`              | TALASH                                         | Fix credit → "Two-person university project; I built the pipeline". FastAPI, Celery, Redis, Postgres, OpenRouter.                                                                                                                                                                                   |
| 6     | `final-year-project`  | Final Year Project                             | New, in progress. "Secure, Offline AI System for Legal Research and Workflow Support in Judicial Environments", three-person team, I lead GraphRAG + retriever work. No outcome claims. `isOngoing: true`.                                                                                          |

Section header moves to profile: titleBefore "Case studies with", accent "evidence", after ", not pitch decks."; lead "Operational systems and applied builds with verified tests, no invented metrics." DE drafts with `TODO(review DE)`.

---

## 2. File-by-file change list

### Stage 3a — content data file

- **ADD** `lib/content/profile.ts` (schema + content above).
- **MODIFY** `lib/i18n/messages/en.ts` & `de.ts` — **add** new UI-chrome keys only (no removals yet, so build stays green):
  - `a11y.mainNav`, `a11y.mobileNav`, `a11y.tabs`, `a11y.closeDialog`, `a11y.copyCode`, `a11y.dismiss`, `a11y.experienceHighlights`, `a11y.capabilities`, `a11y.credentials`, `a11y.openLinkedIn`, `a11y.skipLink` (if missing);
  - `error.title`, `error.body`, `error.retry`, `error.home`;
  - `projectPage.readOnly` (note for static case studies), `projectPage.teamCredit` if needed;
  - `tabs.home`/`tabs.end` not needed (keyboard only).
- **ADD** `docs/UPDATE_PLAN.md` (this file).
- Do **not** delete old keys yet.
- Verify: type-check, lint, build.

### Stage 3b — Hero and About

- **MODIFY** `components/public/Hero.tsx`: read `PROFILE` via `useLocale().locale`; render badge, name, subline, statement, proof bullets; keep `BridgeGraph` and the P2P lab button. Remove SAP-only credential line/headline/subhead and the metric list.
- **MODIFY** `components/public/BridgeGraph.tsx`: keep the MM/SD/BTP document-flow figure as **supporting evidence**; update `hero.bridge*` copy to neutral framing.
- **MODIFY** `components/public/About.tsx`: render `PROFILE.about.title` + 3 paragraphs; remove `lead`, competencies list and `close`.
- **MODIFY** `components/public/SectionHeader.tsx` usage (no structural change) where About header is used.

### Stage 3c — Experience

- **MODIFY** `components/public/Timeline.tsx`: read resolved experience for the active locale from `profile.ts`; keep the ledger layout.
- **MODIFY** `app/page.tsx`: drop `DEFAULT_TIMELINE` import; Timeline resolves its own data.

### Stage 3d — Capabilities

- **MODIFY** `components/public/Skills.tsx`: remove the ordinal `01–04`; remove the per-item duplicate `<dt className="sr-only">{category.title}</dt>`; use `PROFILE.capabilities.groups`; fix aria.

### Stage 3e — Credentials

- **MODIFY** `components/public/Certifications.tsx`: use `PROFILE.credentials`; render **non-link** card when `verifyUrl === null` (with `TODO(link)` in source); show three tiers; replace "Official SAP Badge" wording.

### Stage 3f — Case studies

- **MODIFY** `lib/content/portfolio.ts`: keep only shared type re-exports during migration (fully retired in 3h).
- **MODIFY** `components/public/ProjectSections.tsx`, `components/public/ProjectCard.tsx`: consume `profile.ts`; extend `MODULE_BY_SLUG` for `ffc-demand-analysis`, `jurisguard-v2`, `final-year-project`.
- **MODIFY** `app/projects/[slug]/page.tsx`: locale-aware `generateMetadata`; `getStaticCaseStudy` from profile; resolve DB row by slug; compute `canInteract = Boolean(dbProject?.id)`; include static slugs in `generateStaticParams`; add `alternates.languages`.
- **MODIFY** `app/projects/[slug]/ProjectClientWrapper.tsx`: accept `canInteract`; hide Request Live Demo + Discussion form when false, show `projectPage.readOnly`; keep Overview/Devlog/Discussion tabs otherwise.
- New case studies / fixes per §1.2 table.

### Stage 3g — Contact, footer, SEO/meta

- **MODIFY** `app/layout.tsx`: title/description → two-lane positioning; `metadataBase` fallback `http://localhost:3000`; `openGraph.locale` + `alternateLocale`; twitter description.
- **MODIFY** `app/opengraph-image.tsx`: `alt` and subline to new positioning.
- **MODIFY** `app/sitemap.ts`: include static case studies from `profile.ts`.
- **MODIFY** `components/public/ContactForm.tsx`, `components/public/Footer.tsx` (copy/links only if needed; contact details stay settings-driven: GitHub, LinkedIn `linkedin.com/in/m-hamdan-ishfaq`, email `mhamdanishfaq@gmail.com`).

### Stage 3h — Cleanup + accessibility

- **DELETE** `components/public/DocumentFlowTicker.tsx`, `components/public/SupplyChainNetwork.tsx`, `lib/defaults/hero-tech-stack.ts`, and retire `lib/content/portfolio.ts`.
- **DELETE** now-unused i18n keys (hero._, about._, skills._, experience._, certifications._, projects._) from **both** catalogs together.
- **A11y:** `ProjectCommentForm` — add `<label className="sr-only">` for name + content; `Modal` — add focus trap, focus return, i18n close label; `LanguageToggle` — align accessible name with visible "EN"/"DE" (WCAG 2.5.3); `Tabs` — i18n `aria-label` + Home/End keys; swap remaining hard-coded English aria-labels (`Navbar`, `Toast`, `MarkdownRenderer`) to i18n; `app/error.tsx` copy → i18n.
- **Confirm** no `CGPA`/phone/address strings (grep).

---

## 3. Verification per stage (run after every stage, then commit)

```
npm run type-check   # tsc --noEmit
npm run lint         # eslint . --max-warnings 0
npm run build        # next build
```

Commit message style: `content(3b): hero and about two-lane refresh` etc.

---

## 4. Open TODO(confirm) / TODO(review DE) / TODO(link) registry

**TODO(confirm)**

1. FFC location (Lahore vs Port Qasim).
2. HaulRank "Inspired by live logistics at FFC" — keep or drop.
3. AI Solutions Lab exact title; MachVis "Track 1" wording.
4. NexPred on-prem RAG / local LLM / Docker bullets.
5. SAP Learning issued dates for the 3 new badges.
6. Whether live `projects` DB rows share the static slugs (governs `canInteract`).

**TODO(link)** 7. Badge URLs for Executing Basic ERP, Configuring Cross-Application, Sales Essentials.

**TODO(review DE)** — every German value introduced in §1.2.

**TODO(confirm) CV** 8. CV object path + last-modified inside Supabase bucket `cv` (file not edited).

---

## 5. Out of scope (explicitly not touched)

- `.env*`, Supabase project settings, RLS changes, the keep-alive Action, the CV file, the visual design system, fonts, and the stack.

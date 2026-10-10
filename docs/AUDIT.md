# AUDIT — Portfolio content refresh (Phase 1)

Date: 2026-10-10
Branch: `content-refresh`
Scope: pre-change audit of the production Next.js portfolio. No code changed in this phase.

---

## 1. Stack and runtime (verified from package.json)

| Area        | Version / choice                                                | Notes                                                                                                                                                                  |
| ----------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js     | `16.2.6` (Turbopack build)                                      | AGENTS.md warns this fork differs from known Next. `proxy.ts` at repo root replaces middleware; `proxy` export + `matcher` config. Build reports "Proxy (Middleware)". |
| React       | `19.2.4`                                                        | React 19.                                                                                                                                                              |
| Tailwind    | `^4` via `@tailwindcss/postcss` + `@theme` in `app/globals.css` | No `tailwind.config.*`. Correct for v4.                                                                                                                                |
| Supabase    | `@supabase/ssr ^0.10.3`, `@supabase/supabase-js ^2.106.2`       | Browser/server/admin clients in `lib/supabase/*`.                                                                                                                      |
| Email       | `@emailjs/browser ^4.4.1`, `resend ^6.12.4`                     | EmailJS used client-side; Resend present as a dependency.                                                                                                              |
| Motion / 3D | `framer-motion ^12`, `three ^0.184`                             | Reduced-motion handled in `FadeIn`, `StaggerItem`, `Hero`, `BridgeGraph`, `AmbientField`.                                                                              |
| Validation  | `zod ^4.4.3`, `react-hook-form`, `@hookform/resolvers`          | Contact + demo forms.                                                                                                                                                  |
| Auth        | Supabase Auth via `@supabase/ssr`                               | Admin gated by `proxy.ts`.                                                                                                                                             |

No Firebase references remain in code (the old `lib/firebase/*` files referenced in the plan are gone).

---

## 2. Route map (`app/`)

| Route                              | File                                      | Rendering                    | Purpose                                                                    |
| ---------------------------------- | ----------------------------------------- | ---------------------------- | -------------------------------------------------------------------------- |
| `/`                                | `app/page.tsx`                            | Dynamic (`revalidate = 300`) | Public homepage.                                                           |
| `/projects/[slug]`                 | `app/projects/[slug]/page.tsx`            | Dynamic                      | Case-study detail; DB project first, static fallback.                      |
| `/opengraph-image`                 | `app/opengraph-image.tsx`                 | Edge                         | OG image, hard-coded SAP-only copy.                                        |
| `/projects/[slug]/opengraph-image` | `app/projects/[slug]/opengraph-image.tsx` | Dynamic                      | Per-project OG.                                                            |
| `/robots.txt`                      | `app/robots.ts`                           | Static                       | Disallows `/admin/`, `/api/`.                                              |
| `/sitemap.xml`                     | `app/sitemap.ts`                          | Static                       | Base + **DB projects only** (static case studies omitted — see §7).        |
| `/_not-found`                      | `app/not-found.tsx`                       | Static                       | Uses `NotFoundContent`.                                                    |
| `/admin/*`                         | `app/admin/**`                            | Dynamic                      | CMS (login, dashboard, projects, comments, timeline, inbox, cv, settings). |
| `/api/auth/callback`               | `app/api/auth/callback/route.ts`          | Route handler                | Supabase auth callback.                                                    |
| `/api/github`, `/api/github-stats` | `app/api/**`                              | Route handlers               | GitHub integration endpoints.                                              |

`app/error.tsx` (client error boundary) and `app/loading.tsx` exist. Error boundary copy is hard-coded English (see §7).

---

## 3. Component map (`components/`)

**Public homepage sections** (`app/page.tsx` order):
`Navbar` → `Hero` (+ `BridgeGraph`, lazy `P2PSimulator`/`DepotWorld`) → `About` → `Timeline` → `Skills` (Capabilities) → `Certifications` → `ProjectSections` (+ `ProjectCard`) → `ContactForm` → `Footer`.

**Case-study detail:** `ProjectClientWrapper` (Tabs: Overview / Devlog / Discussion), `DemoRequestModal`, `ProjectCommentForm`, `LoomVideo`.

**UI primitives:** `FadeIn`, `StaggerItem`, `Modal`, `Tabs`, `Button`, `Badge`, `Toast`, `LanguageToggle`, `SkipLink`, `MarkdownRenderer`, `Marquee`, `Skeleton`.

**Dead / unreferenced components (not imported anywhere):** `public/DocumentFlowTicker.tsx`, `public/SupplyChainNetwork.tsx`, `lib/defaults/hero-tech-stack.ts` (and its re-export `DEFAULT_HERO_TECH_STACK` in `lib/content/portfolio.ts`). No public `<img>` other than `ProjectCard` (`alt={project.title}`); no missing alt text found.

---

## 4. Content source map (what lives where)

| Content                                                  | Source                                                                                   | Bilingual? |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- |
| UI chrome (nav, buttons, form labels, project page tabs) | `lib/i18n/messages/en.ts` + `de.ts`                                                      | Yes        |
| Hero copy (`hero.*`)                                     | i18n catalog                                                                             | Yes        |
| **About paragraphs / competencies**                      | Hard-coded English in `lib/content/portfolio.ts` (`ABOUT_COPY`)                          | **No**     |
| **Capabilities groups**                                  | Hard-coded English `SKILL_CATEGORIES` in `lib/content/portfolio.ts`                      | **No**     |
| **Experience timeline**                                  | Hard-coded `DEFAULT_TIMELINE` in `lib/content/portfolio.ts` (homepage uses this, not DB) | **No**     |
| **Case studies**                                         | Hard-coded `PORTFOLIO_CASE_STUDIES` in `lib/content/portfolio.ts`; homepage ignores DB   | **No**     |
| **Credentials**                                          | Hard-coded `CERTIFICATIONS` in `lib/content/portfolio.ts`                                | **No**     |
| `settings` row                                           | Supabase (`display_name`, `cv_file_url`, `email`, `github`, `linkedin`, …)               | n/a        |
| Contact submissions / comments / demo requests / devlogs | Supabase tables                                                                          | n/a        |

**Implication:** the EN/DE toggle does **not** translate About, Experience, Capabilities, Credentials or Case studies — those are English-only static data today. This is the core structural gap the refresh must fix (single bilingual content source).

---

## 5. KNOWN PROBLEMS — verification

### a. Positioning is SAP-only — **TRUE**

- Badge: `hero.openTo` = "Open to roles" + `hero.metaRole` = "SAP Techno-Functional" (`Hero.tsx:57-66`, `en.ts`).
- Hero credentials line: "SAP S/4HANA MM / SD / BTP · Ex-SAP Intern @ FFC · AI Intern @ Nexpred" (`hero.credentialLine`).
- No supply-chain-analytics or AI-engineering lane is presented as a peer. Confirmed.

### b. Hero line "I post the MM and SD cycle inside live S/4HANA." — **TRUE**

`hero.headline` (`en.ts`). Unclear, grammatically awkward, and overclaims ownership of posting.

### c. About overclaims / clichés — **TRUE**

`ABOUT_COPY.lead` uses "specializing in"; paragraphs use "deep functional understanding", "supply chain versus supply chain", "tribal knowledge". `competencies` includes "inventory deployment planning", "strategic purchasing" (unsupported).

### d. Experience inconsistencies — **TRUE**

- `DEFAULT_TIMELINE` FFC location is `Lahore, Punjab, Pakistan · On-site` while description says "Port Qasim distribution hub". Contradiction confirmed.
- Only FFC and Nexpred entries exist. **MachVis and AI Solutions Lab are missing.**
- FFC entry has no data-analysis/forecasting bullet.
- Spelling is "Nexpred"; required spelling is "NexPred".

### e. Capabilities — **TRUE**

`Skills.tsx:28-30` renders ordinal `01`–`04` on unordered groups. `SKILL_CATEGORIES.scm` items include unsupported "Value Analysis", "Strategic Purchasing", "Inventory Deployment". Each item row renders `<dt className="sr-only">{category.title}</dt>` (`Skills.tsx:47`), so the group title **is repeated** in accessible text for every chip — needs fixing.

### f. Credentials — **PARTLY TRUE**

Only one SAP badge (`sap-s4-sourcing-procurement`) is present in `CERTIFICATIONS`. "Official SAP Badge" is used as the credential type, which conflicts with the required label **"SAP Learning course badges"**. Google Data Analytics and DeepLearning.AI ML are present; the other three SAP Learning courses are missing.

### g. TALASH "Solo-built" — **TRUE**

`PORTFOLIO_CASE_STUDIES` TALASH `short_description` says "Solo-built…" and `credit` = "Solo-built by Muhammad Hamdan Ishfaq". Must become "Two-person university project; I built the pipeline".

### h. HERMES unlabeled metrics — **TRUE**

`metrics: ['RAGAS evaluation scores: 1.00 / 0.87 / 0.83 / 1.00']` — no per-metric labels; no small-gold-set caveat.

### i. HaulRank "Inspired by live logistics at FFC" — **TRUE**

Present in `short_description` ("Inspired by live logistics at FFC") and `full_description` ("FFC-informed freight discipline"). Mark `TODO(confirm)` or remove.

### j. Missing case studies — **TRUE**

Only HaulRank, TALASH, NEXUS, HERMES exist. FFC Demand Analysis, JurisGuard V2 and Final Year Project are absent.

---

## 6. Other findings (broken / inconsistent / outdated)

1. **Static case-study actions are likely broken (high impact).** Homepage case studies use non-UUID ids (`case-haulrank`, `case-talash`, …). The detail page passes `project.id` to `ProjectCommentForm` and `DemoRequestModal`. `submitDemoRequest` validates `project_id: z.string().uuid()` → any static case study returns `validation_failed`; `submitComment` inserts a non-UUID `project_id` into a UUID FK column → `db_error`. So **Request Live Demo and Discussion are broken on any static case study** unless a matching UUID row exists in the `projects` table. Needs verification against the live DB and a fix (e.g. resolve DB id by slug, or generate stable UUIDs).
2. **Sitemap omits static case studies.** `app/sitemap.ts` lists only DB `projects`, not `PORTFOLIO_CASE_STUDIES`. New/static case studies won't be indexed via sitemap.
3. **Root metadata is SAP-only.** `app/layout.tsx` title "…SAP S/4HANA MM · SD · BTP", description mentions only SAP techno-functional, `metadataBase` fallback is `https://localhost:3000` (odd scheme). No `keywords`, no explicit root OG image/`alt`, no `authors`.
4. **OG image is SAP-only.** `app/opengraph-image.tsx` `alt` = "SAP S/4HANA MM & Supply Chain"; subline "Ex-SAP Intern @ FFC · AI Intern @ Nexpred"; label "SAP S/4HANA MM · Supply Chain".
5. **`openGraph.locale` fixed to `en_US`** in `layout.tsx` even though the site is bilingual; no `alternateLocale`.
6. **Hard-coded English aria-labels / system strings** (not i18n): `Modal` "Close dialog", `Tabs` "Content sections", `Navbar` "Main navigation"/"Mobile navigation", `MarkdownRenderer` "Copy code", `Toast` "Dismiss notification"; `app/error.tsx` copy; `Hero` P2P simulator labels.
7. **Accessibility gaps:**
   - `Skills.tsx`: duplicate accessible group title per chip (`sr-only` `<dt>`); ordinal numbers convey sequence that isn't there.
   - `ProjectCommentForm`: name input + textarea have **no labels**, only placeholders (WCAG 1.3.1 / 3.3.2 / 4.1.2).
   - `Modal`: focus is moved in but **not trapped**; no focus return to the trigger; Escape handled but not scroll lock on iOS. Close button label is hard-coded English.
   - `LanguageToggle`: `aria-label` ("Switch to English") replaces the visible label ("EN") → WCAG 2.5.3 "Label in Name" risk.
   - `Tabs`: arrow-key nav lacks Home/End; panel `hidden` while inactive is fine. `aria-label` hard-coded.
   - Decorative `bridgeAria`/`bridgeGloss` are descriptive but tied to SAP framing.
8. **Dead code:** `DocumentFlowTicker`, `SupplyChainNetwork`, `DEFAULT_HERO_TECH_STACK` export are unused.
9. **Credentials type wording:** `credentialType: 'Official SAP Badge'` should be "SAP Learning course badge(s)" per requirements.
10. **`skills` empty-state aria**, nav labels, and `about.lead`/`skills.lead`/`experience.lead`/`certifications.lead` remain SAP-forward and must be rewritten in both languages.

---

## 7. Supabase keep-alive & RLS

**Keep-alive GitHub Action — correctly set up.** `.github/workflows/keep-alive.yml` schedules `cron: '0 0 */5 * *'` (every 5 days) and manually dispatchable; it `curl`s `${SUPABASE_URL}/rest/v1/settings` with the anon key from repo secrets. Error-only via `-sf`. Note: `*/5` on day-of-month can occasionally span up to 6 days across short months but stays within the 7-day pause window. No secret values are committed.

**demo_requests RLS — set up, one hardening gap.** `supabase/rls.sql` enables RLS on `demo_requests` and adds `FOR INSERT WITH CHECK (status = 'pending')`. Two notes:

- The app inserts demo requests via `adminSupabase` (service_role, `lib/actions/demo.ts`), which bypasses RLS, so the INSERT policy is effectively unused in production.
- Unlike `contact_submissions` (which checks `char_length(message) BETWEEN 20 AND 2000`), `demo_requests` has **no length/format constraint** on `name`/`email`/`message` in RLS. Server-side Zod validation covers this, but the policy is looser than the contact policy. `select`/`update`/`delete` are correctly absent (admin-only via service_role).
- No `ALTER TABLE ... FORCE ROW LEVEL SECURITY`; table owner bypass is default and acceptable here.

---

## 8. CV / "Download CV" report

The button does **not** point to a repo static file. It renders only when `settings.cv_file_url` is set (`Hero.tsx:104`, `Navbar.tsx:140`) and links to that Supabase Storage URL. Files are uploaded via `uploadAdminFile(formData, 'cv', path)` (`lib/actions/upload.ts`) into the Supabase Storage bucket **`cv`** and the resulting public URL is saved to `settings.cv_file_url`. No CV asset exists under `public/` (only default Next SVGs). Therefore no local path or last-modified date can be reported from this repo.

TODO(confirm): the exact object path inside bucket `cv` and the file's last-modified date live in Supabase and are not readable here. The CV file was **not edited or regenerated** (per rule 8).

---

## 9. Build verification (run in this phase)

| Command                                      | Result                                                                                                                                                                                                                                                                                      |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run type-check` (`tsc --noEmit`)        | **Pass** (no output)                                                                                                                                                                                                                                                                        |
| `npm run lint` (`eslint . --max-warnings 0`) | **Pass** (no output)                                                                                                                                                                                                                                                                        |
| `npm run build` (`next build`)               | **Pass** — compiled in 8.4s, TypeScript 3.4s, 23/23 static pages generated. All app routes are dynamic (`ƒ`); only `/robots.txt` and `/sitemap.xml` are static (`○`). Warning: "Using edge runtime on a page currently disables static generation for that page" (the edge OG image route). |

Baseline is green before changes; every implementation stage must keep it green.

---

## 10. TODO(confirm) raised in this audit

1. FFC location: is the role Lahore-based, Port Qasim-based, or remote/onsite elsewhere? (Problem d).
2. HaulRank "Inspired by live logistics at FFC" — keep with confirmation, or remove?
3. AI Solutions Lab exact title; MachVis "Track 1" wording; Nexpred on-prem RAG/local-LLM/Docker bullets.
4. Missing credential badge URLs and issue dates for the three SAP Learning courses.
5. Technical IDs (badge UUIDs) and CV object path/last-modified (Supabase).
6. Whether live `projects` DB rows share the static slugs (affects the demo/comment bug in §6.1).

---

## 11. Nothing was changed

This phase only created `docs/AUDIT.md`. `.env*`, keys and Supabase settings were not read or modified (only env variable _names_ are referenced above).

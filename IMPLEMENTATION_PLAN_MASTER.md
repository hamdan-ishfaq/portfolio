# Master Implementation Plan — AI Engineer Portfolio

**Version:** 5.0 (consolidated)  
**Stack:** Next.js 16 · Supabase (Auth + Postgres + Storage) · Tailwind v4 · Vercel  
**Design source:** `stitch_ai_engineer_portfolio_system/`  
**PRD/TRD scope:** Phase 1 production portfolio + Phase 2 AI chatbot (future)

---

## How to Execute This Plan (Read First)

### Non-negotiable execution rules

1. **Never skip a task.** Work in strict numeric order within each phase.
2. **Gate before advancing:** A task is complete only when its **Acceptance criteria** pass and any **VERIFY** step succeeds.
3. **Manual tasks block progress.** When a task is marked `🧑 MANUAL`, follow the guide, run the verification step, then reply **"Task X.Y done"** before any agent continues to the next task.
4. **Do not parallelize dependent work.** Phase 1A must finish before 1E. Database must exist before auth testing. Auth must work before admin CMS wiring.
5. **One source of truth for backend writes:** Use `lib/actions/*` with `verifyAdminSession()` + `adminSupabase`. Remove duplicate `app/actions/projects.ts` during Task 3.2.
6. **Design fidelity:** Every UI task must reference the matching stitch HTML + `deep_learning_studio/DESIGN.md`. Do not invent a second visual system.

### Task type legend

| Tag          | Meaning                                                   |
| ------------ | --------------------------------------------------------- |
| `💻 CODE`    | Implement in the repository                               |
| `🧑 MANUAL`  | You perform steps in Supabase / EmailJS / GitHub / Vercel |
| `✅ VERIFY`  | Automated or manual test that must pass before moving on  |
| `🟢 DONE`    | Already implemented in the current codebase               |
| `🟡 PARTIAL` | Started but incomplete or using mock/placeholder data     |
| `🔴 TODO`    | Not started                                               |

---

## 1. Architectural Decisions (Locked)

These supersede the original Firebase-based PRD/TRD:

| Topic         | Decision                                                                                                                                             |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend       | **Supabase only** — Auth, Postgres, Storage, RLS. Zero Firebase.                                                                                     |
| Blog          | **Removed.** Devlog entries live inside each project (Overview / Devlog / Discussion tabs).                                                          |
| Demo requests | Per-project "Request Live Demo" modal → `demo_requests` table + email notification.                                                                  |
| Styling       | **Tailwind v4** — tokens in `app/globals.css` `@theme {}`, not `tailwind.config.ts`.                                                                 |
| Email         | **EmailJS (client-side)** for contact + demo notifications. `lib/email.ts` (Resend) is optional fallback — pick one in Task 0.4 and stay consistent. |
| AI Chatbot    | **Phase 2** — Supabase `pgvector`, not Pinecone. Do not start until Phase 1 checklist passes.                                                        |
| ISR           | Public pages: `revalidate = 300` (5 min) once stable. Current code uses 3600 — normalize in Task 4.8.                                                |

---

## 2. Current Codebase Audit (as of this plan)

### Already implemented (`🟢`)

| Area               | Files                                                                                        | Notes                                                         |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Types              | `types/index.ts`                                                                             | Supabase snake_case; DemoRequest, Devlog, etc.                |
| Supabase clients   | `lib/supabase/{client,server,admin,middleware}.ts`                                           | Four-client pattern correct                                   |
| Middleware         | `middleware.ts`                                                                              | Protects `/admin/**`, refreshes session                       |
| Session verify     | `lib/auth/verify-session.ts`                                                                 | Works; throws instead of redirect (fix in 1.5)                |
| Server actions     | `lib/actions/{auth,projects,devlog,comments,contact,timeline,settings,demo}.ts`              | Core logic written                                            |
| Audit + rate limit | `lib/audit.ts`, `lib/rate-limit.ts`                                                          | Supabase-backed                                               |
| SQL schema         | `supabase/{schema,rls,storage-setup}.sql`                                                    | Ready to run in dashboard                                     |
| Design tokens      | `app/globals.css`                                                                            | Stitch / DESIGN.md palette                                    |
| Root layout        | `app/layout.tsx`                                                                             | Geist fonts, dark FOUC script, Analytics                      |
| UI primitives      | `components/ui/*`                                                                            | Button, Badge, Modal, Toast, Skeleton, Tabs, MarkdownRenderer |
| Public shell       | `Hero`, `Navbar`, `Footer`, `Timeline`, `ProjectSections`, `ContactForm`, `DemoRequestModal` | Stitch-aligned                                                |
| Homepage           | `app/page.tsx`                                                                               | Server-fetched Supabase data                                  |
| Project detail     | `app/projects/[slug]/*`                                                                      | Tabs, devlog, comments, static params                         |
| Admin login UI     | `app/admin/login/*`                                                                          | Wired to `loginAction` (Supabase)                             |
| Admin shell        | `app/admin/layout.tsx`                                                                       | Stitch sidebar; **client component, mock badges**             |
| Admin dashboard UI | `app/admin/page.tsx`, `dashboard/page.tsx`                                                   | **Hardcoded stats**                                           |
| Admin projects UI  | `projects/page.tsx`, `[id]/ProjectFormClient.tsx`                                            | **Partial CRUD, no uploads, duplicate action file**           |
| Admin comments UI  | `comments/*`                                                                                 | Fetches data; moderation actions need wiring                  |
| API routes         | `app/api/auth/callback`, `app/api/github`                                                    | GitHub route exists (stars/forks, not commits)                |
| Loading / 404      | `app/loading.tsx`, `app/not-found.tsx`                                                       | Present                                                       |

### Missing or broken (`🔴` / `🟡`)

| Gap                                                                     | Impact                        |
| ----------------------------------------------------------------------- | ----------------------------- |
| `.env.example` still lists Firebase                                     | Confusing setup               |
| Supabase project may not be provisioned                                 | Nothing works at runtime      |
| No `admin/timeline`, `inbox`, `cv`, `settings` routes                   | CMS incomplete                |
| No `FileUploadInput`, `DevlogEditor`, `AdminSidebar` components         | Admin media + devlog blocked  |
| `app/actions/projects.ts` bypasses `verifyAdminSession`                 | Security hole                 |
| Dashboard badges/counts hardcoded (`12`, `5`, `24`)                     | Misleading admin UX           |
| Contact form saves DB but **no email** sent                             | Owner never notified          |
| No `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`                     | SEO incomplete                |
| No `.github/workflows/*`                                                | No CI, no Supabase keep-alive |
| Admin layout: no logout, mobile menu inert, no live badge counts        | Admin UX incomplete           |
| `verifyAdminSession` throws — admin pages may error instead of redirect | UX/security polish            |
| Phase 2 chatbot                                                         | Not started (expected)        |

---

## 3. Stitch Design → Implementation Map

Use HTML for structure; use `DESIGN.md` for tokens, elevation, motion.

| Stitch file                                     | Route / components                                        | Fidelity target                                                  |
| ----------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- |
| `portfolio_homepage/code.html`                  | `/`, `Hero`, `ProjectSections`, `Timeline`, `ContactForm` | Hero mesh bg, glass cards, tiered projects, timeline alternating |
| `project_detail_page/code.html`                 | `/projects/[slug]`, `ProjectClientWrapper`                | Task navbar, Loom embeds, tab bar, devlog timeline, discussion   |
| `admin_login/code.html`                         | `/admin/login`                                            | Glass card, gradient CTA, mesh background                        |
| `admin_dashboard/code.html`                     | `/admin`, `/admin/dashboard`                              | 4-col stat grid, glass cards                                     |
| `admin_project_list/code.html`                  | `/admin/projects`                                         | Search, filters, data table                                      |
| `admin_project_form/code.html`                  | `/admin/projects/new`, `/admin/projects/[id]`             | Sectioned form, sticky save bar                                  |
| `admin_comment_moderation/code.html`            | `/admin/comments`                                         | Bulk actions, status badges                                      |
| `ai_engineer_portfolio_admin_console/code.html` | `app/admin/layout.tsx`                                    | Sidebar, badges, view-live CTA                                   |
| `deep_learning_studio/DESIGN.md`                | `globals.css`, all components                             | Colors, typography, glass rules                                  |

---

# PHASE 0 — Environment & Supabase Foundation

> **Blocker for everything.** Complete 0.1 → 0.5 in order.

---

### Task 0.1 — Create Supabase project `🧑 MANUAL`

**Status:** 🔴 TODO  
**Depends on:** nothing

**Steps:**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Choose organization, name (e.g. `portfolio`), strong DB password, region closest to you.
3. Wait until project status is **Healthy**.

**Acceptance:** Project dashboard loads; you see Project URL and API keys under **Settings → API**.

**When done, reply:** `Task 0.1 done` + confirm project name.

---

### Task 0.2 — Run database SQL `🧑 MANUAL`

**Status:** 🔴 TODO  
**Depends on:** 0.1

**Steps:**

1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste and run **entire** `supabase/schema.sql`.
3. New query → paste and run **entire** `supabase/rls.sql`.
4. Confirm seed row exists: `SELECT * FROM settings LIMIT 1;`

**Acceptance:** Tables visible in **Table Editor**: `projects`, `devlog_entries`, `project_comments`, `timeline_events`, `contact_submissions`, `demo_requests`, `settings`, `admin_audit_log`, `rate_limits`.

**When done, reply:** `Task 0.2 done`

---

### Task 0.3 — Run storage SQL `🧑 MANUAL`

**Status:** 🔴 TODO  
**Depends on:** 0.2

**Steps:**

1. SQL Editor → run `supabase/storage-setup.sql`.
2. **Storage** → confirm buckets: `cv`, `images`, `avatars`.

**Acceptance:** Three public buckets exist; policies applied without error.

**When done, reply:** `Task 0.3 done`

---

### Task 0.4 — Configure local environment `🧑 MANUAL` + `💻 CODE`

**Status:** 🟡 PARTIAL (`.env.example` outdated)  
**Depends on:** 0.1

**Manual steps:**

1. Copy `.env.example` → `.env.local` (never commit `.env.local`).
2. From Supabase **Settings → API**, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; keep secret)
3. Create GitHub PAT: GitHub → Settings → Developer settings → Fine-grained token → scope `public_repo` (read) → set `GITHUB_TOKEN=`.
4. **Email (choose one path):**
   - **EmailJS (recommended in PRD):** [https://www.emailjs.com/](https://www.emailjs.com/) → create service + 2 templates (contact, demo) → copy IDs to:
     ```
     NEXT_PUBLIC_EMAILJS_SERVICE_ID=
     NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
     NEXT_PUBLIC_EMAILJS_DEMO_TEMPLATE_ID=
     NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
     CONTACT_EMAIL=your@email.com
     ```
   - **OR Resend:** keep `lib/email.ts`, set `RESEND_API_KEY` + `RESEND_FROM_EMAIL`.
5. Set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` for local dev.

**Code sub-task (agent):** Update `.env.example` — remove all Firebase vars; document Supabase + EmailJS vars only.

**✅ VERIFY:**

```bash
npm run type-check
npm run dev
# Homepage loads without Supabase connection errors in terminal
```

**When done, reply:** `Task 0.4 done` + which email provider you chose.

---

### Task 0.5 — Create admin auth user `🧑 MANUAL`

**Status:** 🔴 TODO  
**Depends on:** 0.4

**Steps:**

1. Supabase → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your admin email + strong password.
3. Copy the user's **UUID**.
4. Add to `.env.local`: `ADMIN_UID=<uuid>`

**✅ VERIFY:**

- Visit `/admin/login` → sign in → lands on `/admin/dashboard` (or `/admin`).
- Visit `/admin/projects` logged out → redirects to login.

**When done, reply:** `Task 0.5 done`

---

# PHASE 1A — Auth Hardening (~2 hours)

> Depends on Phase 0 complete.

---

### Task 1.1 — Remove Firebase remnants `💻 CODE` `🟢 DONE`

**Depends on:** 0.5

Firebase packages already absent. **Remaining work:**

- Clean `.env.example` (handled in 0.4)
- Confirm: `grep -r "firebase" --include="*.ts" --include="*.tsx" .` → only comment in `types/index.ts`

**✅ VERIFY:** `npm run type-check` passes.

---

### Task 1.2 — Harden `verifyAdminSession` `💻 CODE` `🟡 PARTIAL`

**Depends on:** 1.1

**Change:** `lib/auth/verify-session.ts` should `redirect('/admin/login')` instead of `throw` when unauthorized (match v4 plan).

**Acceptance:** Admin server pages fail gracefully to login, not 500 error boundary.

---

### Task 1.3 — Admin layout session guard `💻 CODE` `🔴 TODO`

**Depends on:** 1.2

**Problem:** `app/admin/layout.tsx` is `'use client'` and skips auth on non-login routes except via middleware.

**Change:**

- Split into server `app/admin/layout.tsx` (calls `verifyAdminSession`, fetches badge counts) + client `AdminShell.tsx` for sidebar interactivity.
- Exclude login route from session check (keep current behavior).

**Acceptance:** Direct navigation to `/admin/settings` without session always redirects to login.

---

### Task 1.4 — Wire logout + fix login redirect `💻 CODE` `🟡 PARTIAL`

**Depends on:** 1.3

**Changes:**

- Add logout button in admin sidebar → `logoutAction()`.
- Optionally move post-login redirect into `loginAction` via `redirect('/admin/dashboard')` (remove duplicate client `router.replace`).

**Acceptance:** Logout clears session; login → dashboard; back button cannot access admin without re-auth.

---

### Task 1.5 — Auth callback route audit `💻 CODE` `🟢 DONE`

**Depends on:** 1.4

**File:** `app/api/auth/callback/route.ts` — verify code exchange + error redirect to login.

**✅ VERIFY:** OAuth/email-confirm links (if enabled later) land on dashboard.

---

# PHASE 1B — Design System Completion (~3 hours)

> Can overlap 1A after Task 1.2. Depends on Phase 0.

---

### Task 2.1 — Align globals.css with DESIGN.md `💻 CODE` `🟢 DONE`

Review-only unless gaps found. Confirm glass utility classes (`glass-card`, `glass-panel`, `mesh-bg`) match stitch.

**✅ VERIFY:** Visual spot-check homepage vs `portfolio_homepage/screen.png`.

---

### Task 2.2 — Extract `useTheme` hook `💻 CODE` `🟡 PARTIAL`

**Depends on:** 2.1

**Change:** Create `lib/hooks/useTheme.ts`; refactor `Navbar` to use it (logic duplicated inline today).

**Acceptance:** Theme toggle persists across refresh; no FOUC (layout script already handles initial class).

---

### Task 2.3 — next.config.ts hardening `💻 CODE` `🟡 PARTIAL`

**Depends on:** 2.1

**Add:**

- `pathname` on Supabase remote pattern
- Admin `X-Robots-Tag: noindex` header
- `compress: true`

**Acceptance:** `next/image` loads Supabase storage URLs; admin not indexed.

---

### Task 2.4 — UI primitives audit `💻 CODE` `🟢 DONE`

Spot-check all 7 components render. Fix any stitch mismatches (button gradient, modal blur).

---

### Task 2.5 — Navbar + Footer polish `💻 CODE` `🟡 PARTIAL`

**Depends on:** 2.2

**Changes:**

- CV download uses `settings.cv_file_url` (disable button if empty).
- Mobile drawer fully functional (focus trap, ESC close).
- Footer social links from `settings.github/linkedin/twitter`.

**Acceptance:** Matches stitch homepage header/footer at 375px and 1280px.

---

# PHASE 1C — Server Actions & Data Layer (~2 hours)

> Depends on Phase 0 + 1A.

---

### Task 3.1 — Remove Firebase imports + unify actions `💻 CODE` `🔴 TODO`

**Depends on:** 1.1

**Changes:**

1. Delete `app/actions/projects.ts`.
2. Point `ProjectFormClient` → `lib/actions/projects.ts` (`upsertProject`, etc.).
3. Ensure all admin mutations use `verifyAdminSession` + `adminSupabase`.

**✅ VERIFY:** Saving a project while logged out fails; while logged in succeeds.

---

### Task 3.2 — Email integration for contact + demo `💻 CODE` `🔴 TODO`

**Depends on:** 0.4

**Changes:**

- If EmailJS: implement `lib/email.ts` client helpers (`sendContactEmail`, `sendDemoRequestEmail`); call from `ContactForm` + `DemoRequestModal` **after** successful server action.
- If Resend: call `sendEmail` from server actions (update `contact.ts` / `demo.ts`).

**Acceptance:** Submitting contact form sends you an email AND saves to `contact_submissions`.

---

### Task 3.3 — GitHub stats API normalization `💻 CODE` `🟡 PARTIAL`

**Depends on:** 0.4

**File:** Consolidate to `app/api/github-stats/route.ts` (or update existing `app/api/github/route.ts`).

**Return:** `{ stars, commits }` with 1h cache; accept `owner/repo` or full URL.

**Wire:** Tier 1 cards in `ProjectSections` / `ProjectCard`.

---

### Task 3.4 — Public read helpers `💻 CODE` `🟡 PARTIAL`

**Depends on:** 3.1

Ensure `lib/actions/projects.ts`, `settings.ts`, `timeline.ts` export:

- `getPublishedProjects()`, `getProjectBySlug()`, `getAllProjectSlugs()`
- `getGlobalSettings()`, `getTimelineEvents()`

Use in `app/page.tsx` instead of inline Supabase queries (single source).

---

### Task 3.5 — Revalidation paths `💻 CODE` `🔴 TODO`

**Depends on:** 3.1

After every admin mutation, call exact paths:

- `revalidatePath('/')`
- `revalidatePath('/projects/[slug]')` with actual slug
- `revalidatePath('/projects')` if index exists

**Acceptance:** Publish project → visible on homepage within ISR window.

---

# PHASE 1D — Public Pages (~12 hours)

> Depends on 1B + 1C.

---

### Task 4.1 — Homepage data + GitHub stats `💻 CODE` `🟡 PARTIAL`

**Depends on:** 3.3, 3.4

**Changes:**

- Fetch tier 1/2/3 groups explicitly.
- Pass GitHub stats map to tier 1 cards.
- Add skip link + section IDs (`#home`, `#projects`, `#contact`).

---

### Task 4.2 — Hero + Skills Matrix `💻 CODE` `🟡 PARTIAL`

**Depends on:** 4.1

**Stitch ref:** `portfolio_homepage/code.html`

**Changes:**

- Split `Hero.tsx` → `HeroSection.tsx` + `SkillsMatrix.tsx` if not already structured.
- Typewriter tagline from `settings.tagline`.
- Skills matrix: hardcoded SVG/grid with stagger animation + `prefers-reduced-motion`.

---

### Task 4.3 — Experience Timeline `💻 CODE` `🟡 PARTIAL`

**Depends on:** 4.1

**Stitch ref:** homepage timeline section.

**Changes:** Alternating layout, type icons (academic/corporate/achievement), Framer Motion `whileInView`, logo via `next/image`.

---

### Task 4.4 — Tiered project cards `💻 CODE` `🟡 PARTIAL`

**Depends on:** 4.1, 3.3

**Stitch ref:** homepage project sections.

| Tier | Treatment                                                    |
| ---- | ------------------------------------------------------------ |
| 1    | Full card, cover, Loom embed, GitHub stats, CTAs             |
| 2    | 2-col compact grid, hover overlay                            |
| 3    | Compact list row, GitHub link only (no detail page required) |

**Acceptance:** Tier 3 projects do not link to detail pages (or show minimal modal — match PRD: no individual pages).

---

### Task 4.5 — Project detail page `💻 CODE` `🟡 PARTIAL`

**Depends on:** 4.4

**Stitch ref:** `project_detail_page/code.html`

**Verify/implement:**

- Header: title, badges, status, tier
- Loom demo + arch iframes (16:9 wrapper)
- CTA row: GitHub, Live Demo, Request Demo, LinkedIn
- Tabs: Overview (Markdown), Devlog (timeline + type colors), Discussion (comments + submit)
- Devlog issue↔fix linking via `linked_entry_id`
- `DemoRequestModal` → `submitDemoRequest` + email

---

### Task 4.6 — Contact form `💻 CODE` `🟡 PARTIAL`

**Depends on:** 3.2

Already saves to DB. Complete email send + success state replacement (not just toast).

---

### Task 4.7 — 404 page `💻 CODE` `🟢 DONE`

Polish copy to match brand terminal voice if desired.

---

### Task 4.8 — ISR + metadata `💻 CODE` `🔴 TODO`

**Depends on:** 4.5

**Changes:**

- Set `revalidate = 300` on homepage + project pages.
- `generateMetadata` on project pages (title, description, OG).
- JSON-LD schema on project detail.

---

# PHASE 1E — Admin CMS (~14 hours)

> Depends on Phase 1A + 1C.

---

### Task 5.1 — Admin sidebar refactor `💻 CODE` `🟡 PARTIAL`

**Depends on:** 1.3, 1.4

**Create:** `components/admin/AdminSidebar.tsx`

**Changes:**

- Live badge counts: pending comments, unread inbox (server-fetched).
- Settings + Logout links.
- Mobile drawer functional.

**Stitch ref:** `ai_engineer_portfolio_admin_console/code.html`

---

### Task 5.2 — Dashboard real metrics `💻 CODE` `🟡 PARTIAL`

**Depends on:** 5.1

**Replace hardcoded** `24`, `12`, `5` with Supabase counts:

- Projects by tier
- Pending comments
- Unread contact submissions
- Pending demo requests

**Stitch ref:** `admin_dashboard/code.html`

---

### Task 5.3 — Project CRUD complete `💻 CODE` `🟡 PARTIAL`

**Depends on:** 3.1, 5.4

**Routes:**

- `/admin/projects` — list
- `/admin/projects/new` — create (currently may 404 — add page)
- `/admin/projects/[id]` — edit (exists)

**Wire:** delete → `deleteProject()`; tier toggle; published toggle; filters in URL.

**Stitch ref:** `admin_project_list/code.html`, `admin_project_form/code.html`

---

### Task 5.4 — FileUploadInput component `💻 CODE` `🔴 TODO`

**Depends on:** 0.3

**Create:** `components/admin/FileUploadInput.tsx`

Upload to Supabase Storage via browser client; buckets:

- Cover → `images/projects/{id}-cover.webp`
- Avatar → `avatars/profile.webp`
- CV → `cv/resume.pdf`
- Timeline logo → `images/timeline/{id}.webp`

---

### Task 5.5 — Devlog editor `💻 CODE` `🔴 TODO`

**Depends on:** 5.3

**Create:** `components/admin/DevlogEditor.tsx`

Tab inside project edit:

- CRUD devlog entries via `lib/actions/devlog.ts`
- `@uiw/react-md-editor` with preview
- Type dropdown (6 types), link-to-issue for fixes
- Version history modal via `getDevlogVersions()`

---

### Task 5.6 — Comment moderation `💻 CODE` `🟡 PARTIAL`

**Depends on:** 5.1

**Wire:** approve/reject/delete/bulk → `lib/actions/comments.ts`

**Stitch ref:** `admin_comment_moderation/code.html`

**Acceptance:** Approve comment → appears on public project page after revalidation.

---

### Task 5.7 — Timeline admin `💻 CODE` `🔴 TODO`

**Depends on:** 5.4

**Create:** `app/admin/timeline/page.tsx`

CRUD for `timeline_events` via `lib/actions/timeline.ts`; logo upload; description as newline-split bullets.

---

### Task 5.8 — Inbox admin `💻 CODE` `🔴 TODO`

**Depends on:** 5.1

**Create:** `app/admin/inbox/page.tsx`

Two tabs:

1. Contact submissions — filter by status, mark read/archive
2. Demo requests — mark processed, mailto link

Add server actions if missing: `updateContactStatus`, `updateDemoRequestStatus`.

---

### Task 5.9 — CV upload admin `💻 CODE` `🔴 TODO`

**Depends on:** 5.4

**Create:** `app/admin/cv/page.tsx`

Upload PDF → update `settings.cv_file_url` → revalidate `/`.

---

### Task 5.10 — Settings admin `💻 CODE` `🔴 TODO`

**Depends on:** 5.4

**Create:** `app/admin/settings/page.tsx`

Edit global identity, social links, SEO fields, avatar upload.

---

# PHASE 1F — SEO, Performance & CI/CD (~6 hours)

> Depends on Phase 1D + 1E.

---

### Task 6.1 — Sitemap + robots `💻 CODE` `🔴 TODO`

**Create:** `app/sitemap.ts`, `app/robots.ts`

Disallow `/admin/`; include all published project slugs.

---

### Task 6.2 — Dynamic OG images `💻 CODE` `🔴 TODO`

**Create:** `app/projects/[slug]/opengraph-image.tsx`

Branded gradient card with project title + description.

---

### Task 6.3 — Performance audit `💻 CODE` `🔴 TODO`

**Target:** Lighthouse ≥ 95 all categories on production URL.

Fix checklist: LCP (`priority` hero image), CLS (explicit dimensions), a11y labels, contrast.

---

### Task 6.4 — Lighthouse CI config `💻 CODE` `🔴 TODO`

**Create:** `.lighthouserc.json`

---

### Task 6.5 — GitHub Actions CI + Supabase keep-alive `💻 CODE` + `🧑 MANUAL` `🔴 TODO`

**Create:**

- `.github/workflows/ci.yml` — type-check, lint, build on PR
- `.github/workflows/keep-alive.yml` — ping Supabase every 5 days

**Manual:** Add GitHub secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

**When done, reply:** `Task 6.5 done`

---

### Task 6.6 — Production deploy `🧑 MANUAL` `🔴 TODO`

**Depends on:** 6.5, 0.4

**Steps:**

1. Push repo to GitHub.
2. Import to Vercel → connect repo.
3. Add **all** env vars from `.env.local` to Vercel (including `ADMIN_UID`, service role key).
4. Deploy `main` branch.

**✅ VERIFY:** Production URL loads; admin login works; Supabase not paused.

**When done, reply:** `Task 6.6 done` + production URL.

---

### Task 6.7 — Seed production content `🧑 MANUAL` `🔴 TODO`

**Depends on:** 6.6

Via `/admin` on production:

1. Settings — real name, tagline, social links, avatar
2. Upload CV
3. Create 3 Tier 1 projects with real GitHub/Loom content
4. Add devlog entries per project (milestone → issue → fix → reflection)
5. Add timeline events
6. Test contact form + demo request end-to-end

**When done, reply:** `Task 6.7 done`

---

# PHASE 1G — Polish & Sign-off (~4 hours)

> Depends on 1F + 6.7.

---

### Task 7.1 — Motion polish `💻 CODE` `🔴 TODO`

Framer Motion on hero, timeline, tier 1 cards; respect `useReducedMotion`.

---

### Task 7.2 — Loading + error states `💻 CODE` `🟡 PARTIAL`

Audit `app/loading.tsx`, `app/projects/[slug]/loading.tsx`, add `app/error.tsx` with retry.

---

### Task 7.3 — Accessibility audit `💻 CODE` `🔴 TODO`

Skip link, modal focus, input labels, aria landmarks, contrast ≥ 4.5:1.

---

### Task 7.4 — Responsive audit `💻 CODE` `🔴 TODO`

Test 375 / 768 / 1280px — homepage, project detail, all admin tables.

---

### Task 7.5 — Phase 1 final checklist `✅ VERIFY`

Run all gates:

```bash
npm run type-check    # zero errors
npm run lint          # zero warnings
npm run build         # clean
grep -r "firebase" --include="*.ts" --include="*.tsx" .  # no imports
```

**Feature gates:**

- [ ] Homepage renders real Supabase data
- [ ] Tier 1/2/3 project presentation correct
- [ ] Project tabs: Overview / Devlog / Discussion
- [ ] Demo request → DB + email
- [ ] Contact form → DB + email
- [ ] Comment moderation end-to-end
- [ ] Devlog versioning works
- [ ] Admin auth + all CMS routes
- [ ] CV download from navbar
- [ ] Dark mode toggle, no FOUC
- [ ] Lighthouse ≥ 95 (production)
- [ ] Keep-alive cron active
- [ ] No secrets in Git

**When all checked, reply:** `Phase 1 complete` → then optionally tag `v1.0.0`.

---

# PHASE 2 — AI Chatbot (Future, ~36 hours)

> **Do not start until Task 7.5 passes.**

| Task | Description                                                                                 |
| ---- | ------------------------------------------------------------------------------------------- |
| 8.1  | Enable `pgvector` + `embeddings` table + `match_embeddings()` RPC                           |
| 8.2  | `lib/rag/ingest.ts` — chunk CV, projects, devlog; embed via OpenAI `text-embedding-3-small` |
| 8.3  | `app/api/chat/route.ts` — streaming RAG with `gpt-4o-mini`                                  |
| 8.4  | `components/public/ChatWidget/ChatWidget.tsx` — floating panel, 15 msg session limit        |
| 8.5  | `app/admin/knowledge/page.tsx` — re-index controls                                          |

**Manual prep (when ready):** OpenAI API key → `OPENAI_API_KEY` in Vercel + `.env.local`.

---

## Execution Timeline (Suggested)

| Week | Phase       | Outcome                                   |
| ---- | ----------- | ----------------------------------------- |
| 1    | 0 + 1A + 1B | Supabase live, auth secure, design locked |
| 2    | 1C + 1D     | Public site complete with real data       |
| 3    | 1E          | Full admin CMS                            |
| 4    | 1F + 1G     | SEO, CI, production content, v1.0.0       |
| 5–7  | Phase 2     | AI chatbot (optional)                     |

---

## Debugging Quick Reference

| Symptom                               | Fix                                                            |
| ------------------------------------- | -------------------------------------------------------------- |
| RLS policy violation on public insert | Use `adminSupabase` in server actions after validation         |
| Session lost on refresh               | Ensure middleware calls `supabase.auth.getUser()`              |
| Admin login works but actions fail    | Check `ADMIN_UID` matches Supabase user UUID                   |
| Images 404                            | Verify bucket public + `next.config.ts` remotePatterns         |
| Site 503 after idle week              | Supabase paused — restore in dashboard; enable keep-alive cron |
| Tailwind class missing                | Add token to `@theme {}` in `globals.css`                      |

---

## Immediate Next Step

**Start at Task 0.1** if Supabase is not provisioned.  
If Supabase is already live with SQL applied, start at **Task 0.4** (env) → **0.5** (admin user) → **1.2** (session hardening).

When you complete a manual task, reply with `Task X.Y done` so implementation can continue without skipping gates.

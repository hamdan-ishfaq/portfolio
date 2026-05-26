# Revised Implementation & Handoff Plan

## AI Engineer Portfolio

**Stack**: Next.js App Router · Supabase Auth/Postgres/Storage · Tailwind v4 · Vercel
**Design source**: `stitch_ai_engineer_portfolio_system/`

This document is the working handoff for finishing the portfolio to production quality. It replaces the older Firebase-first plan and resolves the major architecture changes already agreed in the repository:

- Firebase is removed completely.
- Supabase is the only backend platform for auth, data, storage, and session handling.
- Blog is not a standalone product surface anymore; project-level Devlog entries replace it.
- The stitch HTML and design files are the visual source of truth for all public and admin screens.

The goal is to complete the original PRD/TRD without rewriting the application into a different product. The implementation must preserve the premium, dark, glassmorphism direction from the stitch templates while staying maintainable in the Next.js + Supabase stack.

---

## 1. What Changed Since the Original PRD/TRD

### 1.1 Architecture shift

The original Firebase/Vercel concept is no longer the right implementation path. The repository now centers on:

- Next.js App Router for all pages, layouts, server actions, and route handlers.
- Supabase Auth for login/session management.
- Supabase Postgres for all relational data.
- Supabase Storage for images, avatars, CV uploads, and other assets.
- Row Level Security for public write surfaces and admin-only mutations.

Why this matters:

- Supabase fits the relational nature of the portfolio better than Firestore.
- Server Components and server actions work naturally with cookie-based sessions.
- One backend vendor reduces operational complexity and prevents auth/storage duplication.

### 1.2 Content model change

The blog feature has been dropped as a top-level product area. It is replaced by Devlog content that lives inside each project record and project detail page.

That means:

- No standalone blog index route.
- No blog authoring CMS.
- Devlog entries become part of the project narrative and are managed from the project admin flow.

### 1.3 Design source shift

The stitch folder is not just reference art. It is the visual blueprint for the final system.

Use these assets as the source of truth for layout, spacing, tonal style, and information hierarchy:

- `stitch_ai_engineer_portfolio_system/portfolio_homepage/code.html`
- `stitch_ai_engineer_portfolio_system/project_detail_page/code.html`
- `stitch_ai_engineer_portfolio_system/admin_dashboard/code.html`
- `stitch_ai_engineer_portfolio_system/admin_login/code.html`
- `stitch_ai_engineer_portfolio_system/admin_project_list/code.html`
- `stitch_ai_engineer_portfolio_system/admin_project_form/code.html`
- `stitch_ai_engineer_portfolio_system/admin_comment_moderation/code.html`
- `stitch_ai_engineer_portfolio_system/ai_engineer_portfolio_admin_console/code.html`
- `stitch_ai_engineer_portfolio_system/deep_learning_studio/DESIGN.md`

The design language is dark-first, high-contrast, glassmorphism-heavy, and compact. It should feel closer to a polished engineering dashboard than a generic marketing site.

---

## 2. Design and UX Rules

### 2.1 Visual direction

Follow the stitch style precisely:

- Dark mode first, with a clean light mode fallback.
- Soft-rounded containers, thin borders, translucent surfaces, and subtle blur.
- Sky blue and cyan accents for primary actions and active states.
- Strong typographic hierarchy using Geist Sans for UI and mono fonts for technical metadata.
- Minimal but intentional motion, especially for section reveals, dialogs, toasts, and drawer navigation.

### 2.2 Layout principles

- Main content should sit in a centered, restrained width rather than stretching edge-to-edge.
- Public pages should read like a premium portfolio with narrative sections, not a generic landing page.
- Admin pages should prioritize dense, clear data presentation while preserving the same visual language.
- Mobile layouts should collapse gracefully into single-column and drawer-based interactions.

### 2.3 Design system guardrails

Do not introduce a second aesthetic system. The site should feel like one coherent product across:

- Homepage
- Project detail pages
- Contact surfaces
- Admin CMS
- Auth/login screens

If a component is not obviously aligned with the stitch templates, it probably needs to be simplified.

---

## 3. Route and Screen Map

### 3.1 Public routes

- `/` — homepage
- `/projects/[slug]` — project detail page with tabs
- `/api/github-stats` — cached GitHub metrics endpoint
- `/api/auth/callback` — Supabase auth callback handler
- Supporting SEO routes such as `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, and metadata generation

### 3.2 Admin routes

- `/admin/login` — Supabase login screen
- `/admin` or `/admin/dashboard` — summary dashboard
- `/admin/projects` — project list and management entry point
- `/admin/projects/new` — create project
- `/admin/projects/[id]/edit` — edit project and Devlog content
- `/admin/comments` — comment moderation queue
- `/admin/timeline` — timeline CRUD
- `/admin/inbox` — contact submissions and demo requests
- `/admin/cv` — CV upload and replacement
- `/admin/settings` — global settings editor

### 3.3 Future phase routes

- `/admin/knowledge-base` — ingestion and indexing controls for RAG
- `/api/chat` — streaming chatbot endpoint

---

## 4. Stitch-to-Implementation Mapping

This mapping should stay stable unless the design source changes.

| Stitch artifact                                 | Target implementation                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `portfolio_homepage/code.html`                  | `app/page.tsx`, `components/public/Hero/*`, `components/public/Projects/*`, `components/public/Timeline/*`, `components/public/ContactForm.tsx` |
| `project_detail_page/code.html`                 | `app/projects/[slug]/page.tsx`, `components/public/ProjectDetail/*`                                                                             |
| `admin_login/code.html`                         | `app/admin/login/page.tsx`, `app/admin/login/LoginForm.tsx` or equivalent                                                                       |
| `admin_dashboard/code.html`                     | `app/admin/page.tsx` or `app/admin/dashboard/page.tsx`                                                                                          |
| `admin_project_list/code.html`                  | `app/admin/projects/page.tsx`                                                                                                                   |
| `admin_project_form/code.html`                  | `app/admin/projects/new/page.tsx` and `app/admin/projects/[id]/edit/page.tsx`                                                                   |
| `admin_comment_moderation/code.html`            | `app/admin/comments/page.tsx`                                                                                                                   |
| `ai_engineer_portfolio_admin_console/code.html` | `app/admin/layout.tsx` and shared admin shell components                                                                                        |
| `deep_learning_studio/DESIGN.md`                | Theme tokens, elevation, spacing, color palette, typography, and motion rules                                                                   |

Use the HTML templates for structure and hierarchy, then adapt them to the App Router component model rather than copying them mechanically.

---

## 5. Target Backend Architecture

### 5.1 Supabase client strategy

The app needs distinct Supabase clients for distinct execution contexts:

- Browser client for interactive client components.
- Server client for Server Components and server actions.
- Middleware client for session refresh and route protection.
- Admin/service-role client for privileged backend operations that bypass RLS.

Do not collapse these into one shared helper. That usually creates cookie and caching bugs in the App Router.

### 5.2 Authentication model

Admin authentication should be email/password through Supabase Auth.

Requirements:

- Cookie-based session persistence.
- Middleware verification on all `/admin/**` routes except login.
- Server-side guard for admin layouts and actions.
- A single authoritative admin user or a tightly controlled allowlist model.

### 5.3 Storage model

Use Supabase Storage buckets for:

- Project cover images
- Project auxiliary media if needed
- Avatar or profile image
- CV PDF upload
- Timeline logos and other supporting assets

The upload flow should validate file type, size, and bucket path before persisting the public URL in Postgres.

### 5.4 Data integrity model

Use Postgres constraints and RLS for validation wherever possible, not only client-side checks.

Examples:

- Unique project slugs.
- Approved statuses limited to enumerated values.
- Approved comment and submission states enforced at the database layer.
- Date ordering and required fields for timeline and devlog entries.

---

## 6. Core Schema Plan

This section is the minimum data model required to finish the PRD/TRD cleanly.

### 6.1 Existing or required core tables

- `projects`
- `project_comments`
- `devlog_entries`
- `timeline_events`
- `settings`
- `contact_submissions`
- `demo_requests`
- `audit_logs`

### 6.2 Recommended field responsibilities

#### `projects`

Project identity and public detail content.

Key fields:

- `id`
- `title`
- `slug`
- `tier`
- `short_description`
- `full_description`
- `project_status`
- `published`
- `tech_stack`
- `github_repo`
- `live_demo_url`
- `loom_video_id_demo`
- `loom_video_id_arch`
- `cover_image_url`
- `featured`
- `order_index`

#### `devlog_entries`

Project-specific progress log entries.

Key fields:

- `id`
- `project_id`
- `entry_type`
- `title`
- `content`
- `entry_date`
- `published`
- `linked_entry_id`
- `sort_order`

Recommended entry types:

- `milestone`
- `daily_log`
- `issue`
- `fix`
- `architecture`
- `reflection`

#### `project_comments`

Public discussion entries tied to a project.

Key fields:

- `project_id`
- `author_name`
- `author_email`
- `content`
- `is_approved`
- `is_archived`
- `created_at`

#### `timeline_events`

Professional and academic history.

Key fields:

- `event_type`
- `title`
- `organization`
- `location`
- `start_date`
- `end_date`
- `description`
- `logo_url`
- `sort_order`
- `published`

#### `contact_submissions`

Public contact form inbox.

Key fields:

- `name`
- `email`
- `company`
- `message`
- `status`
- `ip_hash`
- `created_at`
- `read_at`
- `archived_at`

#### `demo_requests`

Per-project live demo requests.

Key fields:

- `project_id`
- `requester_name`
- `requester_email`
- `message`
- `status`
- `ip_hash`
- `created_at`

#### `settings`

Global site settings, social links, and SEO defaults.

Key fields:

- `display_name`
- `tagline`
- `subheadline`
- `avatar_url`
- `cv_file_url`
- `seo_title_suffix`
- `seo_description`
- `github_url`
- `linkedin_url`
- `twitter_url`
- `contact_email`

#### `audit_logs`

Tracks important admin actions and content mutations.

Key fields:

- `actor_id`
- `action`
- `entity_type`
- `entity_id`
- `metadata`
- `created_at`

### 6.3 Schema evolution rules

- Add columns only when they represent a real, user-visible requirement.
- Do not overnormalize the content model into separate tables unless there is a clear retrieval or admin workflow benefit.
- Keep public read models simple so the homepage and project pages can be server-rendered efficiently.

---

## 7. Security, Auth, and Access Control

### 7.1 Route protection

The admin area must be protected at two layers:

1. Middleware redirects unauthenticated requests away from `/admin/**`.
2. Admin layouts and sensitive server actions validate the session again before mutating data.

This avoids trusting the client or relying on UI-only guards.

### 7.2 RLS policy strategy

Public write flows should be protected with strict policies and rate limits.

Recommended policy shape:

- Public can insert contact submissions.
- Public can insert comments and demo requests only if validation conditions are met.
- Public can read only published projects, approved comments, approved devlog entries, published timeline rows, and safe settings fields.
- Only authenticated admin sessions can mutate admin content.

### 7.3 Rate limiting

Apply IP-based rate limits to:

- Contact form submissions
- Comment submissions
- Demo requests
- Login attempts

Rate limiting should be enforced server-side before the database insert whenever practical.

### 7.4 Admin authentication details

The admin login flow should:

- Use Supabase Auth.
- Store session cookies securely.
- Reject repeated brute-force attempts.
- Redirect authorized users into the admin dashboard.
- Mark the login page as noindex.

---

## 8. Phase Plan

This is the recommended order of execution. Each phase should end in a verifiable state before moving to the next.

### Phase 1: Foundation and auth

Objective: make the backend stable and secure.

Work items:

- Remove Firebase files and dependencies entirely.
- Standardize Supabase client factories.
- Implement middleware for admin route protection.
- Rewrite server-side session verification.
- Wire login/logout against Supabase Auth.
- Add auth callback handling.
- Create the production admin login screen.

Acceptance criteria:

- Unauthenticated users cannot access admin pages.
- Authenticated admin users can log in and log out cleanly.
- Server actions can verify the current session.

### Phase 2: Theme system and shared UI

Objective: lock the design language and reusable components.

Work items:

- Convert stitch visual tokens into Tailwind v4 theme tokens.
- Set up global typography, spacing, color, and motion rules.
- Build shared primitives such as Button, Badge, Tabs, Modal, Toast, Skeleton, and MarkdownRenderer.
- Add dark mode behavior without hydration flash.

Acceptance criteria:

- Reusable components match the design language.
- No duplicate styling systems.
- Public and admin pages can compose from the same primitives.

### Phase 3: Public home and project surfaces

Objective: finish the public portfolio narrative.

Work items:

- Build the homepage with hero, skills matrix, projects, timeline, and contact section.
- Build project detail pages with Overview, Devlog, and Discussion tabs.
- Support project-level demo requests.
- Render SEO metadata and social preview images.

Acceptance criteria:

- Homepage is fully data-driven from Supabase.
- Project pages support content, devlog, comments, and demo requests.
- Public forms are validated, rate-limited, and stored safely.

### Phase 4: Admin CMS

Objective: finish content management for all public content.

Work items:

- Admin dashboard summary metrics.
- Project CRUD.
- Devlog editing.
- Comment moderation.
- Timeline CRUD.
- Inbox for contact and demo requests.
- CV upload.
- Global settings editor.

Acceptance criteria:

- Every public content type has a corresponding admin management path.
- Uploads work through Supabase Storage.
- Save actions revalidate affected public routes.

### Phase 5: Hardening and polish

Objective: make the site production-ready.

Work items:

- Audit logs for content mutations.
- Better loading and empty states.
- Error states for auth, uploads, and submissions.
- Responsive fixes and cross-device QA.
- SEO completeness and metadata checks.

Acceptance criteria:

- No broken public routes.
- No admin route leaks.
- Major screens visually match the stitch templates at production fidelity.

### Phase 6: Phase 2 chatbot foundation

Objective: prepare the portfolio for the future agentic RAG layer.

Work items:

- Define knowledge-base ingestion tables or controls.
- Store embeddings in Supabase using pgvector.
- Add ingestion triggers for CV, project content, and devlog text.
- Build the chat route and floating widget.

Acceptance criteria:

- Text sources are indexed in a way that supports retrieval.
- Chat UI can be added without rewriting the portfolio architecture.

---

## 9. Public Site Implementation Details

### 9.1 Homepage

The homepage should feel like the main product page, not a list of cards.

Required sections:

- Hero area with clear role statement and primary calls to action.
- Skills matrix or capability grid.
- Featured project cards for tiered project grouping.
- Timeline section that tells the professional story.
- Contact section with a reliable server-side submission path.

The homepage should render on the server and fetch the minimum necessary data.

### 9.2 Project cards

Project presentation should follow a tiered hierarchy:

- Tier 1: flagship projects with the strongest visual treatment.
- Tier 2: strong supporting projects with compact cards.
- Tier 3: smaller utilities or tools shown more tersely.

The plan should support these patterns without forcing every project into the same card shape.

### 9.3 Project detail page

This is one of the most important screens in the product.

Must include:

- Header with title, tech badges, status, and tier.
- Embedded demo media where available.
- CTA row for GitHub, live demo, and demo request.
- Tabs for Overview, Devlog, and Discussion.
- Markdown rendering for long-form content.

The Devlog section should be written as a chronological engineering narrative, not as SEO filler.

### 9.4 Contact form

The contact form must:

- Validate on the client for a better UX.
- Validate again on the server.
- Rate limit per IP.
- Save to the database before sending notifications.
- Fail gracefully without losing entered input.

---

## 10. Admin CMS Implementation Details

### 10.1 Admin shell

The admin shell should feel like a cohesive dashboard based on the stitch admin console design.

Requirements:

- Sidebar navigation.
- Active route highlighting.
- Logout action.
- Mobile collapse or drawer behavior.
- Counts or indicators where useful, especially for pending comments and inbox items.

### 10.2 Project management

Project management needs to handle both content editing and media uploads.

Must support:

- Create/edit/delete.
- Published flag.
- Tier selection.
- Slug editing with collision handling.
- Cover image uploads to storage.
- Tech stack editing.
- Devlog management in the edit flow.

### 10.3 Comment moderation

Admin moderation should be optimized for triage.

Must support:

- Pending comment queue.
- Approve, reject, archive, or delete actions.
- Bulk selection where useful.
- Clear project association for context.

### 10.4 Timeline, inbox, settings, and CV

These screens complete the CMS surface.

- Timeline: manage academic and professional history.
- Inbox: review contact submissions and demo requests.
- Settings: manage the global identity and SEO settings.
- CV: upload and replace the public PDF file.

---

## 11. Storage and Asset Strategy

### 11.1 Buckets

Recommended buckets:

- `project-images`
- `avatars`
- `cv`
- `timeline-assets`

### 11.2 Upload behavior

Every upload flow should:

- Validate type before upload.
- Validate size before upload.
- Use predictable paths.
- Store the public URL after upload.
- Revalidate public pages that surface the asset.

### 11.3 Media fallbacks

If an asset is missing, the UI should show a structured fallback rather than breaking layout.

Examples:

- Empty cover image placeholder.
- Default avatar treatment.
- Link fallback when a PDF embed is unavailable.

---

## 12. SEO, Analytics, and Quality

### 12.1 SEO

Implement:

- Metadata generation per page.
- Open Graph images where useful.
- Strong canonical slugs.
- Robots and sitemap routes.
- Noindex on admin and login routes.

### 12.2 Analytics and observability

Keep the analytics approach lightweight and privacy-conscious.

Suggested coverage:

- Page-level performance checks.
- Form submission success/failure tracking.
- Admin mutation logging.
- Error boundary coverage for key routes.

### 12.3 Quality gates

Before calling the project complete, verify:

- Type-check passes.
- Lint passes.
- Key public routes render correctly.
- Admin auth and route protection work.
- Storage uploads succeed.
- Public form submissions are stored and rate-limited.

---

## 13. Completion Definition

The PRD/TRD can be considered complete when all of the following are true:

- The site is fully Supabase-backed with no Firebase dependencies left.
- Public routes match the stitch designs at production quality.
- Blog is replaced by a Devlog system inside project detail pages.
- Authenticated admin users can manage all content and settings.
- Media uploads work through Supabase Storage.
- Public submissions are validated, stored, rate-limited, and visible in the admin inbox.
- SEO and metadata are present for public pages.
- The project is ready for the optional Phase 2 chatbot layer without re-architecture.

---

## 14. Recommended Immediate Next Step

Start with auth and route protection, then lock the theme system, then finish the public homepage and project detail flow, then build the admin CMS.

If you want the work to be executed in the most efficient order, the first implementation slice should be:

1. Supabase auth and middleware.
2. Global theme tokens and shared UI primitives.
3. Homepage and project detail rendering.
4. Admin project CRUD and comment moderation.
5. Inbox, timeline, CV, and settings.

That sequence gives you a secure foundation before you invest more time in CMS features and visual polish.

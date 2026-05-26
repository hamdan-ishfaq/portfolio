# Exhaustive Implementation & Handoff Plan (Version 2.0)

## Document Classification: Technical Handoff / Living TRD

**Target Audience**: The next AI Agent or Developer taking ownership of this repository.

This document provides a highly detailed, technical blueprint of the current state of the Enterprise-Grade AI Engineering Portfolio. It maps the original PRD requirements against the actual implemented system, detailing the "Stitch" template integration, the architectural shift to Supabase, and the exact roadmap for completing Phase 1 and executing Phase 2.

---

## 1. Executive Summary & Architectural Shift

The original PRD outlined a Vercel + Firebase stack. However, the current implementation has been executed using **Next.js 14+ (App Router)** and **Supabase (PostgreSQL)**.

The next agent MUST continue using the Supabase stack (`@supabase/ssr`, `@supabase/supabase-js`) rather than rewriting to Firebase. Supabase natively supports the required relational schemas, Row Level Security (RLS), and Storage capabilities needed for this project.

### Core Stack

- **Framework**: Next.js 16.x (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (utilizing `@theme` directives in `app/globals.css` rather than a `tailwind.config.js`)
- **Database/Auth/Storage**: Supabase
- **Icons/UI**: Material Symbols Outlined, Lucide React, Framer Motion
- **Forms/Validation**: React Hook Form, Zod

---

## 2. "Stitch" Template to Next.js Component Mapping

The static HTML/CSS templates provided in the `stitch_ai_engineer_portfolio_system` have been rigorously translated into modular React components with 1:1 pixel-perfect fidelity.

### A. Public Routes

- **Homepage (`/`)**:
  - _Source_: `portfolio_homepage/code.html`
  - _Implementation_: `app/page.tsx`, `components/public/Hero.tsx`, `components/public/Timeline.tsx`
  - _Details_: Translates the static Hero, SVG Skills Matrix, and vertical Experience Timeline. Data fetches via Server Components from Supabase.
- **Project Detail (`/projects/[slug]`)**:
  - _Source_: `project_detail_page/code.html`
  - _Implementation_: `app/projects/[slug]/page.tsx`, `app/projects/[slug]/ProjectClientWrapper.tsx`
  - _Details_: Implements the specialized task-focused Navbar, Tabs (Overview, Devlog, Discussion), and Loom Video embedded player.

### B. Admin CMS Routes (`/admin/*`)

- **Admin Layout**:
  - _Source_: `admin_dashboard/code.html` (Sidebar section)
  - _Implementation_: `app/admin/layout.tsx`
  - _Details_: Houses the global `SideNavBar`. Conditionally excludes the sidebar on `/admin/login`.
- **Dashboard (`/admin`)**:
  - _Source_: `admin_dashboard/code.html`
  - _Implementation_: `app/admin/page.tsx`
  - _Details_: 4-column glassmorphism stat grid and recent activity header.
- **Project Management (`/admin/projects`)**:
  - _Source_: `admin_project_list/code.html` & `admin_project_form/code.html`
  - _Implementation_: `app/admin/projects/page.tsx`, `ProjectsClientWrapper.tsx`, `[id]/page.tsx`, `ProjectFormClient.tsx`
  - _Details_: Complete CRUD interface. Forms are bound to the `projects` table via Server Actions (`app/actions/projects.ts`).
- **Comment Moderation (`/admin/comments`)**:
  - _Source_: `admin_comment_moderation/code.html`
  - _Implementation_: `app/admin/comments/page.tsx`, `CommentsClientWrapper.tsx`
  - _Details_: Exact data table mapping. Includes bulk approve/reject functionality.
- **Admin Login (`/admin/login`)**:
  - _Source_: `admin_login/code.html`
  - _Implementation_: `app/admin/login/page.tsx`, `LoginClient.tsx`
  - _Details_: Visual implementation of the glass-panel login. **CRITICAL**: Currently uses a mock client-side check (`admin@aiengineer.io`). Must be wired to Supabase Auth.

---

## 3. Database Schema (Supabase PostgreSQL)

The backend relies on Supabase. The following tables have been established or must be established by the next agent:

### Implemented Tables

1.  **`projects`**:
    - `id` (uuid), `title` (text), `slug` (text), `tier` (int: 1, 2, 3), `short_description` (text), `full_description` (text), `project_status` (text), `published` (bool), `tech_stack` (jsonb/text[]), `github_repo` (text), `live_demo_url` (text), `loom_video_id_demo` (text).
2.  **`project_comments`**:
    - `id` (uuid), `project_id` (uuid, fk), `author_name` (text), `author_email` (text), `content` (text), `is_approved` (bool).
3.  **`settings`**:
    - Global config for `display_name`, `seo_title_suffix`, `avatar_url`, `cv_url`.

### Tables Pending Implementation (Action Required)

1.  **`timeline_events`**: For the chronological academic/corporate history.
2.  **`contact_submissions`**: For the EmailJS/Resend contact form inbox.
3.  **`blogs`**: For the Phase 1 Markdown blog engine.

---

## 4. Immediate Action Items for the Next Agent (Phase 1 Completion)

To bring the portfolio to 100% production readiness as defined by the PRD, the next agent must execute the following tasks:

### A. Authentication & Route Protection (CRITICAL)

1.  **Supabase Auth Wiring**: Update `app/admin/login/LoginClient.tsx` to authenticate against Supabase using `@supabase/ssr` `createBrowserClient()`.
2.  **Middleware**: Create `middleware.ts` to intercept all requests to `/admin/**` (excluding `/admin/login`). It must verify the Supabase session token. If invalid, redirect to `/admin/login`.

### B. File Storage (Supabase Storage)

1.  **Image Uploads**: Update `ProjectFormClient.tsx` to handle the Drag-and-Drop file input. Upload the file to a Supabase Storage bucket (e.g., `portfolio-assets/images`) and save the returned public URL to the `cover_image_url` field.
2.  **CV Upload**: Implement `app/admin/cv/page.tsx` with a file picker specifically validating PDFs and overwriting a constant path (e.g., `cv/resume.pdf`) in Supabase Storage.

### C. Contact Form & Email Integration

1.  Build a Server Action for the public Contact Form.
2.  Validate inputs using `Zod`.
3.  Insert the record into the `contact_submissions` table.
4.  Trigger `EmailJS` (or `Resend`) from the Server Action to notify the owner.
5.  Implement IP-based rate limiting (max 3 submissions per hour) to prevent spam.

### D. Remaining Admin Pages

1.  **Admin Timeline (`/admin/timeline`)**: Build a CRUD interface for `timeline_events` matching the Stitch glassmorphism aesthetics.
2.  **Admin Inbox (`/admin/inbox`)**: Build a data table to view, read, and delete `contact_submissions`.
3.  **Admin Settings (`/admin/settings`)**: Form to mutate the global `settings` row.

---

## 5. Phase 2: AI Chatbot Integration (Agentic RAG)

Once Phase 1 is deployed, Phase 2 begins. The goal is to embed an Agentic RAG chatbot that bypasses traditional ATS screening by allowing recruiters to "interview" the portfolio.

### Architecture Guidelines for Next Agent:

1.  **Vector Database**: Utilize Supabase `pgvector` (since we are already on Supabase) to index embeddings of the candidate's CV, project READMEs, and blog posts.
2.  **Ingestion Pipeline**: Create a dedicated Admin route (`/admin/knowledge-base`) to trigger server-side ingestion scripts that chunk and embed textual data using OpenAI's `text-embedding-3-small`.
3.  **Chatbot UI**: Implement a floating widget in the bottom-right corner of the public site. Use Framer Motion for entrance animations.
4.  **Route Handler**: Build `/api/chat` using the Vercel AI SDK (`ai` package) to handle streaming responses, querying `pgvector` for context before passing the system prompt to `gpt-4o-mini`.

## Sign-off

This document serves as the absolute source of truth for the project state. The next agent should immediately begin with **Section 4.A (Authentication & Route Protection)**.

# Revised Implementation Plan v4.0 — Portfolio Site

> **Stack**: Next.js 16 · Supabase (Auth + Postgres + Storage) · Tailwind v4 · Vercel
> **Firebase**: Fully removed. Zero Firebase dependencies.
> **Blog**: Removed. Devlog entries live inside each project.
> **Cost**: $0/month (all free tiers)

---

## Critical Decisions Before We Start

### 1. Firebase Is Fully Replaced by Supabase

| Concern  | Firebase (old)                 | Supabase (new)            | Notes                                              |
| -------- | ------------------------------ | ------------------------- | -------------------------------------------------- |
| Auth     | Firebase Auth                  | Supabase Auth             | Email/password, JWT in cookies via `@supabase/ssr` |
| Database | Firestore                      | Supabase Postgres         | SQL, typed, relational                             |
| Storage  | Firebase Storage               | Supabase Storage          | S3-compatible, public buckets                      |
| Session  | Firebase Admin `verifyIdToken` | `supabase.auth.getUser()` | No Admin SDK needed                                |
| Security | `firestore.rules`              | Row Level Security (SQL)  | Already written                                    |

**Why this works**: Supabase Auth is production-grade, free-tier generous (50K MAU), and eliminates two npm packages (`firebase`, `firebase-admin`) plus all the manual cookie/token plumbing.

### 2. Blog Engine Removed — Devlog Lives Inside Projects

The original plan had a standalone Blog Engine (Epic 4). **Removed.** Instead:

- Each project has a **Devlog** tab with entries (milestone, daily_log, issue, fix, architecture, reflection)
- Each project has a **Discussion** tab with moderated comments
- This is more useful for a portfolio — shows _how_ you built things, not generic articles

### 3. "Request Live Demo" Feature Added

Each project page gets a "Request Live Demo" button that:

- Opens a small form (name, email, optional message)
- Sends you an email via EmailJS
- Saves the request to a `demo_requests` table
- Rate-limited to prevent abuse

### 4. Tailwind v4 (Not v3)

Your project has `tailwindcss@^4` installed. Tailwind v4 does **NOT** use `tailwind.config.ts`. All configuration happens in CSS via `@theme` blocks. The original plan's Task 1.8 is rewritten accordingly.

> [!CAUTION]
> **Supabase Free Tier Pauses After 7 Days of Inactivity**
> Your database will pause if no requests hit it for a week. Fix: add a GitHub Actions cron job that pings your Supabase endpoint every 5 days. This is included in Phase 1E (Task 6.5).

> [!IMPORTANT]
> **EmailJS Free Tier: 200 Emails/Month**
> This covers Contact Form + Demo Requests combined. For a portfolio site this is more than enough. If you ever exceed it, Resend offers 100 emails/day free.

---

## What's Already Done (From Previous Sessions)

| File                                                                                                                | Status                                          |
| ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [types/index.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/types/index.ts)                         | ✅ All interfaces defined (Supabase snake_case) |
| [lib/supabase/client.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/supabase/client.ts)         | ✅ Anon client                                  |
| [lib/supabase/admin.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/supabase/admin.ts)           | ✅ Service role client                          |
| [lib/firebase/client.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/firebase/client.ts)         | ⚠️ Still exists — **DELETE**                    |
| [lib/firebase/admin.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/firebase/admin.ts)           | ⚠️ Still exists — **DELETE**                    |
| [lib/actions/\*.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/actions)                         | ✅ All 6 action files written for Supabase      |
| [lib/audit.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/audit.ts)                             | ✅ Supabase version                             |
| [lib/rate-limit.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/rate-limit.ts)                   | ✅ Supabase version                             |
| [lib/auth/verify-session.ts](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/lib/auth/verify-session.ts) | ⚠️ Stub — **REWRITE** for Supabase Auth         |
| [supabase/schema.sql](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/supabase/schema.sql)               | ✅ All tables + indexes + seed data             |
| [supabase/rls.sql](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/supabase/rls.sql)                     | ✅ RLS policies                                 |
| [supabase/storage-setup.sql](file:///c:/Users/mhamd/Desktop/PROJECT/PORTFOLIO/portfolio/supabase/storage-setup.sql) | ✅ Storage buckets + policies                   |

---

## Revised File Structure

```
portfolio/
├── app/
│   ├── layout.tsx                    ← Root layout, fonts, dark mode script
│   ├── page.tsx                      ← Homepage (SSG)
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── projects/
│   │   └── [slug]/
│   │       ├── page.tsx              ← Project detail + Devlog + Comments
│   │       ├── loading.tsx
│   │       └── opengraph-image.tsx
│   ├── admin/
│   │   ├── layout.tsx                ← Admin shell (sidebar, session guard)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── comments/
│   │   │   └── page.tsx
│   │   ├── timeline/
│   │   │   └── page.tsx
│   │   ├── inbox/
│   │   │   └── page.tsx
│   │   ├── cv/
│   │   │   └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   └── api/
│       ├── github-stats/route.ts
│       └── auth/
│           └── callback/route.ts     ← Supabase auth callback
├── components/
│   ├── public/
│   │   ├── Hero/
│   │   │   ├── HeroSection.tsx
│   │   │   └── SkillsMatrix.tsx
│   │   ├── Timeline/
│   │   │   └── ExperienceTimeline.tsx
│   │   ├── Projects/
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── Tier1Card.tsx
│   │   │   ├── Tier2Card.tsx
│   │   │   └── Tier3Row.tsx
│   │   ├── ProjectDetail/
│   │   │   ├── ProjectHeader.tsx
│   │   │   ├── DevlogTimeline.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   └── RequestDemoButton.tsx
│   │   ├── ContactForm.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── ProjectForm.tsx
│   │   ├── DevlogEditor.tsx
│   │   ├── CommentModerationTable.tsx
│   │   └── FileUploadInput.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       ├── Skeleton.tsx
│       ├── Tabs.tsx
│       └── MarkdownRenderer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client (createBrowserClient)
│   │   ├── server.ts                 ← Server Component client (createServerClient)
│   │   ├── admin.ts                  ← Service role client (bypasses RLS)
│   │   └── middleware.ts             ← Middleware client (session refresh)
│   ├── auth/
│   │   └── verify-session.ts         ← Server-side session check
│   ├── actions/
│   │   ├── projects.ts
│   │   ├── devlog.ts
│   │   ├── comments.ts
│   │   ├── contact.ts
│   │   ├── timeline.ts
│   │   ├── settings.ts
│   │   ├── demo-requests.ts          ← NEW: Request Live Demo
│   │   └── auth.ts                   ← Login/logout actions
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── github.ts
│   ├── email.ts
│   ├── audit.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── middleware.ts                      ← Route protection + session refresh
├── supabase/
│   ├── schema.sql
│   ├── rls.sql
│   └── storage-setup.sql
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── .env.local
└── .env.example
```

---

## Revised Environment Variables

```bash
# ─── Supabase (ALL backend services) ───
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ─── Admin Security ───
ADMIN_UID=                            # Supabase Auth user UUID

# ─── GitHub API ───
GITHUB_TOKEN=

# ─── Email (EmailJS) ───
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_DEMO_TEMPLATE_ID= # Separate template for demo requests
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
CONTACT_EMAIL=

# ─── Phase 2: AI Chatbot ───
# OPENAI_API_KEY=                     # Add when implementing Phase 2
```

> [!IMPORTANT]
> **Removed entirely**: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_ADMIN_*`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`. Firebase is gone.

---

## Schema Additions (Run in Supabase SQL Editor)

The existing `schema.sql` covers most tables. Add this:

```sql
-- DEMO REQUESTS (new table)
CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL CHECK (requester_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_demo_requests_project ON demo_requests(project_id);
CREATE INDEX idx_demo_requests_status ON demo_requests(status);

-- RLS for demo_requests
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit demo requests"
  ON demo_requests FOR INSERT
  WITH CHECK (status = 'pending');
```

---

# PHASE 1A: Auth & Session System (~4 hours)

> **Dependency**: Must be done first. Every admin page depends on this.

---

### Task 1.1 — Remove Firebase Completely

**Time**: 15 min

```bash
npm uninstall firebase firebase-admin
rm -rf lib/firebase/
# Also remove firebase.json and .firebaserc
```

#### Files to delete:

- `lib/firebase/client.ts`
- `lib/firebase/admin.ts`
- `firebase.json`
- `.firebaserc`

#### Files to update:

- `package.json` — remove `firebase` and `firebase-admin` from dependencies
- `.env.local` — remove all `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_ADMIN_*` vars
- `.env.example` — already updated

✅ `npm run type-check` passes after removal.

---

### Task 1.2 — Install Supabase SSR Package

**Time**: 5 min

```bash
npm install @supabase/ssr
```

This package provides cookie-based session management for Next.js App Router. It replaces all the manual Firebase token-in-cookie logic from the original plan.

---

### Task 1.3 — Create Supabase Client Factory Functions

**Time**: 30 min

We need **4 different Supabase clients** for 4 different contexts. This is the correct pattern for Next.js App Router — using a single client everywhere leads to auth bugs.

#### [MODIFY] lib/supabase/client.ts

Browser-side client. Used in `'use client'` components only.

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### [NEW] lib/supabase/server.ts

Server Component / Server Action client. Reads session from cookies.

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

#### [MODIFY] lib/supabase/admin.ts

Service role client. Bypasses RLS. **Server-only.**

```typescript
import { createClient } from '@supabase/supabase-js';

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

#### [NEW] lib/supabase/middleware.ts

Middleware client. Refreshes session tokens on every request.

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );
  return { supabase, response };
}
```

✅ All 4 clients compile. `npm run type-check` passes.

---

### Task 1.4 — Middleware (Route Protection + Session Refresh)

**Time**: 30 min
**File**: `middleware.ts` (project root)

```typescript
import { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // Refresh the session (important — prevents stale JWTs)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

✅ Visiting `/admin/dashboard` without a session redirects to `/admin/login`.

---

### Task 1.5 — Rewrite verify-session.ts for Supabase

**Time**: 20 min
**File**: `lib/auth/verify-session.ts`

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function verifyAdminSession(): Promise<{ uid: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized: No valid session');
  }

  // Optional: enforce single admin UID
  if (user.id !== process.env.ADMIN_UID) {
    throw new Error('Unauthorized: Not admin');
  }

  return { uid: user.id };
}
```

✅ All existing Server Actions (`projects.ts`, `devlog.ts`, etc.) now work with Supabase Auth — they already call `verifyAdminSession()`.

---

### Task 1.6 — Auth Server Actions (Login/Logout)

**Time**: 30 min
**File**: `lib/actions/auth.ts`

```typescript
'use server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { logAuditEvent } from '@/lib/audit';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(email: string, password: string) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  // Rate limit: 5 attempts per IP per 15 minutes
  const rateCheck = await checkRateLimit(ip, 'login', 5, 900, 900);
  if (!rateCheck.allowed) {
    await logAuditEvent({ event: 'login_failure', ipHash: hashIp(ip) });
    return { success: false, error: 'rate_limited' as const };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await logAuditEvent({
      event: 'login_failure',
      ipHash: hashIp(ip),
      metadata: { reason: error.message },
    });
    return { success: false, error: 'invalid_credentials' as const };
  }

  await logAuditEvent({ event: 'login_success', adminUid: process.env.ADMIN_UID });
  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  await logAuditEvent({ event: 'logout', adminUid: process.env.ADMIN_UID });
  redirect('/admin/login');
}
```

✅ Login with valid credentials redirects to dashboard. Invalid credentials show error. 6th attempt from same IP returns `rate_limited`.

---

### Task 1.7 — Auth Callback Route

**Time**: 15 min
**File**: `app/api/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/admin/dashboard', request.url));
}
```

---

### Task 1.8 — Admin Login Page

**Time**: 45 min
**File**: `app/admin/login/page.tsx`

Minimal login form:

- Email + Password fields
- "Sign In" button
- Error display (invalid credentials, rate limited)
- No site navigation, no footer
- `<meta name="robots" content="noindex, nofollow" />`
- Calls `loginAction()` server action on submit

✅ Full login flow works end-to-end with Supabase Auth.

---

### Task 1.9 — Create Admin User in Supabase

**Manual step** (not code):

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Enter your email + a strong password
4. Copy the generated UUID → paste it into `.env.local` as `ADMIN_UID`
5. Also paste it into Vercel env vars when deploying

---

# PHASE 1B: Design System & Layout (~4 hours)

> **Dependency**: None. Can overlap with Phase 1A.

---

### Task 2.1 — Tailwind v4 Design Tokens (CSS-based)

**Time**: 45 min
**File**: `app/globals.css`

> [!WARNING]
> Tailwind v4 does NOT use `tailwind.config.ts`. All theming happens via `@theme` in CSS. The original plan's Task 1.8 is obsolete.

```css
@import 'tailwindcss';

@theme {
  /* Brand palette */
  --color-brand-50: #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-200: #bae6fd;
  --color-brand-300: #7dd3fc;
  --color-brand-400: #38bdf8;
  --color-brand-500: #0ea5e9;
  --color-brand-600: #0284c7;
  --color-brand-700: #0369a1;
  --color-brand-800: #075985;
  --color-brand-900: #0c4a6e;
  --color-brand-950: #082f49;

  /* Devlog entry type colors */
  --color-devlog-milestone: #f59e0b;
  --color-devlog-daily: #6366f1;
  --color-devlog-issue: #ef4444;
  --color-devlog-fix: #10b981;
  --color-devlog-architecture: #3b82f6;
  --color-devlog-reflection: #8b5cf6;

  /* Fonts */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* Custom animations */
  --animate-fade-in: fade-in 0.5s ease-in-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-spin-slow: spin 3s linear infinite;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode custom properties */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --border-color: #e2e8f0;
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}
```

✅ `bg-brand-500`, `text-devlog-fix`, custom animations all work in Tailwind v4.

---

### Task 2.2 — Root Layout & Dark Mode

**Time**: 45 min
**File**: `app/layout.tsx`

- Geist font loading (already installed via `next/font/google`)
- Inline `<script>` before React hydration to prevent FOUC (flash of unstyled content)
- `<html>` gets `class="dark"` based on localStorage/system preference
- Vercel Analytics component
- Global metadata

#### [NEW] lib/hooks/useTheme.ts

Client-side hook for toggling dark mode. Reads/writes `localStorage('theme')` and toggles `.dark` class on `<html>`.

✅ Dark mode toggles instantly with no flash on page load.

---

### Task 2.3 — UI Primitives

**Time**: 90 min
**Directory**: `components/ui/`

Build these reusable components. Each is a single file, no external dependencies beyond Tailwind:

| Component              | Variants                                       | Notes                                                       |
| ---------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `Button.tsx`           | primary, secondary, ghost, danger × sm, md, lg | Uses `<button>` or `<a>` via `asChild` pattern              |
| `Badge.tsx`            | Color varies by `TechCategory`                 | Small pill for tech stack tags                              |
| `Modal.tsx`            | —                                              | Accessible dialog, focus trap, ESC to close, backdrop click |
| `Toast.tsx`            | success, error, info                           | Auto-dismiss 4s, stacks vertically                          |
| `Skeleton.tsx`         | —                                              | Pulsing placeholder shapes                                  |
| `Tabs.tsx`             | —                                              | Keyboard-navigable tab interface (for project detail page)  |
| `MarkdownRenderer.tsx` | —                                              | Wraps `react-markdown` + `remark-gfm` + `rehype-highlight`  |

**Design principle**: Each primitive accepts a `className` prop for composition. No hardcoded margins. Variants via a `variants` object pattern (like `cva` but hand-rolled to avoid another dependency).

✅ All primitives render correctly in isolation.

---

### Task 2.4 — Navbar

**Time**: 45 min
**File**: `components/public/Navbar.tsx`

- Sticky top, background blurs on scroll (`backdrop-blur-md`)
- Logo/name on left → links to `/#home`
- Nav links: Home, Projects, Contact (smooth scroll anchors)
- Dark mode toggle (sun/moon icon, uses `useTheme` hook)
- CV download button (reads URL from settings — passed as prop from Server Component)
- Mobile: hamburger menu → animated slide-out drawer
- No hydration mismatch: theme icon matches server-rendered state

---

### Task 2.5 — Footer

**Time**: 30 min
**File**: `components/public/Footer.tsx`

- Social links (GitHub, LinkedIn, Twitter) — data from settings
- "Built with Next.js & Supabase" credit
- Copyright year (auto-calculated)
- Minimal, no redundant nav links

---

# PHASE 1C: Server Actions & Data Layer (~3 hours)

> **Status**: Most actions already written from migration. This phase fills gaps.

---

### Task 3.1 — Update All Server Actions for Supabase Auth

**Time**: 30 min

The existing actions in `lib/actions/` already call `verifyAdminSession()`. Since we rewrote that function in Task 1.5 to use Supabase Auth, all actions work without changes. But we need to:

1. Remove any lingering Firebase imports (search for `firebase` across all files)
2. Ensure `createServerSupabaseClient()` is used for public reads instead of the static `supabase` export (for proper cookie-based caching)

---

### Task 3.2 — Demo Request Server Action

**Time**: 30 min
**File**: `lib/actions/demo-requests.ts`

```typescript
'use server';
import { z } from 'zod';
import { adminSupabase } from '@/lib/supabase/admin';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const DemoRequestSchema = z.object({
  requester_name: z.string().min(1).max(100),
  requester_email: z.string().email(),
  message: z.string().max(500).optional(),
});

export async function requestLiveDemo(
  projectId: string,
  formData: z.infer<typeof DemoRequestSchema>
) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const rateCheck = await checkRateLimit(ip, 'demo', 2, 3600, 3600);
  if (!rateCheck.allowed) return { success: false, error: 'rate_limited' as const };

  const parsed = DemoRequestSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' as const };

  const { error } = await adminSupabase.from('demo_requests').insert([
    {
      project_id: projectId,
      ...parsed.data,
      status: 'pending',
    },
  ]);

  if (error) return { success: false, error: 'db_error' as const };

  // Email is sent client-side via EmailJS (to avoid server-side email dependency)
  return { success: true };
}
```

---

### Task 3.3 — GitHub Stats Route Handler

**Time**: 30 min
**File**: `app/api/github-stats/route.ts`

Fetches star count + commit count from GitHub REST API. Server-side to hide the PAT.

- Cached for 1 hour via `export const revalidate = 3600`
- Graceful degradation: returns `null` on failure
- Identical to original plan's Task 3.7

---

### Task 3.4 — Email Utility

**Time**: 20 min
**File**: `lib/email.ts`

Thin wrapper around EmailJS for:

- Contact form submissions (sends to your inbox)
- Demo request notifications (sends to your inbox with project name)

Note: EmailJS runs client-side. The server action saves to DB; the client component calls EmailJS after success.

---

### Task 3.5 — Update Types (Add DemoRequest)

**Time**: 10 min
**File**: `types/index.ts`

Add:

```typescript
export interface DemoRequest {
  id: string;
  project_id: string;
  requester_name: string;
  requester_email: string;
  message: string | null;
  status: 'pending' | 'activated' | 'expired';
  created_at: string;
}
```

---

# PHASE 1D: Public Pages (~18 hours)

> **Dependency**: Phases 1A–1C must be complete.

---

### Task 4.1 — Homepage (`app/page.tsx`)

**Time**: 60 min

Server Component that fetches all data and passes to child components:

```typescript
export default async function HomePage() {
  const [settings, projects, timeline] = await Promise.all([
    getGlobalSettings(),
    getPublishedProjects(),
    getTimelineEvents(),
  ]);

  const tier1 = projects.filter(p => p.tier === 1);
  const tier2 = projects.filter(p => p.tier === 2);
  const tier3 = projects.filter(p => p.tier === 3);

  return (
    <>
      <Navbar settings={settings} />
      <main id="main-content">
        <HeroSection settings={settings} />
        <ExperienceTimeline events={timeline} />
        <ProjectsSection tier1={tier1} tier2={tier2} tier3={tier3} />
        <ContactForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
```

✅ Homepage renders with data from Supabase.

---

### Task 4.2 — Hero Section

**Time**: 90 min
**Files**: `components/public/Hero/HeroSection.tsx`, `components/public/Hero/SkillsMatrix.tsx`

- Name, tagline (animated typewriter), sub-headline
- CTA buttons: Download CV, View Projects, Contact
- Skills Matrix: SVG-based grid of tech logos/names, staggered fade-in
- Skills are hardcoded (your personal tech stack, not CMS-managed)

---

### Task 4.3 — Experience Timeline

**Time**: 90 min
**File**: `components/public/Timeline/ExperienceTimeline.tsx`

- Vertical timeline, alternating left/right on desktop, single column on mobile
- Each card: logo, title, org, date range, bullet descriptions
- Scroll-triggered reveal via Framer Motion `whileInView`
- Type icons: 🎓 academic, 🏢 corporate, 🏆 achievement

---

### Task 4.4 — Project Sections (Tier 1/2/3)

**Time**: 3 hours
**Files**: `components/public/Projects/Tier1Card.tsx`, `Tier2Card.tsx`, `Tier3Row.tsx`, `ProjectsSection.tsx`

**Tier 1** (Flagship — 3 cards):

- Full-width cards with cover image, title, 3-sentence description
- Tech stack badges
- Embedded Loom iframe (responsive 16:9, `loading="lazy"`)
- GitHub stats (stars + commits) fetched via `/api/github-stats`
- "Live Demo" + "View Code" + "Read Devlog" CTAs
- Links to `/projects/[slug]`

**Tier 2** (Production Apps — 2-col grid):

- Compact cards: image, title, 1-line description, tech tags
- Hover overlay with GitHub link
- Links to `/projects/[slug]`

**Tier 3** (Utilities — compact list):

- Name, one-line description, GitHub link
- No individual project pages (too small)

---

### Task 4.5 — Project Detail Page

**Time**: 3 hours
**File**: `app/projects/[slug]/page.tsx`

This is the **core new feature** — each project opens into a rich detail page with tabs:

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Projects                                 │
│                                                     │
│  [Project Title]                                    │
│  [Tech Stack Badges]                                │
│  [Status: Active/Completed]  [Tier Badge]           │
│                                                     │
│  [Loom Demo Video]           [Loom Arch Video]      │
│                                                     │
│  [GitHub] [Live Demo] [Request Live Demo] [LinkedIn]│
│                                                     │
│  ┌──────────┬──────────┬──────────┐                 │
│  │ Overview │ Devlog   │ Discussion│                 │
│  └──────────┴──────────┴──────────┘                 │
│                                                     │
│  [Tab content renders here]                         │
└─────────────────────────────────────────────────────┘
```

**Overview tab**: `full_description` rendered as Markdown
**Devlog tab**: Timeline of devlog entries (uses `DevlogTimeline.tsx`)
**Discussion tab**: Approved comments + comment submission form

#### [NEW] components/public/ProjectDetail/RequestDemoButton.tsx

- Client component with a small modal form
- Fields: Name, Email, Message (optional)
- On submit: calls `requestLiveDemo()` server action + sends email via EmailJS
- Shows success toast: "Demo request sent! I'll activate the APIs shortly."
- Rate limited: 2 requests per IP per hour

#### [NEW] components/public/ProjectDetail/DevlogTimeline.tsx

- Vertical timeline of devlog entries for this project
- Each entry: type badge (color-coded), title, date, content (Markdown)
- Type badges: 🎯 milestone, 📝 daily_log, 🐛 issue, ✅ fix, 🏗️ architecture, 💭 reflection
- Entries sorted by `entry_date` ascending (chronological)

#### [REUSE] components/public/ProjectDetail/CommentSection.tsx

- Shows approved comments
- Comment form: name + comment textarea
- On submit: calls `submitComment()` → shows "Comment submitted for review" toast

---

### Task 4.6 — Contact Form Section

**Time**: 60 min
**File**: `components/public/ContactForm.tsx`

- Client component (needs form state)
- Fields: Name, Email, Company (optional), Message (min 20 chars)
- Client-side Zod validation with inline errors
- On submit: calls `submitContactForm()` server action + sends via EmailJS
- Success: replaces form with personalized confirmation
- Failure: error message with retry, no data loss
- Rate limited server-side (3/hour/IP)

---

### Task 4.7 — Static Generation Setup

**Time**: 30 min
**File**: `app/projects/[slug]/page.tsx`

```typescript
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export const revalidate = 300; // ISR: regenerate every 5 minutes
```

✅ Project pages are statically generated at build time, revalidated every 5 minutes.

---

# PHASE 1E: Admin CMS (~14 hours)

> **Dependency**: Phase 1A (auth) must be complete.

---

### Task 5.1 — Admin Layout & Sidebar

**Time**: 60 min
**Files**: `app/admin/layout.tsx`, `components/admin/AdminSidebar.tsx`

- Server Component layout that verifies session
- Sidebar with navigation: Dashboard, Projects, Comments, Timeline, Inbox, CV, Settings
- Badge counts on Comments (pending) and Inbox (unread)
- Logout button
- Responsive: sidebar collapses to hamburger on mobile

---

### Task 5.2 — Admin Dashboard

**Time**: 60 min
**File**: `app/admin/dashboard/page.tsx`

Stats cards:

- Total projects (by tier)
- Pending comments count
- Unread contact submissions
- Pending demo requests
- Last login timestamp

---

### Task 5.3 — Project CRUD

**Time**: 3 hours
**Files**: `app/admin/projects/page.tsx`, `app/admin/projects/new/page.tsx`, `app/admin/projects/[id]/edit/page.tsx`, `components/admin/ProjectForm.tsx`

- Project list table: Title, Tier, Status, Published, Actions (Edit | Delete)
- Form: all Project fields + image upload (via `FileUploadInput` → Supabase Storage)
- On save: calls `upsertProject()` → revalidates public pages
- Delete: confirmation modal → calls `deleteProject()`
- Optimistic UI updates

---

### Task 5.4 — File Upload Component

**Time**: 45 min
**File**: `components/admin/FileUploadInput.tsx`

Reusable upload component that:

1. Accepts file from user
2. Uploads to Supabase Storage (specified bucket + path)
3. Returns public URL
4. Shows upload progress

```typescript
// Upload to Supabase Storage
const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
const { data } = supabase.storage.from(bucket).getPublicUrl(path);
return data.publicUrl;
```

---

### Task 5.5 — Devlog Editor (Inside Project Edit)

**Time**: 90 min
**Files**: `components/admin/DevlogEditor.tsx`

Accessed from the project edit page (not a separate admin section). Flow:

1. Admin opens project → sees "Devlog" tab
2. Lists existing entries with Edit/Delete
3. "New Entry" button → form with: type (dropdown), title, content (Markdown editor with preview), entry_date, published toggle
4. On save: calls `upsertDevlogEntry()` — auto-versioning happens server-side
5. "Version History" button → shows previous versions of an entry

---

### Task 5.6 — Comment Moderation Queue

**Time**: 60 min
**Files**: `app/admin/comments/page.tsx`, `components/admin/CommentModerationTable.tsx`

- Table of all pending comments across all projects
- Columns: Author, Comment (truncated), Project name, Date, Approve ✓, Delete ✗
- Bulk select → "Approve All" / "Delete All"
- Fade-out animation on action

---

### Task 5.7 — Timeline CRUD

**Time**: 60 min
**File**: `app/admin/timeline/page.tsx`

- List of timeline events with Edit/Delete
- "Add Event" → modal form
- Fields: type, title, organization, location, dateRange, startDate, endDate, description (textarea → split into array), logo upload

---

### Task 5.8 — Contact Inbox + Demo Requests

**Time**: 60 min
**File**: `app/admin/inbox/page.tsx`

Two tabs:

1. **Contact Messages**: list with status filter (All/Unread/Read/Archived), click to expand, mark as read/archive
2. **Demo Requests**: list of demo requests with project name, requester info, status (Pending/Activated/Expired), action buttons

---

### Task 5.9 — CV Upload

**Time**: 30 min
**File**: `app/admin/cv/page.tsx`

- Current CV preview (PDF embed or link)
- Upload new PDF → Supabase Storage `cv` bucket
- On upload: updates `settings.cv_file_url` → revalidates homepage
- Audit log: `cv_uploaded`

---

### Task 5.10 — Settings Page

**Time**: 45 min
**File**: `app/admin/settings/page.tsx`

Form pre-filled from `getGlobalSettings()`:

- Display name, tagline, sub-headline
- Avatar upload (→ Supabase Storage `avatars` bucket)
- GitHub, LinkedIn, Twitter URLs
- Email
- SEO title suffix, meta description
- On save: `updateGlobalSettings()` → revalidates homepage

---

# PHASE 1F: SEO, Performance & CI/CD (~6 hours)

---

### Task 6.1 — Sitemap & Robots

**Time**: 30 min
**Files**: `app/sitemap.ts`, `app/robots.ts`

- Dynamic sitemap includes all published project slugs
- `robots.ts` disallows `/admin/`

---

### Task 6.2 — Dynamic OG Images

**Time**: 45 min
**File**: `app/projects/[slug]/opengraph-image.tsx`

Uses Next.js `ImageResponse` to generate a branded OG card per project with title, description, and tech stack.

---

### Task 6.3 — Performance Audit

**Time**: 2 hours

Run Lighthouse. Fix:

- LCP: `priority` on hero image, font preloading
- CLS: explicit dimensions on all `<Image>`, `aspect-ratio` on Loom iframes
- Accessibility: alt text, labels, contrast ratios ≥ 4.5:1
- SEO: meta descriptions on all pages

Target: ≥ 95 all four categories.

---

### Task 6.4 — Lighthouse CI Config

**Time**: 20 min
**File**: `.lighthouserc.json`

---

### Task 6.5 — GitHub Actions CI + Supabase Keep-Alive

**Time**: 45 min
**Files**: `.github/workflows/ci.yml`, `.github/workflows/keep-alive.yml`

**CI workflow** (runs on PR to `dev`):

- Type check
- Lint
- Build
- Lighthouse audit

**Keep-alive workflow** (cron every 5 days):

```yaml
name: Keep Supabase Alive
on:
  schedule:
    - cron: '0 0 */5 * *' # Every 5 days
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -s "${{ secrets.SUPABASE_URL }}/rest/v1/settings?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

> [!IMPORTANT]
> Without this cron job, your Supabase free-tier database will pause after 7 days of inactivity and your site will break.

---

### Task 6.6 — Production Deploy

**Time**: 30 min
**File**: `.github/workflows/deploy.yml`

Push to `main` → Vercel deploys automatically. Add all env vars to Vercel dashboard.

---

### Task 6.7 — First Production Content

**Time**: 60 min

Login to admin on production. Create:

1. Your 3 real Tier 1 projects with GitHub repos, Loom videos, descriptions
2. A few devlog entries per project
3. Timeline events
4. Upload real CV
5. Update settings with real social links

---

# PHASE 1G: Polish (~4 hours)

---

### Task 7.1 — Framer Motion Animations

**Time**: 60 min

Add scroll-reveal to: Timeline events, Tier 1 cards, Hero elements, Contact form.
Respect `prefers-reduced-motion` via `useReducedMotion()` hook.

---

### Task 7.2 — Error Boundaries & Loading States

**Time**: 45 min

- `app/loading.tsx` — full-page skeleton
- `app/projects/[slug]/loading.tsx` — project page skeleton
- `app/error.tsx` — error boundary with retry button
- `<Suspense>` boundaries around async components

---

### Task 7.3 — Accessibility Audit

**Time**: 45 min

- Focus management in modals
- Skip navigation link
- All inputs have labels
- ARIA landmarks
- Color contrast check

---

### Task 7.4 — Mobile Responsiveness Audit

**Time**: 30 min

Test at 375px, 768px, 1280px. Fix:

- Tier 1 cards stack on mobile
- Admin tables horizontally scroll
- Markdown code blocks have `overflow-x-auto`
- Hamburger menu works

---

### Task 7.5 — Phase 1 Completion Checklist

- [ ] All public pages render with real content
- [ ] All admin operations work end-to-end
- [ ] Lighthouse ≥ 95 all categories
- [ ] CV download works
- [ ] Contact form delivers email
- [ ] Demo request sends email
- [ ] Comment moderation works
- [ ] Devlog versioning works
- [ ] Dark mode works, no FOUC
- [ ] Mobile navigation works
- [ ] CI pipeline runs on PR
- [ ] Supabase keep-alive cron active
- [ ] No secrets committed to Git

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

# PHASE 2: AI Chatbot (~36 hours) — Future

> [!NOTE]
> Phase 2 uses **Supabase pgvector** instead of Pinecone. This keeps everything on one platform, free, and eliminates another vendor dependency.

---

### Task 8.1 — Enable pgvector in Supabase

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),  -- text-embedding-3-small dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

### Task 8.2 — Embedding Ingestion Pipeline

**File**: `lib/rag/ingest.ts`

- Chunk text (CV sections, project descriptions, devlog entries)
- Generate embeddings via OpenAI `text-embedding-3-small`
- Upsert into `embeddings` table

---

### Task 8.3 — Chat Route Handler (Streaming)

**File**: `app/api/chat/route.ts`

1. Embed user query
2. Vector similarity search via Supabase RPC
3. Augment prompt with retrieved context
4. Stream response from `gpt-4o-mini`
5. Return as SSE

---

### Task 8.4 — Chat Widget UI

**File**: `components/public/ChatWidget/ChatWidget.tsx`

Floating bottom-right button → opens chat panel. Streaming responses. Session-limited (15 messages).

---

### Task 8.5 — Admin Knowledge Base Page

**File**: `app/admin/knowledge/page.tsx`

View indexed documents. Manual re-index buttons. Last indexed timestamps.

---

## Execution Order Summary

| Week | Phase                            | Tasks          | Hours |
| ---- | -------------------------------- | -------------- | ----- |
| 1    | 1A (Auth) + 1B (Design)          | Tasks 1.1–2.5  | ~8h   |
| 2    | 1C (Actions) + 1D (Public Pages) | Tasks 3.1–4.7  | ~21h  |
| 3    | 1E (Admin CMS)                   | Tasks 5.1–5.10 | ~14h  |
| 4    | 1F (SEO/CI) + 1G (Polish)        | Tasks 6.1–7.5  | ~10h  |
| 5–7  | Phase 2 (AI Chatbot)             | Tasks 8.1–8.5  | ~36h  |

---

## Architectural Decisions for Maintainability

| Decision                                                  | Rationale                                                       |
| --------------------------------------------------------- | --------------------------------------------------------------- |
| **4 Supabase clients** (browser/server/admin/middleware)  | Correct Next.js pattern; prevents auth bugs from shared state   |
| **Server Actions over API routes** for mutations          | Co-located with types, auto-validated, no manual fetch wrappers |
| **API routes only for GET** (github-stats, auth callback) | Cacheable, ISR-compatible                                       |
| **Zod validation in every action**                        | Single source of truth for validation; shared with forms        |
| **`adminSupabase` (service_role) for all writes**         | Bypasses RLS cleanly; admin identity verified via session first |
| **ISR at 300s** (not 60s)                                 | Reduces Supabase reads; 5-min max staleness is acceptable       |
| **Feature-based component organization**                  | `components/public/Projects/` not `components/Tier1Card.tsx`    |
| **No barrel exports** (`index.ts` re-exports)             | Avoids circular deps, keeps tree-shaking clean                  |
| **CSS custom properties for dark mode**                   | Works with Tailwind v4; no JS flash                             |
| **pgvector over Pinecone** (Phase 2)                      | One fewer vendor, free, SQL-native                              |
| **EmailJS client-side** (not server)                      | Avoids server-side email dependency; free tier works            |

---

## Debugging Reference (Updated for Supabase)

| Symptom                                                   | Likely Cause                              | Fix                                                            |
| --------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `new row violates row-level security policy`              | Using anon client for admin write         | Use `adminSupabase` (service_role)                             |
| Session lost on page refresh                              | Missing middleware session refresh        | Check `middleware.ts` calls `getUser()`                        |
| `PGRST116: JSON object requested, multiple rows returned` | `.single()` on query returning >1 row     | Add filters or use `.limit(1)`                                 |
| Images not loading                                        | Wrong Supabase domain in `next.config.ts` | Check `remotePatterns` has `*.supabase.co`                     |
| ISR not revalidating                                      | Wrong path in `revalidatePath()`          | Must be exact: `/projects/test-project` not `/projects/[slug]` |
| Database offline                                          | Supabase paused (7-day inactivity)        | Restart from dashboard; enable keep-alive cron                 |
| Login returns 400                                         | User not created in Supabase Auth         | Create user in Supabase Dashboard → Auth → Users               |

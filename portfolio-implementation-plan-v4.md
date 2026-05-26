# Portfolio Implementation Plan v4.0

## Next.js · Supabase (Auth + Postgres + Storage) · Tailwind v4 · Vercel

**Cost: $0/month | Firebase: Fully Removed | Blog: Removed → Devlog per Project**

---

## Pre-Read: Critical Decisions

### 1. Firebase Is Gone — Supabase Does Everything

| Layer    | Old (Firebase)                      | New (Supabase)                  | Why                                                 |
| -------- | ----------------------------------- | ------------------------------- | --------------------------------------------------- |
| Auth     | Firebase Auth + Admin SDK           | Supabase Auth + `@supabase/ssr` | One vendor, no Admin SDK, no manual cookie plumbing |
| Database | Firestore (NoSQL, path-based)       | PostgreSQL (SQL, relational)    | Type-safe, queryable, no nested collection chaos    |
| Storage  | Firebase Storage                    | Supabase Storage (S3)           | Same bucket as DB, one dashboard, free 1GB          |
| Session  | `verifyIdToken()` (Admin SDK)       | `supabase.auth.getUser()`       | Built into the SSR package, no JWT parsing          |
| Rules    | `firestore.rules` + `storage.rules` | Row Level Security (SQL)        | Colocated with schema, version-controlled           |

**Dropped packages:** `firebase`, `firebase-admin`
**Added packages:** `@supabase/supabase-js`, `@supabase/ssr`

---

### 2. Blog Removed — Devlog Lives Inside Projects

No standalone Blog Engine. Each project page has three tabs:

- **Overview** — full project description as Markdown
- **Devlog** — chronological log of how you built it (milestone / issue / fix / architecture / reflection / daily_log)
- **Discussion** — public comments (moderated)

---

### 3. "Request Live Demo" Added Per Project

Each project detail page has a "Request Live Demo" button that:

1. Opens a small modal (Name, Email, optional Message)
2. Calls a Server Action → saves to `demo_requests` table
3. Sends you an email via EmailJS
4. Rate-limited: 2 requests per IP per hour

---

### 4. Tailwind v4 — Config is CSS-Based

Your project has `tailwindcss@^4` installed. **Tailwind v4 does NOT use `tailwind.config.ts`.** All theme configuration lives in `app/globals.css` via `@theme {}` blocks.

---

### Two Free-Tier Gotchas to Know Now

| Issue                                          | Impact                           | Fix                                                       |
| ---------------------------------------------- | -------------------------------- | --------------------------------------------------------- |
| **Supabase pauses after 7 days of inactivity** | Your site goes down              | GitHub Actions cron pings the DB every 5 days (Task 6.5)  |
| **EmailJS: 200 emails/month free**             | Contact + Demo Requests combined | More than enough for a portfolio; Resend is a free backup |

---

## What's Already Done

| File                         | Status                                                          |
| ---------------------------- | --------------------------------------------------------------- |
| `types/index.ts`             | Done — All interfaces in Supabase snake_case                    |
| `lib/supabase/client.ts`     | Needs rewrite to use `createBrowserClient` from `@supabase/ssr` |
| `lib/supabase/admin.ts`      | Done — Service role client                                      |
| `lib/firebase/`              | DELETE entire directory                                         |
| `lib/actions/*.ts`           | Done — All 5 action files written for Supabase                  |
| `lib/audit.ts`               | Done — Supabase version                                         |
| `lib/rate-limit.ts`          | Done — Supabase version                                         |
| `lib/auth/verify-session.ts` | Stub — rewrite in Phase 1A Task 1.5                             |
| `supabase/schema.sql`        | Done — Run in Supabase SQL Editor                               |
| `supabase/rls.sql`           | Done — Run in Supabase SQL Editor                               |
| `supabase/storage-setup.sql` | Done — Run in Supabase SQL Editor                               |

---

## Final File Structure

```
portfolio/
├── app/
│   ├── layout.tsx
│   ├── globals.css                    <- Tailwind v4 @theme tokens + dark mode vars
│   ├── page.tsx                       <- Homepage (SSG + ISR 300s)
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── loading.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── projects/
│   │   └── [slug]/
│   │       ├── page.tsx               <- Project detail (Overview + Devlog + Discussion)
│   │       ├── loading.tsx
│   │       └── opengraph-image.tsx
│   ├── admin/
│   │   ├── layout.tsx                 <- Admin shell (sidebar + session guard)
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── LoginForm.tsx          <- Client component
│   │   ├── dashboard/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx     <- Edit form + Devlog editor tab
│   │   ├── comments/page.tsx
│   │   ├── timeline/page.tsx
│   │   ├── inbox/page.tsx             <- Contact messages + Demo requests (two tabs)
│   │   ├── cv/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── github-stats/route.ts
│       └── auth/callback/route.ts     <- Supabase auth code exchange
├── components/
│   ├── public/
│   │   ├── Hero/
│   │   │   ├── HeroSection.tsx
│   │   │   └── SkillsMatrix.tsx       <- SVG-based, hardcoded tech stack
│   │   ├── Timeline/
│   │   │   └── ExperienceTimeline.tsx
│   │   ├── Projects/
│   │   │   ├── ProjectsSection.tsx
│   │   │   ├── Tier1Card.tsx
│   │   │   ├── Tier2Card.tsx
│   │   │   └── Tier3Row.tsx
│   │   ├── ProjectDetail/
│   │   │   ├── ProjectHeader.tsx
│   │   │   ├── ProjectTabs.tsx        <- Tab shell (Overview/Devlog/Discussion)
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
│   │   ├── client.ts                  <- Browser client (createBrowserClient)
│   │   ├── server.ts                  <- Server Component client (createServerClient)
│   │   ├── admin.ts                   <- Service role client (bypasses RLS)
│   │   └── middleware.ts              <- Middleware client (session refresh)
│   ├── auth/
│   │   └── verify-session.ts
│   ├── actions/
│   │   ├── projects.ts
│   │   ├── devlog.ts
│   │   ├── comments.ts
│   │   ├── contact.ts
│   │   ├── timeline.ts
│   │   ├── settings.ts
│   │   ├── demo-requests.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   └── useTheme.ts
│   ├── github.ts
│   ├── email.ts
│   ├── audit.ts
│   ├── rate-limit.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── supabase/
│   ├── schema.sql
│   ├── rls.sql
│   └── storage-setup.sql
├── middleware.ts
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── .env.local
├── .env.example
└── .lighthouserc.json
```

---

## Environment Variables (Final)

```bash
# .env.example

# Supabase (ALL backend: DB + Auth + Storage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_UID=                             # Supabase Auth user UUID

# GitHub API (server-only, no NEXT_PUBLIC prefix)
GITHUB_TOKEN=

# Email (EmailJS — client-side, safe to expose)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_DEMO_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
CONTACT_EMAIL=

# Phase 2 (add when implementing)
# OPENAI_API_KEY=
```

---

## Schema Addition — Run Now in Supabase SQL Editor

```sql
-- DEMO REQUESTS (missing from migration schema)
CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL
    CHECK (requester_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  message TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'activated', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_demo_requests_project ON demo_requests(project_id);
CREATE INDEX idx_demo_requests_status  ON demo_requests(status);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can submit demo requests"
  ON demo_requests FOR INSERT
  WITH CHECK (status = 'pending');
```

---

---

# PHASE 1A: Auth & Session System (~4 hours)

> Build this first. Every admin page depends on it.

---

### Task 1.1 — Remove Firebase Completely

**Time:** 15 min

```bash
npm uninstall firebase firebase-admin
rm -rf lib/firebase/
rm -f firestore.rules storage.rules firestore.indexes.json firebase.json .firebaserc
```

Clean `.env.local` — remove every `NEXT_PUBLIC_FIREBASE_*` and `FIREBASE_ADMIN_*` line.

```bash
npm run type-check
# Zero Firebase-related errors
grep -r "from 'firebase'" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
# Must return nothing
```

---

### Task 1.2 — Install Supabase SSR Package

**Time:** 5 min

```bash
npm install @supabase/ssr
```

This is the correct package for cookie-based session management in Next.js App Router. Without it you'd manually manage JWTs — exactly the complexity Firebase Admin SDK was adding.

---

### Task 1.3 — Create the Four Supabase Clients

**Time:** 30 min

Next.js App Router has four distinct execution contexts. Each needs its own client. Using one shared client causes auth bugs.

#### `lib/supabase/client.ts` — REWRITE

Browser-side only. Used in `'use client'` components.

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

#### `lib/supabase/server.ts` — NEW

Server Components and Server Actions. Reads session from cookies.

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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Read-only in Server Components — safe to ignore.
            // Session writes happen in middleware.
          }
        },
      },
    }
  );
}
```

#### `lib/supabase/admin.ts` — VERIFY (should already match this)

Service role. Bypasses RLS entirely. Server-only — never import in client components.

```typescript
// NEVER import in 'use client' components
import { createClient } from '@supabase/supabase-js';

export const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

#### `lib/supabase/middleware.ts` — NEW

Used only inside `middleware.ts`. Refreshes the session JWT on every request.

```typescript
import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export function createMiddlewareClient(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response: supabaseResponse };
}
```

**Done:** All four files compile. `npm run type-check` passes.

---

### Task 1.4 — Middleware (Route Protection + Session Refresh)

**Time:** 30 min
**File:** `middleware.ts` (project root — full replacement)

```typescript
import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);

  // CRITICAL: refreshes the session JWT before it expires.
  // Must run on every request. Do not remove.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Security headers on all responses
  const securityHeaders: [string, string][] = [
    ['X-Frame-Options', 'SAMEORIGIN'],
    ['X-Content-Type-Options', 'nosniff'],
    ['Referrer-Policy', 'strict-origin-when-cross-origin'],
    ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  ];

  securityHeaders.forEach(([key, value]) => response.headers.set(key, value));

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

**Done:** `/admin/dashboard` with no session redirects to `/admin/login`.

---

### Task 1.5 — Rewrite verify-session.ts

**Time:** 15 min
**File:** `lib/auth/verify-session.ts`

```typescript
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function verifyAdminSession(): Promise<{ uid: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  // Enforce single admin — reject any other authenticated user
  if (user.id !== process.env.ADMIN_UID) {
    redirect('/admin/login');
  }

  return { uid: user.id };
}
```

No Firebase Admin SDK. No JWT parsing. No manual token age check. All existing Server Actions already call `verifyAdminSession()` — they all work without changes.

---

### Task 1.6 — Auth Server Actions

**Time:** 30 min
**File:** `lib/actions/auth.ts`

```typescript
'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkRateLimit, hashIp } from '@/lib/rate-limit';
import { logAuditEvent } from '@/lib/audit';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(
  email: string,
  password: string
): Promise<{ error: 'rate_limited' | 'invalid_credentials' } | never> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  // 5 attempts per IP per 15 minutes, lockout for 15 minutes
  const rateCheck = await checkRateLimit(ip, 'login', 5, 900, 900);
  if (!rateCheck.allowed) {
    await logAuditEvent({
      event: 'login_failure',
      ipHash: hashIp(ip),
      metadata: { reason: 'rate_limited' },
    });
    return { error: 'rate_limited' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await logAuditEvent({
      event: 'login_failure',
      ipHash: hashIp(ip),
      metadata: { reason: error.message },
    });
    return { error: 'invalid_credentials' };
  }

  await logAuditEvent({
    event: 'login_success',
    adminUid: process.env.ADMIN_UID,
    ipHash: hashIp(ip),
  });
  redirect('/admin/dashboard');
}

export async function logoutAction(): Promise<never> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  await logAuditEvent({ event: 'logout', adminUid: process.env.ADMIN_UID });
  redirect('/admin/login');
}
```

---

### Task 1.7 — Auth Callback Route

**Time:** 10 min
**File:** `app/api/auth/callback/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/admin/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/admin/login?error=auth_callback_failed`);
}
```

---

### Task 1.8 — Admin Login Page

**Time:** 45 min

**`app/admin/login/page.tsx`** — Server Component, sets `noindex`:

```typescript
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Admin</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Portfolio management</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
```

**`app/admin/login/LoginForm.tsx`** — Client Component:

```typescript
'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/actions/auth';

export default function LoginForm() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await loginAction(email, password);

    if (result?.error === 'rate_limited') {
      setError('Too many attempts. Try again in 15 minutes.');
    } else if (result?.error === 'invalid_credentials') {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Email
        </label>
        <input
          id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Password
        </label>
        <input
          id="password" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      <button
        type="submit" disabled={loading}
        className="w-full py-2 px-4 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-medium rounded-md transition-colors"
      >
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
```

---

### Task 1.9 — Create Admin User in Supabase

**Manual step — no code.**

1. Supabase Dashboard → **Authentication** → **Users**
2. **Add user** → **Create new user**
3. Enter your email + strong password → Create
4. Copy the UUID from the user row
5. Add to `.env.local`: `ADMIN_UID=<uuid>`

**Done:** End-to-end login works. Admin UUID in `.env.local`.

---

---

# PHASE 1B: Design System & Layout (~4 hours)

---

### Task 2.1 — Tailwind v4 Design Tokens

**Time:** 45 min
**File:** `app/globals.css`

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

  /* Devlog entry type colors */
  --color-devlog-milestone: #f59e0b;
  --color-devlog-daily: #6366f1;
  --color-devlog-issue: #ef4444;
  --color-devlog-fix: #10b981;
  --color-devlog-architecture: #3b82f6;
  --color-devlog-reflection: #8b5cf6;

  /* Typography */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, 'Cascadia Code', monospace;

  /* Animations */
  --animate-fade-in: fade-in 0.5s ease-in-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-spin-slow: spin 3s linear infinite;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Semantic color tokens — drives all dark mode */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
}

.dark {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: #334155;
}

/* Global */
*,
*::before,
*::after {
  box-sizing: border-box;
}
html {
  scroll-behavior: smooth;
}
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

/* Markdown prose */
.prose {
  color: var(--text-primary);
  max-width: 65ch;
}
.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}
.prose pre {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow-x: auto;
  padding: 1rem;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Done:** `bg-brand-500`, `text-devlog-fix`, `animate-slide-up` work in components.

---

### Task 2.2 — Root Layout + Dark Mode (No FOUC)

**Time:** 45 min
**File:** `app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';

// Runs before React hydrates — prevents dark mode flash
const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: { template: '%s | Your Name', default: 'Your Name — AI Engineer' },
  description: 'AI Engineer specializing in Agentic RAG, LLM Fine-tuning, and production AI systems.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Your Name | AI Engineer',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**`lib/hooks/useTheme.ts`:**

```typescript
'use client';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored ?? (prefersDark ? 'dark' : 'light'));
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return { theme, toggle };
}
```

---

### Task 2.3 — Next.js Config

**Time:** 20 min
**File:** `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  compress: true,
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
```

---

### Task 2.4 — UI Primitives

**Time:** 90 min
**Directory:** `components/ui/`

Seven components. Each accepts `className` for composition. No hardcoded margins. No external UI library.

**`Button.tsx`** — variants: primary, secondary, ghost, danger × sizes: sm, md, lg. Forwarded ref. `asChild` not needed — use `<a>` directly for links.

**`Badge.tsx`** — tech stack pill. Color keyed by `TechCategory` from types.

**`Modal.tsx`** — wraps native `<dialog>` element. `showModal()` / `close()` via `useEffect`. Focus trap built into `<dialog>`. ESC key and backdrop click close it.

**`Toast.tsx`** — variants: success, error, info. Fixed bottom-right, stacks vertically, auto-dismisses after 4 seconds. Uses `useEffect` + `setTimeout`.

**`Skeleton.tsx`** — pulsing gray blocks. Accepts `className` for size control.

**`Tabs.tsx`** — keyboard-navigable. `aria-role="tablist"`, `aria-selected`, `tabIndex`. Controlled via `value` + `onValueChange` props.

**`MarkdownRenderer.tsx`** — wraps `react-markdown` + `remark-gfm` + `rehype-highlight`. Applies `.prose` class. Code blocks get a copy button via a client wrapper.

**Done:** All 7 render without errors. TypeScript clean.

---

### Task 2.5 — Navbar + Footer

**Time:** 75 min

**Navbar** (`components/public/Navbar.tsx`) — Client component:

- `sticky top-0 z-50` with `backdrop-blur-md bg-[var(--bg-primary)]/80`
- Active section highlight via `IntersectionObserver` watching section IDs
- Dark mode toggle using `useTheme` hook
- CV `<a href={settings.cv_file_url} download>` — always points to Supabase Storage URL
- Mobile: hamburger opens `<dialog>` drawer with same links

**Footer** (`components/public/Footer.tsx`) — Server-compatible (no state):

- Social links from settings prop
- `Built with Next.js & Supabase`
- `© {new Date().getFullYear()} Your Name`

---

---

# PHASE 1C: Server Actions — Gaps & Additions (~2 hours)

---

### Task 3.1 — Verify No Firebase Imports in Existing Actions

**Time:** 15 min

```bash
grep -r "firebase" lib/actions/ lib/audit.ts lib/rate-limit.ts
# Must return nothing
```

Also verify public read actions use `createServerSupabaseClient()` from `lib/supabase/server.ts` — the server client reads the cookie store and enables proper per-request caching in Next.js.

---

### Task 3.2 — Demo Request Action

**Time:** 30 min
**File:** `lib/actions/demo-requests.ts`

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

export type DemoRequestResult =
  | { success: true }
  | { success: false; error: 'rate_limited' | 'validation_failed' | 'db_error' };

export async function requestLiveDemo(
  projectId: string,
  formData: z.infer<typeof DemoRequestSchema>
): Promise<DemoRequestResult> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';

  const rateCheck = await checkRateLimit(ip, 'demo', 2, 3600, 3600);
  if (!rateCheck.allowed) return { success: false, error: 'rate_limited' };

  const parsed = DemoRequestSchema.safeParse(formData);
  if (!parsed.success) return { success: false, error: 'validation_failed' };

  const { error } = await adminSupabase.from('demo_requests').insert([
    {
      project_id: projectId,
      requester_name: parsed.data.requester_name,
      requester_email: parsed.data.requester_email,
      message: parsed.data.message ?? null,
      status: 'pending',
    },
  ]);

  if (error) return { success: false, error: 'db_error' };
  return { success: true };
  // EmailJS is called client-side after this returns { success: true }
}
```

---

### Task 3.3 — GitHub Stats Route Handler

**Time:** 20 min
**File:** `app/api/github-stats/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 3600; // Cache 1 hour

export async function GET(req: NextRequest) {
  const repo = req.nextUrl.searchParams.get('repo');

  if (!repo || !repo.includes('/')) {
    return NextResponse.json(
      { stars: null, commits: null, error: 'invalid_repo' },
      { status: 400 }
    );
  }

  const ghHeaders = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  };

  try {
    const [repoRes, commitsRes] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${repo}`, { headers: ghHeaders }),
      fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, { headers: ghHeaders }),
    ]);

    const stars =
      repoRes.status === 'fulfilled' && repoRes.value.ok
        ? (await repoRes.value.json()).stargazers_count
        : null;

    let commits: number | null = null;
    if (commitsRes.status === 'fulfilled' && commitsRes.value.ok) {
      const link = commitsRes.value.headers.get('Link');
      const match = link?.match(/page=(\d+)>; rel="last"/);
      commits = match ? parseInt(match[1], 10) : null;
    }

    return NextResponse.json({ stars, commits });
  } catch {
    return NextResponse.json({ stars: null, commits: null, error: true });
  }
}
```

---

### Task 3.4 — Email Utility

**Time:** 20 min
**File:** `lib/email.ts`

```typescript
// Client-side only — import dynamically or in 'use client' components
import emailjs from '@emailjs/browser';

const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const CONTACT_TMPL = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const DEMO_TMPL = process.env.NEXT_PUBLIC_EMAILJS_DEMO_TEMPLATE_ID!;
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

export async function sendContactEmail(params: {
  from_name: string;
  from_email: string;
  company?: string;
  message: string;
}) {
  return emailjs.send(SERVICE_ID, CONTACT_TMPL, params, { publicKey: PUBLIC_KEY });
}

export async function sendDemoRequestEmail(params: {
  requester_name: string;
  requester_email: string;
  project_title: string;
  message?: string;
}) {
  return emailjs.send(SERVICE_ID, DEMO_TMPL, params, { publicKey: PUBLIC_KEY });
}
```

---

---

# PHASE 1D: Public Pages (~18 hours)

---

### Task 4.1 — Homepage

**Time:** 45 min
**File:** `app/page.tsx`

```typescript
import { Suspense } from 'react';
import { getGlobalSettings }    from '@/lib/actions/settings';
import { getPublishedProjects } from '@/lib/actions/projects';
import { getTimelineEvents }    from '@/lib/actions/timeline';
import Navbar                   from '@/components/public/Navbar';
import HeroSection              from '@/components/public/Hero/HeroSection';
import ExperienceTimeline       from '@/components/public/Timeline/ExperienceTimeline';
import ProjectsSection          from '@/components/public/Projects/ProjectsSection';
import ContactForm              from '@/components/public/ContactForm';
import Footer                   from '@/components/public/Footer';
import type { Project }         from '@/types';

export const revalidate = 300; // ISR: 5 minutes

export default async function HomePage() {
  const [settings, allProjects, timeline] = await Promise.all([
    getGlobalSettings(),
    getPublishedProjects(),
    getTimelineEvents(),
  ]);

  const tier1 = allProjects.filter((p) => p.tier === 1);
  const tier2 = allProjects.filter((p) => p.tier === 2);
  const tier3 = allProjects.filter((p) => p.tier === 3);

  // Fetch GitHub stats server-side to hide GITHUB_TOKEN from client
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';

  const githubStats = await Promise.allSettled(
    tier1.map((p) =>
      p.github_repo
        ? fetch(`${baseUrl}/api/github-stats?repo=${p.github_repo}`, {
            next: { revalidate: 3600 },
          }).then((r) => r.json())
        : Promise.resolve({ stars: null, commits: null })
    )
  );

  const statsMap = Object.fromEntries(
    tier1.map((p, i) => [
      p.id,
      githubStats[i].status === 'fulfilled'
        ? githubStats[i].value
        : { stars: null, commits: null },
    ])
  );

  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded">
        Skip to content
      </a>
      <Navbar settings={settings} />
      <main id="main-content">
        <HeroSection settings={settings} />
        <ExperienceTimeline events={timeline} />
        <ProjectsSection tier1={tier1} tier2={tier2} tier3={tier3} githubStats={statsMap} />
        <ContactForm />
      </main>
      <Footer settings={settings} />
    </>
  );
}
```

---

### Task 4.2 — Hero Section

**Time:** 90 min

Layout:

```
┌───────────────────────────────────────────┐
│  Hello, I'm [Name]                        │
│  [Tagline — animated typewriter]          │
│  [Sub-headline]                           │
│                                           │
│  [Download CV]  [View Projects] [Contact] │
│                                           │
│  [Skills Matrix — SVG grid, staggered]    │
└───────────────────────────────────────────┘
```

`HeroSection.tsx` is a Client component (needs animation). Props: `settings: GlobalSettings`.

`SkillsMatrix.tsx` — SVG-based (no Canvas). Hardcoded — your skills are your brand, not CMS-managed. Each cell: icon + label. Staggered `animate-fade-in` with Framer Motion `staggerChildren`. Respect `useReducedMotion()`.

---

### Task 4.3 — Experience Timeline

**Time:** 90 min
**File:** `components/public/Timeline/ExperienceTimeline.tsx`

- Alternating left/right on desktop, single column on mobile
- `whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }}`
- Type icons: graduation cap (academic), building (corporate), trophy (achievement)
- Organization logo via `next/image` with explicit `width={40} height={40}`
- `description[]` array rendered as `<ul>` bullet points

---

### Task 4.4 — Project Cards

**Time:** 3 hours

**Tier 1 Card** — Full card layout:

```
┌─────────────────────────────────────────────┐
│  [Cover Image — 16:9, next/image priority]  │
│  [Title]     [Status]    [Tier badge]        │
│  [3-sentence description]                   │
│  [Tech stack badges]                        │
│  ⭐ {stars || '—'} stars  📝 {commits} cmts │
│  [View Project]  [GitHub]  [LinkedIn]       │
└─────────────────────────────────────────────┘
```

**Tier 2 Card** — 2-col grid. Image, title, 1-line description, tags. Hover: overlay shows GitHub + LinkedIn icons.

**Tier 3 Row** — Single line: name · description · GitHub link icon. 3-col grid desktop.

---

### Task 4.5 — Project Detail Page

**Time:** 3 hours

**`app/projects/[slug]/page.tsx`:**

```typescript
export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs; // [{ slug: 'agentic-rag' }, ...]
}

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: 'Not Found' };
  return {
    title: project.title,
    description: project.short_description,
    openGraph: {
      title: project.title,
      description: project.short_description ?? '',
      images: [project.cover_image_url ?? '/og-image.png'],
      type: 'article',
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [devlogEntries, comments] = await Promise.all([
    getDevlogEntries(project.id),
    getApprovedComments(project.id),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: project.title,
          description: project.short_description,
          url: `https://yourdomain.com/projects/${slug}`,
          author: { '@type': 'Person', name: 'Your Name' },
        })}}
      />
      <ProjectHeader project={project} />
      <ProjectTabs project={project} devlogEntries={devlogEntries} comments={comments} />
    </>
  );
}
```

**Page layout:**

```
┌──────────────────────────────────────────────────┐
│  ← Back to Projects                              │
│  [Title]  [Status badge]  [Tier badge]           │
│  [Tech stack badges]                             │
│                                                  │
│  [Loom Demo iframe]    [Loom Arch iframe]         │
│  (both 16:9 aspect ratio, loading="lazy")        │
│                                                  │
│  [GitHub] [Live Demo] [Request Demo] [LinkedIn]  │
│                                                  │
│  ┌──────────┬──────────┬────────────┐            │
│  │ Overview │  Devlog  │ Discussion │            │
│  └──────────┴──────────┴────────────┘            │
│  [Tab content area]                              │
└──────────────────────────────────────────────────┘
```

**Devlog entry type visual treatment:**

| Type           | Color Token                   | Icon | Special Styling                    |
| -------------- | ----------------------------- | ---- | ---------------------------------- |
| `milestone`    | `--color-devlog-milestone`    | 🎯   | Large card, prominent date badge   |
| `daily_log`    | `--color-devlog-daily`        | 📝   | Compact, neutral                   |
| `issue`        | `--color-devlog-issue`        | 🐛   | Red left border accent             |
| `fix`          | `--color-devlog-fix`          | ✅   | "Fixed: [issue title]" link at top |
| `architecture` | `--color-devlog-architecture` | 🏗️   | Blue left border accent            |
| `reflection`   | `--color-devlog-reflection`   | 💭   | Italic body text                   |

Issue ↔ Fix linking: `id="entry-{entry.id}"` on each card. Fix cards link to the issue card via `href="#entry-{linked_entry_id}"`.

**`RequestDemoButton.tsx`** — Client component. Opens `<Modal>`. On submit: calls `requestLiveDemo()` Server Action → on success: calls `sendDemoRequestEmail()` client-side → shows success state in modal.

---

### Task 4.6 — Contact Form

**Time:** 60 min
**File:** `components/public/ContactForm.tsx`

Client component. React Hook Form + Zod. Fields: Name, Email, Company (optional), Message (min 20).

On submit:

1. Call `submitContactForm()` Server Action (saves to DB, rate-checked)
2. If `success: true` → call `sendContactEmail()` via EmailJS
3. Replace form with personalized confirmation message

Failure states: inline field errors, rate limit message, generic retry.

---

### Task 4.7 — Custom 404

**Time:** 20 min
**File:** `app/not-found.tsx`

Minimal, on-brand. Terminal animation: typewriter outputs `404: this route doesn't exist in production either.` Navigation back to home + projects. No heavy assets.

---

---

# PHASE 1E: Admin CMS (~14 hours)

---

### Task 5.1 — Admin Layout + Sidebar

**Time:** 60 min

**`app/admin/layout.tsx`** — Server Component:

```typescript
import { verifyAdminSession } from '@/lib/auth/verify-session';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await verifyAdminSession(); // Redirects to /admin/login if unauthorized

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

**`AdminSidebar.tsx`** — Client component (needs `usePathname`):

| Label     | Icon            | Badge                |
| --------- | --------------- | -------------------- |
| Dashboard | LayoutDashboard | —                    |
| Projects  | FolderCode      | —                    |
| Comments  | MessageSquare   | Pending count (prop) |
| Timeline  | Calendar        | —                    |
| Inbox     | Inbox           | Unread count (prop)  |
| CV Upload | FileUp          | —                    |
| Settings  | Settings        | —                    |
| Logout    | LogOut          | —                    |

Logout calls `logoutAction()`. Responsive: collapsible on mobile.

---

### Task 5.2 — Admin Dashboard

**Time:** 45 min
**File:** `app/admin/dashboard/page.tsx`

```typescript
const [projects, pendingComments, unreadMessages, pendingDemos] = await Promise.all([
  adminSupabase.from('projects').select('id, tier', { count: 'exact' }),
  adminSupabase
    .from('project_comments')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending'),
  adminSupabase
    .from('contact_submissions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'unread'),
  adminSupabase
    .from('demo_requests')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending'),
]);
```

Renders stat cards. Clean, no real-time — admin refreshes the page.

---

### Task 5.3 — Project CRUD

**Time:** 3 hours

**Project list table** (`app/admin/projects/page.tsx`):

- Columns: Thumbnail, Title, Tier (inline dropdown), Published (toggle), Edit, Delete
- Inline tier change: calls `changeProjectTier()` with optimistic UI
- Client-side filter: text search on title, tier select, published select
- Filter state in URL params via `useSearchParams` + `useRouter` (survives refresh)
- 20 rows per page

**`ProjectForm.tsx`** — single form for create + edit:

Sections:

1. **Identity:** title → auto-slug preview (user can override) → short_description → full_description (Markdown editor) → cover_image (FileUploadInput) → published toggle
2. **Display:** tier select → order number → featured toggle
3. **Links:** github_repo → live_demo_url → loom_video_id_demo → loom_video_id_arch → linkedin_url
4. **Tech Stack:** tag input + category select per tag → Enter to add → badge chips to remove
5. **Dates:** project_start_date → project_end_date OR is_ongoing toggle → project_status select

On save: `upsertProject()` → redirect to edit page with success toast.

---

### Task 5.4 — File Upload Component

**Time:** 45 min
**File:** `components/admin/FileUploadInput.tsx`

```typescript
'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Props {
  bucket: string;
  path: string;
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  onUploadComplete: (url: string) => void;
}

export function FileUploadInput({ bucket, path, accept = 'image/*', maxSizeMB = 10, currentUrl, onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    const supabase = createClient();

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onUploadComplete(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img src={currentUrl} alt="Current" className="h-16 w-16 rounded object-cover border border-[var(--border-color)]" />
      )}
      <input
        type="file" accept={accept} onChange={handleChange} disabled={uploading}
        className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-500 file:text-white hover:file:bg-brand-600 disabled:opacity-50 cursor-pointer"
      />
      {uploading && <p className="text-sm text-[var(--text-muted)]">Uploading…</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

Used for: project cover images (`bucket: 'images'`, `path: projects/{id}-cover.webp`), avatar (`bucket: 'avatars'`, `path: profile.webp`), CV (`bucket: 'cv'`, `path: resume.pdf`).

---

### Task 5.5 — Devlog Editor

**Time:** 90 min
**File:** `components/admin/DevlogEditor.tsx`

Lives inside the project edit page as a tab. Shows entry list + "New Entry" button.

**Entry form fields:**

- Type dropdown (icons + labels for all 6 types)
- Title input
- Content (`@uiw/react-md-editor` with live preview toggle)
- Entry date (date input, defaults to today)
- Published toggle
- "Link to Issue" select (only visible when type = `fix` — queries existing `issue` entries for this project)

**Version history:** Each entry row has a History icon. Click → modal → calls `getDevlogVersions(entryId)` → lists timestamped snapshots → click to view read-only Markdown.

---

### Task 5.6 — Comment Moderation

**Time:** 45 min

Fetches all `status = 'pending'` comments. Columns: Author, Content (100 chars), Project (linked), Date, Approve ✓, Delete ✗.

Bulk checkboxes → "Approve selected" / "Delete selected". Row fades out after action via Framer Motion `AnimatePresence`.

---

### Task 5.7 — Timeline CRUD

**Time:** 45 min

List table. "Add Event" → `<Modal>` with form. Description textarea: each line → one bullet in `description[]` array (`split('\n').filter(Boolean)`). Logo upload via `FileUploadInput`.

---

### Task 5.8 — Inbox (Contact + Demo Requests)

**Time:** 60 min
**File:** `app/admin/inbox/page.tsx`

Two tabs using `<Tabs>` UI primitive:

**Contact tab:** Status filter (All/Unread/Read/Archived). Click row → expand full message. Mark as Read / Archive buttons. Calls relevant update actions.

**Demo Requests tab:** List with project name, requester name, email, message, date. Activate (→ `activated`) / Expire (→ `expired`) buttons. Requester email is a `<a href="mailto:...">` link.

---

### Task 5.9 — CV Upload

**Time:** 20 min
**File:** `app/admin/cv/page.tsx`

```typescript
// On upload complete:
// 1. FileUploadInput uploads to Supabase Storage bucket 'cv' at path 'resume.pdf'
// 2. Returns publicUrl
// 3. Call updateGlobalSettings({ cv_file_url: publicUrl })
// 4. revalidatePath('/') so homepage CV button points to new file
// 5. Show success toast

await logAuditEvent({ event: 'cv_uploaded', adminUid: uid });
```

Shows current CV filename + last updated date pulled from settings.

---

### Task 5.10 — Settings Page

**Time:** 45 min
**File:** `app/admin/settings/page.tsx`

Form pre-filled from `getGlobalSettings()`. On save: `updateGlobalSettings()` → `revalidatePath('/')`.

Uses `FileUploadInput` for avatar upload (`bucket: 'avatars'`, `path: 'profile.webp'`).

---

---

# PHASE 1F: SEO, Performance & CI/CD (~6 hours)

---

### Task 6.1 — Sitemap + Robots

**Time:** 20 min

```typescript
// app/sitemap.ts
import { getAllProjectSlugs } from '@/lib/actions/projects';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getAllProjectSlugs();
  const base = 'https://yourdomain.vercel.app';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    ...slugs.map(({ slug }) => ({
      url: `${base}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}

// app/robots.ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/admin/' },
    sitemap: 'https://yourdomain.vercel.app/sitemap.xml',
  };
}
```

---

### Task 6.2 — Dynamic OG Images

**Time:** 30 min
**File:** `app/projects/[slug]/opengraph-image.tsx`

```typescript
import { ImageResponse } from 'next/og';
import { getProjectBySlug } from '@/lib/actions/projects';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0c4a6e 100%)',
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '80px',
      }}>
        <p style={{ color: '#0ea5e9', fontSize: 22, marginBottom: 16 }}>
          AI Engineer Portfolio
        </p>
        <h1 style={{ color: 'white', fontSize: 64, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
          {project?.title ?? 'Project'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 28, marginTop: 24 }}>
          {project?.short_description ?? ''}
        </p>
      </div>
    ),
    size
  );
}
```

---

### Task 6.3 — Performance Audit

**Time:** 2 hours

```bash
npm run build && npm run start
npx lighthouse http://localhost:3000 --view
```

Common fixes:

| Symptom               | Fix                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| LCP > 2.5s            | Add `priority` to hero `<Image>`. Preload fonts in `<head>`.                                                                       |
| CLS from images       | Every `<Image>` needs explicit `width` + `height`                                                                                  |
| CLS from Loom iframes | Wrap: `<div class="relative" style="padding-bottom:56.25%"><iframe class="absolute inset-0 w-full h-full" loading="lazy" /></div>` |
| Accessibility < 100   | Alt text on all images. Labels on all inputs. Check contrast ≥ 4.5:1.                                                              |
| SEO < 100             | `generateMetadata` with description on every route                                                                                 |

Target: **≥ 95 all four Lighthouse categories** on the live Vercel URL.

---

### Task 6.4 — Lighthouse CI Config

**Time:** 15 min
**File:** `.lighthouserc.json`

```json
{
  "ci": {
    "collect": { "numberOfRuns": 1 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.95 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.95 }],
        "categories:seo": ["error", { "minScore": 0.95 }]
      }
    },
    "upload": { "target": "temporary-public-storage" }
  }
}
```

---

### Task 6.5 — GitHub Actions: CI + Keep-Alive

**Time:** 45 min

**`.github/workflows/ci.yml`:**

```yaml
name: CI

on:
  pull_request:
    branches: [main, dev]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run format:check

  lighthouse:
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - name: Wait for Vercel Preview
        uses: patrickedqvist/wait-for-vercel-preview@v1.3.1
        id: vercel
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          max_timeout: 300
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: ${{ steps.vercel.outputs.url }}
          configPath: .lighthouserc.json
          uploadArtifacts: true
```

**`.github/workflows/keep-alive.yml`** — prevents Supabase free tier from pausing:

```yaml
name: Keep Supabase Alive

on:
  schedule:
    - cron: '0 9 */5 * *' # Every 5 days at 09:00 UTC

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/settings?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}")
          echo "Supabase ping: $STATUS"
          if [ "$STATUS" != "200" ]; then exit 1; fi
```

GitHub Secrets to add: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

### Task 6.6 — Production Deploy

**Time:** 30 min

Add all env vars to Vercel: Project → Settings → Environment Variables.

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Task 6.7 — First Production Content

**Time:** 60 min

Login at `/admin/login` on your live Vercel URL. Create:

1. 3 real Tier 1 projects with GitHub repos, Loom IDs, real descriptions
2. A few devlog entries per project (milestone → issues → fixes → reflection)
3. All timeline events
4. Upload real CV PDF
5. Update settings: name, tagline, social links, email, meta description

---

---

# PHASE 1G: Polish (~4 hours)

---

### Task 7.1 — Framer Motion Animations

**Time:** 60 min

Pattern for all animated components:

```typescript
import { motion, useReducedMotion } from 'framer-motion';

function AnimatedCard({ children }: { children: React.ReactNode }) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
}
```

Apply to: timeline entries (stagger 0.1s), Tier 1 cards (stagger 0.15s), Hero elements (stagger 0.2s on mount).

---

### Task 7.2 — Error Boundaries + Loading Skeletons

**Time:** 45 min

- `app/loading.tsx` — full-page skeleton with pulsing card shapes
- `app/projects/[slug]/loading.tsx` — project page skeleton
- `app/error.tsx` — "Something went wrong" + Refresh button (`useRouter().refresh()`)
- Wrap data-fetching sections in `<Suspense fallback={<Skeleton />}>`

---

### Task 7.3 — Accessibility Audit

**Time:** 45 min

Checklist:

- Skip link as first focusable element (already in `page.tsx`)
- Focus management in all modals (native `<dialog>` handles this)
- All `<input>` / `<textarea>` have `<label htmlFor="...">`
- All icon-only buttons have `aria-label`
- `<nav>`, `<main id="main-content">`, `<footer>` ARIA landmarks
- `<section>` elements have `aria-labelledby` pointing to their heading ID
- Color contrast ≥ 4.5:1 for all text (verify in browser DevTools → Accessibility)

---

### Task 7.4 — Mobile Responsiveness Audit

**Time:** 30 min

Test at 375px, 390px, 768px, 1280px:

| Component        | Mobile Behaviour                   |
| ---------------- | ---------------------------------- |
| Tier 1 cards     | Stack vertically, full width       |
| Admin tables     | `overflow-x-auto` wrapper          |
| Markdown `<pre>` | `overflow-x-auto`                  |
| Loom iframes     | 16:9 aspect ratio wrapper — no CLS |
| Navbar           | Hamburger → full-width drawer      |
| Admin sidebar    | Burger icon → slide-out overlay    |

---

### Task 7.5 — Phase 1 Final Checklist

```bash
npm run type-check   # Zero errors
npm run lint         # Zero warnings
npm run build        # Clean build

grep -r "firebase" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
# Must return nothing
```

Feature gates:

- [ ] Homepage renders with real Supabase data
- [ ] All 3 project tiers display correctly
- [ ] Individual project pages: Overview / Devlog / Discussion tabs work
- [ ] Request Demo button sends email and saves to DB
- [ ] Contact form saves to DB and sends email
- [ ] Comment submission → pending → admin approval → visible on page
- [ ] Admin login / logout cycle
- [ ] All admin CRUD (projects, devlog, timeline, comments, inbox, CV, settings)
- [ ] CV download from public navbar works
- [ ] Dark mode: toggle works, no FOUC on hard refresh
- [ ] Mobile nav at 375px
- [ ] Lighthouse ≥ 95 all categories (on Vercel, not localhost)
- [ ] `keep-alive.yml` cron active in GitHub Actions
- [ ] Zero secrets in Git history

```bash
git tag v1.0.0
git push origin v1.0.0
```

---

---

# PHASE 2: AI Chatbot (~36 hours)

> Start Phase 2 only after Phase 1 is live and stable for 1–2 weeks.
> Requires: `OPENAI_API_KEY` (~$5–10/month at portfolio traffic levels)
> Uses: **Supabase pgvector** — no Pinecone account needed.

---

### Task 8.1 — Enable pgvector + Embeddings Table

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE embeddings (
  id          TEXT PRIMARY KEY,        -- "project-{id}", "devlog-{projectId}-{entryId}"
  content     TEXT NOT NULL,
  embedding   VECTOR(1536),            -- text-embedding-3-small dimension
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Approximate nearest-neighbor index
CREATE INDEX ON embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
-- Queried only via service role — no public policy needed

-- Similarity search RPC (called from route handler)
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT   DEFAULT 5
)
RETURNS TABLE (id TEXT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT e.id, e.content, e.metadata,
         1 - (e.embedding <=> query_embedding) AS similarity
  FROM embeddings e
  WHERE 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

Add to `.env.local`: `OPENAI_API_KEY=`

---

### Task 8.2 — Embedding Ingestion Pipeline

**File:** `lib/rag/ingest.ts`

Ingests: project `full_description`, published devlog entries, CV sections (PDF text extracted server-side). Auto-triggered when admin saves a published devlog entry (modify `upsertDevlogEntry`) or project (`upsertProject`).

Chunks text → generates embeddings via `text-embedding-3-small` → upserts into `embeddings` table via `adminSupabase`. Deletes old vector when entry is unpublished.

---

### Task 8.3 — Streaming Chat Route Handler

**File:** `app/api/chat/route.ts`

1. Embed user query via `text-embedding-3-small`
2. Call `match_embeddings()` RPC → top 5 chunks above 0.7 similarity
3. Build system prompt + inject retrieved context
4. Stream from `gpt-4o-mini` via OpenAI SDK
5. Return as `ReadableStream` (Server-Sent Events)
6. Rate limit: 10 requests per session (tracked client-side, 20 server-side)

---

### Task 8.4 — Chat Widget UI

**File:** `components/public/ChatWidget/ChatWidget.tsx`

- Fixed bottom-right button (`fixed bottom-6 right-6 z-50`)
- Opens 380×520px panel (full-screen on mobile)
- Streaming tokens appended as they arrive
- Suggested starters shown when thread is empty
- 15 message limit per session (sessionStorage counter)
- Message history in sessionStorage (cleared on tab close)

---

### Task 8.5 — Admin Knowledge Base Page

**File:** `app/admin/knowledge/page.tsx`

- Lists indexed vectors grouped by source type
- "Re-index all projects" button
- "Re-index CV" button
- Last indexed timestamps per source
- Clear index option (with confirmation)

---

---

## Architectural Decision Log

| Decision                                 | What                                  | Why                                                                           |
| ---------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------- |
| **Supabase over Firebase**               | Supabase everywhere                   | One vendor, no Admin SDK, SQL queries, no payment wall for storage            |
| **4 Supabase clients**                   | browser / server / admin / middleware | Each Next.js context needs its own — sharing causes auth bugs                 |
| **Blog removed**                         | Devlog per project                    | More useful to recruiters; shows process not opinions                         |
| **Request Live Demo**                    | Per-project modal form                | Low-friction way to activate demo APIs on demand                              |
| **Server Actions for mutations**         | All writes via Server Actions         | Co-located with types, auto-validated, no fetch boilerplate                   |
| **API routes for GET + caching**         | `/api/github-stats` only              | Benefits from ISR; route handlers are cacheable                               |
| **`adminSupabase` for all admin writes** | Service role key                      | Bypasses RLS cleanly; admin identity enforced by `verifyAdminSession()` first |
| **Zod in every action**                  | Always                                | Single source of truth for shape validation, shared with form resolvers       |
| **ISR at 300s**                          | 5 minutes                             | Reduces Supabase reads; 5-min staleness fine for a portfolio                  |
| **EmailJS client-side**                  | Not server-side                       | No server email dependency; free tier is sufficient                           |
| **pgvector over Pinecone**               | Supabase pgvector                     | One fewer vendor, free, SQL-native queries                                    |
| **Tailwind v4 CSS config**               | `@theme {}` in globals.css            | v4 doesn't use tailwind.config.ts                                             |
| **Native `<dialog>` for Modal**          | Not div overlay                       | Focus trap + backdrop built-in, accessibility-correct                         |
| **No barrel `index.ts` exports**         | Direct imports                        | Prevents circular deps, keeps tree-shaking effective                          |
| **CSS custom properties for dark mode**  | `var(--bg-primary)` etc.              | Works with Tailwind v4, SSR-safe, no JS flash                                 |
| **Keep-alive cron**                      | GitHub Actions every 5 days           | Prevents Supabase free tier pause                                             |

---

## Debugging Reference

| Symptom                               | Cause                              | Fix                                                                 |
| ------------------------------------- | ---------------------------------- | ------------------------------------------------------------------- |
| `new row violates row-level security` | Using anon client for admin write  | Use `adminSupabase` (service_role)                                  |
| Session lost on refresh               | Middleware not refreshing JWT      | Verify `supabase.auth.getUser()` runs in `middleware.ts`            |
| `PGRST116: multiple rows returned`    | `.single()` on multi-row result    | Add filter or `.limit(1)`                                           |
| Images not loading from Supabase      | Wrong hostname in `next.config.ts` | Add `*.supabase.co` to `remotePatterns`                             |
| ISR not revalidating                  | Wrong path in `revalidatePath()`   | Must be exact path: `/projects/test-project` not `/projects/[slug]` |
| Site returns 503 / DB offline         | Supabase paused (7-day inactivity) | Restart from Supabase dashboard; enable keep-alive cron             |
| Login returns 400                     | No user in Supabase Auth           | Create user: Dashboard → Authentication → Users                     |
| Admin rejected after login            | Wrong `ADMIN_UID` in env           | Copy UUID from Dashboard → Authentication → Users row               |
| Tailwind classes not applying         | Using v3 patterns in v4            | Move all config to `@theme {}` in `globals.css`                     |
| Chat answers are irrelevant           | Low match_threshold                | Lower from 0.7 to 0.6 in `match_embeddings()`                       |
| TypeScript error on `params`          | Next.js 15+ async params           | `const { slug } = await params;` — params is now a Promise          |

---

## Execution Timeline

| Week | Phase                      | Key Deliverable                        |
| ---- | -------------------------- | -------------------------------------- |
| 1    | 1A (Auth) + 1B (Design)    | Admin login works, design system ready |
| 2    | 1C (Actions) + 1D (Public) | Homepage + project pages live          |
| 3    | 1E (Admin CMS)             | Full admin CRUD working                |
| 4    | 1F (SEO/CI) + 1G (Polish)  | Lighthouse ≥ 95, v1.0.0 tagged         |
| 5–7  | Phase 2 (AI Chatbot)       | RAG chatbot live                       |

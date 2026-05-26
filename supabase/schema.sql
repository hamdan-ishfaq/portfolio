-- ═══════════════════════════════════════════
-- PORTFOLIO DATABASE SCHEMA
-- Run this entire block in Supabase SQL Editor
-- ═══════════════════════════════════════════

-- PROJECTS
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  full_description TEXT,
  cover_image_url TEXT,
  tech_stack JSONB DEFAULT '[]',
  github_repo TEXT,
  loom_video_id_demo TEXT,
  loom_video_id_arch TEXT,
  linkedin_url TEXT,
  live_demo_url TEXT,
  project_start_date TIMESTAMP WITH TIME ZONE,
  project_end_date TIMESTAMP WITH TIME ZONE,
  is_ongoing BOOLEAN DEFAULT false,
  project_status TEXT DEFAULT 'active' CHECK (project_status IN ('active', 'completed', 'archived')),
  tier INTEGER DEFAULT 0 CHECK (tier IN (0, 1, 2, 3)),
  "order" INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- TIMELINE EVENTS
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT CHECK (type IN ('academic', 'corporate', 'achievement')),
  title TEXT NOT NULL,
  organization TEXT,
  location TEXT,
  date_range TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  description TEXT[] DEFAULT '{}',
  logo_url TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CONTACT SUBMISSIONS
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived')),
  email_delivered BOOLEAN DEFAULT false,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- DEMO REQUESTS
CREATE TABLE demo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed')),
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- DEVLOG ENTRIES
CREATE TABLE devlog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('milestone', 'daily_log', 'issue', 'fix', 'architecture', 'reflection')),
  title TEXT NOT NULL,
  content TEXT,
  entry_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  linked_entry_id UUID REFERENCES devlog_entries(id),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- DEVLOG VERSIONS (auto-versioning history)
CREATE TABLE devlog_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID REFERENCES devlog_entries(id) ON DELETE CASCADE,
  content TEXT,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- PROJECT COMMENTS
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- GLOBAL SETTINGS (single row)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT DEFAULT '',
  tagline TEXT DEFAULT '',
  sub_headline TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  cv_file_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  github TEXT DEFAULT '',
  linkedin TEXT DEFAULT '',
  twitter TEXT,
  seo_title_suffix TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  hero_tech_stack JSONB DEFAULT '[]',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AUDIT LOG
CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event TEXT NOT NULL,
  admin_uid TEXT,
  ip_hash TEXT DEFAULT '',
  user_agent TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RATE LIMITS
CREATE TABLE rate_limits (
  id TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE
);

-- ── INDEXES ──────────────────────────────────
CREATE INDEX idx_projects_published ON projects(published);
CREATE INDEX idx_projects_tier ON projects(tier);
CREATE INDEX idx_projects_order ON projects("order");
CREATE INDEX idx_timeline_start_date ON timeline_events(start_date DESC);
CREATE INDEX idx_devlog_project ON devlog_entries(project_id);
CREATE INDEX idx_devlog_published ON devlog_entries(published);
CREATE INDEX idx_comments_status ON project_comments(status);
CREATE INDEX idx_comments_project ON project_comments(project_id);
CREATE INDEX idx_contact_status ON contact_submissions(status);

-- ── SEED INITIAL SETTINGS ROW ────────────────
-- (one row only — admin updates this from settings page)
INSERT INTO settings (
  display_name, tagline, sub_headline, avatar_url, cv_file_url,
  email, github, linkedin, twitter, seo_title_suffix, meta_description
) VALUES (
  'Your Name',
  'AI Engineer | Builder of Intelligent Systems',
  'I build production-grade AI systems...',
  '',
  '',
  'your@email.com',
  'https://github.com/yourusername',
  'https://linkedin.com/in/yourhandle',
  null,
  '| AI Engineer & ML Practitioner',
  'AI Engineer specializing in Agentic RAG, LLM Fine-tuning, and production AI systems.'
);

-- ── SEED TEST PROJECT ────────────────────────
INSERT INTO projects (title, slug, short_description, tier, "order", published)
VALUES ('Test Project', 'test-project', 'A test project to verify setup.', 1, 1, true);

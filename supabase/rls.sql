-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY POLICIES
-- Replaces your firestore.rules file entirely
-- ═══════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE devlog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE devlog_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- PROJECTS: Public read of published only
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT USING (published = true);

-- TIMELINE: Public read all
CREATE POLICY "Public can read timeline"
  ON timeline_events FOR SELECT USING (true);

-- SETTINGS: Public read
CREATE POLICY "Public can read settings"
  ON settings FOR SELECT USING (true);

-- COMMENTS: Public read approved only
CREATE POLICY "Public can read approved comments"
  ON project_comments FOR SELECT USING (status = 'approved');

-- COMMENTS: Public can submit (always pending)
CREATE POLICY "Public can submit comments"
  ON project_comments FOR INSERT
  WITH CHECK (status = 'pending' AND char_length(content) BETWEEN 1 AND 1000);

-- CONTACT: Public can submit
CREATE POLICY "Public can submit contact forms"
  ON contact_submissions FOR INSERT
  WITH CHECK (status = 'unread' AND char_length(message) BETWEEN 20 AND 2000);

-- DEVLOG: Public read published entries
CREATE POLICY "Public can read published devlog entries"
  ON devlog_entries FOR SELECT USING (published = true);

-- DEMO REQUESTS: Public can submit pending requests only
CREATE POLICY "Public can submit demo requests"
  ON demo_requests FOR INSERT
  WITH CHECK (status = 'pending');

-- NOTE: All WRITE operations (INSERT, UPDATE, DELETE) for admin
-- are done via the service_role key in Server Actions (adminSupabase).
-- The service_role key bypasses RLS entirely — no admin policies needed.
-- This is equivalent to your isAdmin() function in firestore.rules.

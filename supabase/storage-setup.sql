-- ═══════════════════════════════════════════
-- SUPABASE STORAGE SETUP
-- Replaces your storage.rules file
-- ═══════════════════════════════════════════

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('cv', 'cv', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- CV bucket: public read, no public write
CREATE POLICY "Public can read CV"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cv');

-- Images bucket: public read
CREATE POLICY "Public can read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Avatars bucket: public read
CREATE POLICY "Public can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- NOTE: All uploads are done server-side via adminSupabase (service_role key)
-- which bypasses these policies. No public write access needed.

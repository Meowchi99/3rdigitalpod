-- ════════════════════════════════════════════════════════════════
-- 3R DIGITAL POD — STORAGE + SEED
-- Migration 004
-- ════════════════════════════════════════════════════════════════

-- ─── STORAGE BUCKETS ───
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('winning-designs', 'winning-designs', true),
  ('owner-assets', 'owner-assets', true),
  ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for winning-designs (public read, admin write)
CREATE POLICY "winning_designs_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'winning-designs');
CREATE POLICY "winning_designs_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'winning-designs' AND is_admin_or_owner());
CREATE POLICY "winning_designs_admin_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'winning-designs' AND is_admin_or_owner());
CREATE POLICY "winning_designs_admin_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'winning-designs' AND is_admin_or_owner());

-- Policies for owner-assets (public read, admin write)
CREATE POLICY "owner_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'owner-assets');
CREATE POLICY "owner_assets_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'owner-assets' AND is_admin_or_owner());
CREATE POLICY "owner_assets_admin_modify" ON storage.objects
  FOR UPDATE USING (bucket_id = 'owner-assets' AND is_admin_or_owner());
CREATE POLICY "owner_assets_admin_remove" ON storage.objects
  FOR DELETE USING (bucket_id = 'owner-assets' AND is_admin_or_owner());

-- Policies for user-uploads (user-scoped by path prefix = user id)
CREATE POLICY "user_uploads_select_self" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'user-uploads'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_or_owner())
  );
CREATE POLICY "user_uploads_insert_self" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'user-uploads'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
CREATE POLICY "user_uploads_delete_self" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'user-uploads'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR is_admin_or_owner())
  );

-- ════════════════════════════════════════════════════════════════
-- SEED DATA
-- ════════════════════════════════════════════════════════════════

-- Winning designs (demo data)
INSERT INTO winning_designs (title, niche, main_keyword, badge, amazon_url, tags, sort_order) VALUES
  ('Nurse Life Tee', 'Healthcare', 'nurse life', 'daily', 'https://www.amazon.com/s?k=nurse+life+shirt', '["nurse","healthcare","rn"]'::jsonb, 1),
  ('Teacher Mode Shirt', 'Education', 'teacher mode', 'daily', 'https://www.amazon.com/s?k=teacher+mode+shirt', '["teacher","education","school"]'::jsonb, 2),
  ('Dog Dad Club', 'Pet Lovers', 'dog dad', 'evergreen', 'https://www.amazon.com/s?k=dog+dad+shirt', '["dog","pet","dad"]'::jsonb, 3),
  ('Fishing Vibes', 'Outdoors', 'fishing vibes', 'monthly', 'https://www.amazon.com/s?k=fishing+vibes', '["fishing","outdoor","hobby"]'::jsonb, 4),
  ('Mechanic Dad', 'Profession', 'mechanic dad', 'evergreen', 'https://www.amazon.com/s?k=mechanic+dad+shirt', '["mechanic","dad","gift"]'::jsonb, 5),
  ('Camp Life', 'Adventure', 'camp life', 'monthly', 'https://www.amazon.com/s?k=camp+life+shirt', '["camping","outdoor","adventure"]'::jsonb, 6)
ON CONFLICT DO NOTHING;

-- Trending keywords
INSERT INTO trends (trend_type, keyword, category, score, competition, is_featured) VALUES
  ('daily', 'Earth Day 2026', 'Holiday', 95, 'Medium', true),
  ('daily', 'Nurse Appreciation', 'Healthcare', 88, 'Medium', true),
  ('daily', 'Dog Mom Vintage', 'Pet', 82, 'Low', true),
  ('daily', 'Fishing Season', 'Hobby', 76, 'Low', false),
  ('daily', 'Class of 2026', 'Education', 74, 'Medium', false),
  ('monthly', 'Mother''s Day Gift', 'Gift', 98, 'High', true),
  ('monthly', 'Spring Vibes', 'Season', 90, 'Medium', true),
  ('monthly', 'Graduation 2026', 'Education', 86, 'Medium', true),
  ('monthly', 'BBQ Season', 'Food', 78, 'Low', false),
  ('monthly', 'Cat Dad Retro', 'Pet', 72, 'Low', false)
ON CONFLICT DO NOTHING;

-- External research links
INSERT INTO external_links (label, url, icon, category, sort_order) VALUES
  ('Merch Dashboard', 'https://merch.amazon.com', '🏪', 'merch', 1),
  ('Best Sellers Tees', 'https://www.amazon.com/Best-Sellers-Clothing-Shoes-Jewelry-Novelty-T-Shirts/zgbs/fashion/9056987011', '🏆', 'research', 2),
  ('Movers & Shakers', 'https://www.amazon.com/Movers-Shakers-Clothing-Shoes-Jewelry/zgbs/fashion/movers-and-shakers/9056987011', '📈', 'research', 3),
  ('New Releases', 'https://www.amazon.com/gp/new-releases/fashion/9056987011', '🆕', 'research', 4)
ON CONFLICT DO NOTHING;

-- API settings placeholders (admins can populate via dashboard)
INSERT INTO api_settings (provider_name, is_enabled, status, config_json) VALUES
  ('openai', false, 'not_configured', '{"model":"gpt-4o-mini"}'::jsonb),
  ('gemini', false, 'not_configured', '{"model":"gemini-1.5-flash"}'::jsonb)
ON CONFLICT (provider_name) DO NOTHING;

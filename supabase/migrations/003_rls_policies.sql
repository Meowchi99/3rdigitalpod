-- ════════════════════════════════════════════════════════════════
-- 3R DIGITAL POD — ROW LEVEL SECURITY
-- Migration 003 · All tables have RLS enabled
-- ════════════════════════════════════════════════════════════════

-- ─── PROFILES ───
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_public" ON profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Users cannot change their own role/plan (only admins can via helper)
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND plan = (SELECT plan FROM profiles WHERE id = auth.uid())
  );
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (is_admin_or_owner());

-- ─── OWNER_PROFILE ───
ALTER TABLE owner_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_select_public" ON owner_profile
  FOR SELECT USING (true);
CREATE POLICY "owner_update_admin" ON owner_profile
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── WINNING_DESIGNS ───
ALTER TABLE winning_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "winning_select_public" ON winning_designs
  FOR SELECT USING (is_published = TRUE OR is_admin_or_owner());
CREATE POLICY "winning_write_admin" ON winning_designs
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── TRENDS ───
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trends_select_public" ON trends
  FOR SELECT USING (true);
CREATE POLICY "trends_write_admin" ON trends
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── API_SETTINGS (admin only) ───
ALTER TABLE api_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_settings_admin_all" ON api_settings
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── EXTERNAL_LINKS ───
ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_select_public" ON external_links
  FOR SELECT USING (is_published = TRUE OR is_admin_or_owner());
CREATE POLICY "links_write_admin" ON external_links
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── SAVED_OUTPUTS (user-scoped) ───
ALTER TABLE saved_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_select_self" ON saved_outputs
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_owner());
CREATE POLICY "saved_insert_self" ON saved_outputs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_update_self" ON saved_outputs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saved_delete_self" ON saved_outputs
  FOR DELETE USING (auth.uid() = user_id OR is_admin_or_owner());

-- ─── DESIGN_ANALYSIS_LOGS (user-scoped) ───
ALTER TABLE design_analysis_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analysis_select_self" ON design_analysis_logs
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_owner());
CREATE POLICY "analysis_insert_self" ON design_analysis_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analysis_delete_self" ON design_analysis_logs
  FOR DELETE USING (auth.uid() = user_id OR is_admin_or_owner());

-- ─── SAVED_DESIGN_INSIGHTS (user-scoped) ───
ALTER TABLE saved_design_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insights_all_self" ON saved_design_insights
  FOR ALL USING (auth.uid() = user_id OR is_admin_or_owner())
  WITH CHECK (auth.uid() = user_id OR is_admin_or_owner());

-- ─── USAGE_LOGS ───
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_select_self" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_owner());
CREATE POLICY "usage_insert_self" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_update_self" ON usage_logs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── SUBSCRIPTIONS ───
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subs_select_self" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id OR is_admin_or_owner());
CREATE POLICY "subs_write_admin" ON subscriptions
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());
-- Stripe webhook should use the service_role key which bypasses RLS.

-- ─── AMAZON_PRODUCTS (public read, admin write) ───
ALTER TABLE amazon_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "amazon_select_public" ON amazon_products
  FOR SELECT USING (true);
CREATE POLICY "amazon_write_admin" ON amazon_products
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

-- ─── DAILY_JOBS (admin only) ───
ALTER TABLE daily_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jobs_admin_all" ON daily_jobs
  FOR ALL USING (is_admin_or_owner()) WITH CHECK (is_admin_or_owner());

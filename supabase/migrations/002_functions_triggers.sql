-- ════════════════════════════════════════════════════════════════
-- 3R DIGITAL POD — FUNCTIONS & TRIGGERS
-- Migration 002
-- ════════════════════════════════════════════════════════════════

-- ─── updated_at trigger function ───
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_owner_profile_updated BEFORE UPDATE ON owner_profile
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_winning_updated BEFORE UPDATE ON winning_designs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_trends_updated BEFORE UPDATE ON trends
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_api_settings_updated BEFORE UPDATE ON api_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_subs_updated BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Role helper functions (for RLS policies) ───
CREATE OR REPLACE FUNCTION current_role_value()
RETURNS user_role
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner');
$$;

CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('owner','admin'));
$$;

-- ─── AUTO-CREATE profile when a new user signs up via auth ───
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_any_owner BOOLEAN;
  v_assigned_role user_role := 'user';
BEGIN
  -- If no owner exists yet → first signup becomes the owner
  SELECT EXISTS (SELECT 1 FROM profiles WHERE role = 'owner') INTO v_has_any_owner;
  IF NOT v_has_any_owner THEN
    v_assigned_role := 'owner';
  END IF;

  INSERT INTO profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    v_assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Hook into auth.users
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── Usage log helper: increment a user's daily count ───
CREATE OR REPLACE FUNCTION increment_usage(p_action TEXT, p_count INT DEFAULT 1)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO usage_logs (user_id, action_name, usage_count, usage_date)
  VALUES (auth.uid(), p_action, p_count, CURRENT_DATE)
  ON CONFLICT (user_id, action_name, usage_date)
  DO UPDATE SET usage_count = usage_logs.usage_count + EXCLUDED.usage_count;
END;
$$;

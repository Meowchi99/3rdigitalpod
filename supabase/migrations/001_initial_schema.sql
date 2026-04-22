-- ════════════════════════════════════════════════════════════════
-- 3R DIGITAL POD — INITIAL SCHEMA
-- Migration 001 · Tables, types, and indexes
-- ════════════════════════════════════════════════════════════════

-- ─── ENUMS ───
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'user');
CREATE TYPE user_plan AS ENUM ('free', 'pro', 'elite');
CREATE TYPE badge_type AS ENUM ('daily', 'monthly', 'evergreen');
CREATE TYPE trend_type AS ENUM ('daily', 'monthly');
CREATE TYPE output_type AS ENUM ('prompt', 'listing', 'batch', 'analysis', 'niche');
CREATE TYPE analysis_mode AS ENUM ('api', 'fallback');
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete');
CREATE TYPE job_status AS ENUM ('pending', 'running', 'success', 'failed');

-- ─── PROFILES ───
-- Linked 1:1 with auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  plan user_plan NOT NULL DEFAULT 'free',
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_plan ON profiles(plan);

-- ─── OWNER_PROFILE (single row — the public-facing owner page) ───
CREATE TABLE owner_profile (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  display_name TEXT NOT NULL DEFAULT '3R Digital Lab',
  role_title TEXT NOT NULL DEFAULT 'POD Creator & AI Developer',
  intro TEXT,
  story TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WINNING_DESIGNS ───
CREATE TABLE winning_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT,
  niche TEXT,
  main_keyword TEXT,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  badge badge_type NOT NULL DEFAULT 'daily',
  amazon_url TEXT,
  notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_winning_published ON winning_designs(is_published, sort_order);
CREATE INDEX idx_winning_badge ON winning_designs(badge) WHERE is_published = TRUE;

-- ─── TRENDS ───
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_type trend_type NOT NULL,
  keyword TEXT NOT NULL,
  category TEXT,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  competition TEXT,
  source_name TEXT,
  source_url TEXT,
  amazon_url TEXT,
  notes TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_trends_type_featured ON trends(trend_type, is_featured, score DESC);

-- ─── API_SETTINGS ───
-- Never store raw API keys client-side. Keep masked + flag only.
-- Real keys live in server env vars or secure vault.
CREATE TABLE api_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT UNIQUE NOT NULL,
  api_key_masked TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'not_configured',
  last_checked_at TIMESTAMPTZ,
  config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── EXTERNAL_LINKS ───
CREATE TABLE external_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  category TEXT DEFAULT 'research',
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_links_published ON external_links(is_published, sort_order);

-- ─── SAVED_OUTPUTS (user prompt/listing history) ───
CREATE TABLE saved_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  output_type output_type NOT NULL,
  title TEXT,
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_saved_user ON saved_outputs(user_id, created_at DESC);
CREATE INDEX idx_saved_user_type ON saved_outputs(user_id, output_type);

-- ─── DESIGN_ANALYSIS_LOGS ───
CREATE TABLE design_analysis_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT,
  manual_tags TEXT[],
  mode_used analysis_mode NOT NULL DEFAULT 'fallback',
  result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_analysis_user ON design_analysis_logs(user_id, created_at DESC);

-- ─── SAVED_DESIGN_INSIGHTS ───
CREATE TABLE saved_design_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  analysis_log_id UUID REFERENCES design_analysis_logs(id) ON DELETE CASCADE,
  title TEXT,
  insight_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_insights_user ON saved_design_insights(user_id, created_at DESC);

-- ─── USAGE_LOGS (for daily limits) ───
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  usage_count INT NOT NULL DEFAULT 1,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, action_name, usage_date)
);
CREATE INDEX idx_usage_user_date ON usage_logs(user_id, usage_date DESC);

-- ─── SUBSCRIPTIONS ───
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan user_plan NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_stripe ON subscriptions(stripe_customer_id);

-- ─── AMAZON_PRODUCTS (scraped / cached items for research) ───
CREATE TABLE amazon_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  title TEXT,
  product_url TEXT,
  image_url TEXT,
  price NUMERIC(10,2),
  rating NUMERIC(3,2),
  review_count INT,
  bsr_est INT,
  score NUMERIC(5,2),
  raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_amazon_keyword ON amazon_products(keyword, fetched_at DESC);

-- ─── DAILY_JOBS (for cron / edge functions) ───
CREATE TABLE daily_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_jobs_status ON daily_jobs(status, created_at DESC);

-- ════════════════════════════════════════════════════════════════
-- Seed the owner_profile singleton row (id=1)
-- ════════════════════════════════════════════════════════════════
INSERT INTO owner_profile (id, display_name, role_title, intro, story, social_links)
VALUES (
  1,
  '3R Digital Lab',
  'POD Creator & AI Developer',
  'สร้าง 3R Digital POD เพื่อรวมทุก workflow ของ Print on Demand ไว้ในที่เดียว',
  'เริ่มจากการเป็นนัก POD เอง เจอปัญหาว่าต้องใช้เครื่องมือหลายตัวต่อวัน — จึงรวมทุกอย่างไว้ในที่เดียว ใช้ฟรี และรองรับทั้ง AI Mode กับ Fallback Mode',
  '{"website":"https://www.3rdigitallab.digital","facebook":"","twitter":"","instagram":""}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

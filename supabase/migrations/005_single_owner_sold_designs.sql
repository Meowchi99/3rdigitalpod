-- ════════════════════════════════════════════════════════════════
-- 3R DIGITAL POD — SINGLE OWNER + SOLD DESIGNS
-- Migration 005
-- ----------------------------------------------------------------
-- • Refactor owner_profile → single-record premium profile
-- • New table sold_designs (owner-managed social proof on home)
-- • Tighten owner-assets storage to owner-only writes
-- • Grants + RLS for both tables
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ────────────────────────────────────────────────────────────────
-- 1) OWNER_PROFILE — add new columns, migrate data, drop old ones
-- ────────────────────────────────────────────────────────────────
ALTER TABLE owner_profile
  ADD COLUMN IF NOT EXISTS owner_name         TEXT,
  ADD COLUMN IF NOT EXISTS profile_image_url  TEXT,
  ADD COLUMN IF NOT EXISTS story_image_url    TEXT,
  ADD COLUMN IF NOT EXISTS total_revenue      NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS monthly_revenue    NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS revenue_note       TEXT;

-- Migrate existing data (only if the old columns still exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'owner_profile' AND column_name = 'display_name') THEN
    UPDATE owner_profile
       SET owner_name = COALESCE(owner_name, display_name)
     WHERE id = 1;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'owner_profile' AND column_name = 'avatar_url') THEN
    UPDATE owner_profile
       SET profile_image_url = COALESCE(profile_image_url, avatar_url)
     WHERE id = 1;
  END IF;
END $$;

-- Drop legacy columns (role_title, banner_url, social_links no longer used)
ALTER TABLE owner_profile
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS role_title,
  DROP COLUMN IF EXISTS avatar_url,
  DROP COLUMN IF EXISTS banner_url,
  DROP COLUMN IF EXISTS social_links,
  DROP COLUMN IF EXISTS updated_by;

-- Make owner_name required, default to sensible value
UPDATE owner_profile SET owner_name = '3R Digital Lab' WHERE owner_name IS NULL AND id = 1;
ALTER TABLE owner_profile ALTER COLUMN owner_name SET DEFAULT '3R Digital Lab';
ALTER TABLE owner_profile ALTER COLUMN owner_name SET NOT NULL;

-- Ensure the singleton row exists (id=1)
INSERT INTO owner_profile (id, owner_name, intro, story)
VALUES (1, '3R Digital Lab',
        'สร้าง 3R Digital POD เพื่อรวมทุก workflow ของ Print on Demand ไว้ในที่เดียว',
        'เริ่มจากการเป็นนัก POD เอง เจอปัญหาว่าต้องใช้เครื่องมือหลายตัวต่อวัน — จึงรวมทุกอย่างไว้ในที่เดียว ใช้ฟรี และรองรับทั้ง AI Mode กับ Fallback Mode')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 2) OWNER_PROFILE — RLS: owner-only write (admins are read-only)
-- ────────────────────────────────────────────────────────────────
ALTER TABLE owner_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS owner_update_admin        ON owner_profile;
DROP POLICY IF EXISTS owner_write_owner_only    ON owner_profile;
DROP POLICY IF EXISTS owner_insert_owner_only   ON owner_profile;
DROP POLICY IF EXISTS owner_select_public       ON owner_profile;

CREATE POLICY "owner_select_public" ON owner_profile
  FOR SELECT USING (true);

CREATE POLICY "owner_update_owner_only" ON owner_profile
  FOR UPDATE USING (is_owner()) WITH CHECK (is_owner());

CREATE POLICY "owner_insert_owner_only" ON owner_profile
  FOR INSERT WITH CHECK (is_owner());

-- No DELETE policy — the singleton row must never be removed.

-- Grants (authenticated role needs table-level permission too)
GRANT SELECT ON owner_profile TO anon, authenticated;
GRANT INSERT, UPDATE ON owner_profile TO authenticated;

-- ────────────────────────────────────────────────────────────────
-- 3) SOLD_DESIGNS — new table for home-page social proof
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sold_designs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  image_url   TEXT,
  niche       TEXT,
  badge_text  TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_visible  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sold_visible_order
  ON sold_designs(is_visible, sort_order, created_at DESC);

-- updated_at trigger (reuses function from migration 002)
DROP TRIGGER IF EXISTS trg_sold_designs_updated ON sold_designs;
CREATE TRIGGER trg_sold_designs_updated BEFORE UPDATE ON sold_designs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE sold_designs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sold_select_public ON sold_designs;
DROP POLICY IF EXISTS sold_write_owner   ON sold_designs;

CREATE POLICY "sold_select_public" ON sold_designs
  FOR SELECT USING (is_visible = TRUE OR is_admin_or_owner());

CREATE POLICY "sold_write_owner" ON sold_designs
  FOR ALL USING (is_owner()) WITH CHECK (is_owner());

GRANT SELECT ON sold_designs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON sold_designs TO authenticated;

-- Seed a few starter rows so the home section isn't empty
INSERT INTO sold_designs (title, niche, badge_text, sort_order, is_visible) VALUES
  ('Nurse Life Vintage Tee',  'Healthcare',   'TOP SELLER', 1, TRUE),
  ('Dog Mom Retro Club',      'Pet Lovers',   'BEST SELLER', 2, TRUE),
  ('Teacher Mode Activated',  'Education',    'HOT',         3, TRUE),
  ('Fishing Legend Season',   'Outdoors',     'TOP SELLER',  4, TRUE),
  ('Camp Life Adventure',     'Adventure',    'BEST SELLER', 5, TRUE)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- 4) STORAGE — tighten owner-assets to OWNER-ONLY writes
-- ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS owner_assets_admin_write   ON storage.objects;
DROP POLICY IF EXISTS owner_assets_admin_modify  ON storage.objects;
DROP POLICY IF EXISTS owner_assets_admin_remove  ON storage.objects;
DROP POLICY IF EXISTS owner_assets_owner_write   ON storage.objects;
DROP POLICY IF EXISTS owner_assets_owner_modify  ON storage.objects;
DROP POLICY IF EXISTS owner_assets_owner_remove  ON storage.objects;

CREATE POLICY "owner_assets_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'owner-assets' AND is_owner());

CREATE POLICY "owner_assets_owner_modify" ON storage.objects
  FOR UPDATE USING (bucket_id = 'owner-assets' AND is_owner());

CREATE POLICY "owner_assets_owner_remove" ON storage.objects
  FOR DELETE USING (bucket_id = 'owner-assets' AND is_owner());

-- owner_assets_public_read policy already exists from migration 004.

COMMIT;

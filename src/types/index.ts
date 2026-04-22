export type UserRole = 'owner' | 'admin' | 'user';
export type UserPlan = 'free' | 'pro' | 'elite';
export type BadgeType = 'daily' | 'monthly' | 'evergreen';
export type TrendType = 'daily' | 'monthly';
export type OutputType = 'prompt' | 'listing' | 'batch' | 'analysis' | 'niche';
export type AnalysisMode = 'api' | 'fallback';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OwnerProfile {
  id: 1;
  display_name: string;
  role_title: string;
  intro: string | null;
  story: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  social_links: Record<string, string>;
  updated_at: string;
}

export interface WinningDesign {
  id: string;
  title: string;
  image_url: string | null;
  niche: string | null;
  main_keyword: string | null;
  tags: string[];
  badge: BadgeType;
  amazon_url: string | null;
  notes: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Trend {
  id: string;
  trend_type: TrendType;
  keyword: string;
  category: string | null;
  score: number;
  competition: string | null;
  source_name: string | null;
  source_url: string | null;
  amazon_url: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface ApiSetting {
  id: string;
  provider_name: string;
  api_key_masked: string | null;
  is_enabled: boolean;
  status: string;
  last_checked_at: string | null;
  config_json: Record<string, unknown>;
  updated_at: string;
}

export interface ExternalLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  category: string;
  sort_order: number;
  is_published: boolean;
}

export interface SavedOutput {
  id: string;
  user_id: string;
  output_type: OutputType;
  title: string | null;
  input_json: Record<string, unknown>;
  output_json: Record<string, unknown>;
  is_favorite: boolean;
  created_at: string;
}

export interface DesignAnalysisLog {
  id: string;
  user_id: string;
  image_url: string | null;
  manual_tags: string[] | null;
  mode_used: AnalysisMode;
  result_json: DesignAnalysisResult;
  created_at: string;
}

// ─── Engine-level types ───
export interface PromptEngineInput {
  keyword: string;
  niche?: string;
  style?: string;
  audience?: string;
  season?: string;
  depth?: 'simple' | 'detailed' | 'pro';
  tool?: 'midjourney' | 'dalle' | 'ideogram' | 'leonardo';
}

export interface PromptEngineOutput {
  prompt: string;
  negative_prompt?: string;
  tags: string[];
  suggested_styles: string[];
  mode: AnalysisMode;
}

export interface ListingEngineInput {
  niche: string;
  product_type: string;
  audience?: string;
  occasion?: string;
  keywords?: string[];
}

export interface ListingEngineOutput {
  brand: string;
  title: string;
  bullet_1: string;
  bullet_2: string;
  description: string;
  seo_keywords: string[];
  mode: AnalysisMode;
}

export interface DesignAnalysisInput {
  image_url?: string;
  image_base64?: string;
  manual_tags?: string[];
  niche_hint?: string;
}

export interface DesignAnalysisResult {
  verdict: 'YES' | 'MAYBE' | 'NO';
  confidence: number;
  total_score: number;
  scores: {
    design_quality: number;
    niche_clarity: number;
    competition_level: number;
    seo_potential: number;
    audience_match: number;
    print_feasibility: number;
    color_contrast: number;
    typography: number;
    uniqueness: number;
    market_demand: number;
  };
  suggested_niche: string;
  suggested_keywords: string[];
  audience: string;
  warnings: string[];
  improvements: string[];
  ad_recommendation?: {
    budget_usd_per_day: number;
    targeting: string;
    expected_acos: string;
  };
  mode: AnalysisMode;
}

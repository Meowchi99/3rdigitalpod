# 3R Digital POD — AI Toolkit for Print on Demand

Full SaaS platform for Merch by Amazon / POD creators. One-click niche + prompt + listing generation, plus 12+ supporting tools.

## ⭐ Flagship Feature: Make Me Money Flow

Located on the home page, below the hero. One click generates:

- **Selected Niche** (scored from modifier pool)
- **Design Prompt** (Midjourney/DALL-E ready)
- **SEO Listing** (Amazon Merch compliant)
- **Why This Works** (2–3 reasoning bullets)
- **Actions**: Copy · Save to Hub · Generate Similar · Send to Merch Extension

### Goal Modes
- 💸 **Fast Money** — low-competition niches
- 🔥 **Trend** — trending in Trend Radar
- ♾ **Evergreen** — sells year-round
- 🗓 **Seasonal** — peak-season boosted

### Scoring
`score = demand − competition + seasonBoost + (modifierBoost × 1.5)`

### Usage Limits (enforced server-side via `src/lib/auth/usage-limiter.ts`)
| Plan  | Make Money | Design Analysis | Batch |
|-------|-----------:|----------------:|------:|
| Free  |       3/day|           5/day |   — |
| Pro   |   1000/day|         200/day | 50/day |
| Elite |         ∞  |              ∞  |    ∞ |

When a free user hits 3/day they see a paywall modal that links to `/pricing`.

---

## Owner / Admin Access

**Flow:**
1. First-ever signup is auto-promoted to `owner` (trigger in migration `002`).
2. Owner logs in → middleware detects role → unlocks 🔒 Admin link in top nav.
3. `/admin/*` routes are protected at **two layers**: Next.js middleware + Supabase RLS.
4. Owner can promote others to admin at `/admin/users` via `POST /api/admin/promote`.

**Admin pages:**
- `/admin` — overview with stats
- `/admin/winning-designs` — CRUD for home "Winning Designs"
- `/admin/trends` — CRUD for Trend Radar
- `/admin/owner-profile` — edit public Owner page (avatar, banner, bio, social links)
- `/admin/api-settings` — toggle OpenAI / Gemini (keys live in `.env.local`)
- `/admin/users` — manage user roles (owner-only for promotions)
- `/admin/usage` — aggregate usage dashboard across all users
- `/admin/logs` — recent usage + design analysis logs

---

## Tech Stack
- **Next.js 14** App Router + TypeScript
- **Tailwind CSS** with custom palette: black/red/blue/yellow/pink
- **Supabase**: Postgres + Auth + Storage + RLS
- **Chrome Extension** (MV3) for Merch autofill

---

## Setup

### 1. Clone & install
```bash
npm install
cp .env.local.example .env.local
```

### 2. Supabase project
```bash
# Run migrations in order in Supabase SQL editor:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_functions_triggers.sql
supabase/migrations/003_rls_policies.sql
supabase/migrations/004_storage_and_seed.sql
```

### 3. Env vars (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
OPENAI_API_KEY=sk-...        # optional — fallback works without
GEMINI_API_KEY=AIza...       # optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run
```bash
npm run dev
# → http://localhost:3000
```

### 5. First signup
- Go to `/signup` — you will be auto-assigned `owner` role
- Now `/admin` is accessible in the top nav

---

## Routes Map

### Public
- `/` — Home with MakeMeMoney + Winning Designs + Trends
- `/pricing` — Landing page for Pro upgrade
- `/owner` — Public Owner profile

### Tools (12)
- `/trending` `/research` `/expand` `/seo-listing`
- `/design-analyzer` `/image-listing` `/batch` `/niche-finder`
- `/tm-checker` `/bsr` `/royalty` `/tier` `/merch-hub`

### Auth
- `/login` `/signup` `/auth/callback` `/auth/signout`

### Admin (role-gated)
- `/admin` `/admin/winning-designs` `/admin/trends` `/admin/owner-profile`
- `/admin/api-settings` `/admin/users` `/admin/usage` `/admin/logs`

### API
- `POST /api/make-money` — ⭐ Core Money Pack generator (usage-limited)
- `POST /api/save-output` — Save to Merch Hub
- `GET /api/save-output?type=prompt` — List saved
- `POST /api/prompt/generate` — Prompt only
- `POST /api/listing/generate` — Listing only
- `POST /api/analyze-design` — Design Analyzer (vision + fallback)
- `POST /api/niche/find` — Niche Finder
- `POST /api/admin/promote` — Owner-only role changes

---

## Fallback Mode

**Every AI feature works without an API key.** The `src/lib/engines/` folder contains deterministic fallback engines:
- `make-money.ts` — seed pools + modifier scoring
- `prompt-engine.ts` — template-based prompts
- `listing-engine.ts` — SEO listing with char limits
- `design-analysis.ts` — tag-based heuristic scoring
- `niche-finder.ts` — modifier expansion

If `OPENAI_API_KEY` or `GEMINI_API_KEY` are set, the router in `src/lib/ai/router.ts` tries AI first and falls through on failure. This means the app **never breaks** even mid-outage.

---

## Deploy to Vercel

1. Push to GitHub
2. Import on vercel.com
3. Add env vars (all from `.env.local`)
4. Add your Vercel domain to Supabase Auth → URL Configuration → Site URL + Redirect URLs
5. Deploy

---

## File Structure
```
src/
  app/
    api/                   # all API routes
      make-money/          # ⭐ core endpoint
      save-output/
      analyze-design/
      prompt/ listing/ niche/
      admin/promote/
    admin/                 # role-gated pages
    (tools)/               # 12 tool pages
    login/ signup/ auth/
    owner/ settings/ pricing/
    page.tsx               # home with MakeMeMoney
    layout.tsx globals.css
  components/
    nav/TopNav.tsx
    ui/index.tsx           # primitives (ActionButton, Field, Pill, Section, …)
    tools/
      MakeMeMoney.tsx      # ⭐ flagship component
      HomeQuickPrompt.tsx
  lib/
    auth/
      index.ts             # getCurrentProfile, requireRole
      usage-limiter.ts     # checkUsage, recordUsage
    engines/               # fallback business logic
      make-money.ts
      prompt-engine.ts listing-engine.ts design-analysis.ts niche-finder.ts
    ai/router.ts           # OpenAI + Gemini adapter
    supabase/
      client.ts server.ts middleware.ts
    utils.ts
  middleware.ts            # protects /admin/*
  types/index.ts
supabase/migrations/       # 001–004 SQL
```

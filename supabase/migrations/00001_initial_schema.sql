-- 00001_initial_schema.sql
-- Initial database schema for The Logical Foundation
-- Note: No users or verification_codes tables — Supabase Auth (auth.users) handles that.

-- =============================================================================
-- 1. profiles
-- =============================================================================
CREATE TABLE public.profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name  TEXT,

  -- Address
  address_type         TEXT CHECK (address_type IN ('full', 'homeless', 'prefer_not')),
  street               TEXT,
  city                 TEXT,
  state_region         TEXT,
  postal_code          TEXT,
  country              TEXT,
  homeless_description TEXT,

  -- Giver info
  giver_type TEXT CHECK (giver_type IN ('individual', 'company', 'foundation', 'government')),

  -- Contact & visibility
  phone     TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  verified  BOOLEAN NOT NULL DEFAULT FALSE,

  -- Role
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. ubi_pledges
-- =============================================================================
CREATE TABLE public.ubi_pledges (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  impact_zone           TEXT CHECK (impact_zone IN ('arizona', 'america', 'earth', 'custom', 'statewide')),
  custom_impact_zone    TEXT,
  homelessness_priority BOOLEAN,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. pledge_items
-- =============================================================================
CREATE TABLE public.pledge_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ubi_pledge_id   UUID NOT NULL REFERENCES public.ubi_pledges(id) ON DELETE CASCADE,

  pledge_type     TEXT CHECK (pledge_type IN ('income_based', 'wealth_based', 'vehicle', 'real_estate', 'crypto', 'other')),
  cadence         TEXT CHECK (cadence IN ('annual', 'monthly', 'planned')),

  -- Income-based
  estimated_income NUMERIC(15,2),
  income_percent   NUMERIC(5,2),

  -- Wealth-based
  estimated_net_worth NUMERIC(15,2),
  wealth_percent      NUMERIC(5,2),

  -- Vehicle
  vehicle_year      TEXT,
  vehicle_make      TEXT,
  vehicle_model     TEXT,
  vehicle_mileage   INTEGER,
  vehicle_condition TEXT,

  -- Real estate
  property_address        TEXT,
  property_type           TEXT,
  estimated_property_value NUMERIC(15,2),

  -- Other
  other_description TEXT,

  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. az_tax_credit
-- =============================================================================
CREATE TABLE public.az_tax_credit (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  files_az_tax        BOOLEAN,
  will_use_credit     BOOLEAN,
  wants_carry_forward BOOLEAN,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. foundation_fund_opinions
-- =============================================================================
CREATE TABLE public.foundation_fund_opinions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  opinion    TEXT CHECK (opinion IN ('terrible', 'good')),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. comingle_opinions
-- =============================================================================
CREATE TABLE public.comingle_opinions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  opinion    TEXT CHECK (opinion IN ('terrible', 'good')),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 7. volunteers
-- =============================================================================
CREATE TABLE public.volunteers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name         TEXT,
  email        TEXT NOT NULL UNIQUE,
  phone        TEXT,
  skills       TEXT[],
  availability TEXT,
  points       INTEGER NOT NULL DEFAULT 0,
  tier         TEXT NOT NULL DEFAULT 'seed' CHECK (tier IN ('seed', 'sprout', 'grower', 'champion', 'legend')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 8. volunteer_activities
-- =============================================================================
CREATE TABLE public.volunteer_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  activity     TEXT,
  points       INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 9. mission_submissions
-- =============================================================================
CREATE TABLE public.mission_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id    UUID NOT NULL REFERENCES public.volunteers(id) ON DELETE CASCADE,
  mission_id      TEXT,
  mission_title   TEXT,
  evidence        TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  ai_verdict      TEXT,
  points_awarded  INTEGER NOT NULL DEFAULT 0,
  reviewed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

-- =============================================================================
-- 10. subscribers
-- =============================================================================
CREATE TABLE public.subscribers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT NOT NULL UNIQUE,
  first_name TEXT,
  source     TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 11. sent_emails (fix #10: sent_date generated column + unique constraint)
-- =============================================================================
CREATE TABLE public.sent_emails (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject         TEXT,
  body_html       TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  sent_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Generated column: extract date from created_at for dedup (security fix #10)
  sent_date DATE GENERATED ALWAYS AS (created_at::date) STORED
);

-- Prevent duplicate sends of the same subject on the same day (fix #10)
ALTER TABLE public.sent_emails
  ADD CONSTRAINT sent_emails_subject_date_unique UNIQUE (subject, sent_date);

-- =============================================================================
-- 12. volunteer_inquiries
-- =============================================================================
CREATE TABLE public.volunteer_inquiries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT,
  message    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 13. admin_audit_log (security fix #12)
-- =============================================================================
CREATE TABLE public.admin_audit_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  UUID NOT NULL REFERENCES auth.users(id),
  action         TEXT NOT NULL,
  resource_type  TEXT NOT NULL,
  resource_id    TEXT,
  details        JSONB,
  ip_address     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- Trigger function: auto-update updated_at on row modification
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_az_tax_credit_updated_at
  BEFORE UPDATE ON public.az_tax_credit
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ubi_pledges_updated_at
  BEFORE UPDATE ON public.ubi_pledges
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pledge_items_updated_at
  BEFORE UPDATE ON public.pledge_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_volunteers_updated_at
  BEFORE UPDATE ON public.volunteers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX idx_pledge_items_ubi_pledge_id ON public.pledge_items(ubi_pledge_id);
CREATE INDEX idx_volunteers_email ON public.volunteers(email);
CREATE INDEX idx_volunteer_activities_volunteer_id ON public.volunteer_activities(volunteer_id);

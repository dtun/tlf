-- 00002_rls_policies.sql
-- Row-Level Security policies for all tables.

-- =============================================================================
-- Enable RLS on every table
-- =============================================================================
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubi_pledges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pledge_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.az_tax_credit           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foundation_fund_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comingle_opinions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_activities    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_emails             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_inquiries     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log         ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- Helper: check if the current user is an admin
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- =============================================================================
-- profiles
-- =============================================================================
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY profiles_admin_select ON public.profiles
  FOR SELECT USING (is_admin());

-- =============================================================================
-- ubi_pledges
-- =============================================================================
CREATE POLICY ubi_pledges_select_own ON public.ubi_pledges
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ubi_pledges_insert_own ON public.ubi_pledges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ubi_pledges_update_own ON public.ubi_pledges
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY ubi_pledges_delete_own ON public.ubi_pledges
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY ubi_pledges_admin_select ON public.ubi_pledges
  FOR SELECT USING (is_admin());

-- =============================================================================
-- pledge_items (ownership via join to ubi_pledges)
-- =============================================================================
CREATE POLICY pledge_items_select_own ON public.pledge_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.ubi_pledges
      WHERE ubi_pledges.id = pledge_items.ubi_pledge_id
        AND ubi_pledges.user_id = auth.uid()
    )
  );

CREATE POLICY pledge_items_insert_own ON public.pledge_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ubi_pledges
      WHERE ubi_pledges.id = pledge_items.ubi_pledge_id
        AND ubi_pledges.user_id = auth.uid()
    )
  );

CREATE POLICY pledge_items_update_own ON public.pledge_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.ubi_pledges
      WHERE ubi_pledges.id = pledge_items.ubi_pledge_id
        AND ubi_pledges.user_id = auth.uid()
    )
  );

CREATE POLICY pledge_items_delete_own ON public.pledge_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.ubi_pledges
      WHERE ubi_pledges.id = pledge_items.ubi_pledge_id
        AND ubi_pledges.user_id = auth.uid()
    )
  );

CREATE POLICY pledge_items_admin_select ON public.pledge_items
  FOR SELECT USING (is_admin());

-- =============================================================================
-- az_tax_credit
-- =============================================================================
CREATE POLICY az_tax_credit_select_own ON public.az_tax_credit
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY az_tax_credit_insert_own ON public.az_tax_credit
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY az_tax_credit_update_own ON public.az_tax_credit
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY az_tax_credit_admin_select ON public.az_tax_credit
  FOR SELECT USING (is_admin());

-- =============================================================================
-- foundation_fund_opinions
-- =============================================================================
CREATE POLICY foundation_fund_opinions_select_own ON public.foundation_fund_opinions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY foundation_fund_opinions_insert_own ON public.foundation_fund_opinions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY foundation_fund_opinions_update_own ON public.foundation_fund_opinions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY foundation_fund_opinions_admin_select ON public.foundation_fund_opinions
  FOR SELECT USING (is_admin());

-- =============================================================================
-- comingle_opinions
-- =============================================================================
CREATE POLICY comingle_opinions_select_own ON public.comingle_opinions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY comingle_opinions_insert_own ON public.comingle_opinions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY comingle_opinions_update_own ON public.comingle_opinions
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY comingle_opinions_admin_select ON public.comingle_opinions
  FOR SELECT USING (is_admin());

-- =============================================================================
-- volunteers (public signup + leaderboard visibility)
-- =============================================================================
-- Anyone (anon or authenticated) can sign up as a volunteer
CREATE POLICY volunteers_insert_public ON public.volunteers
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Anyone can view volunteers (leaderboard)
CREATE POLICY volunteers_select_public ON public.volunteers
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Admin full access
CREATE POLICY volunteers_admin_all ON public.volunteers
  FOR ALL USING (is_admin());

-- =============================================================================
-- volunteer_activities
-- =============================================================================
-- Volunteers can see their own activities (via join)
CREATE POLICY volunteer_activities_select_own ON public.volunteer_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.volunteers
      WHERE volunteers.id = volunteer_activities.volunteer_id
        AND volunteers.user_id = auth.uid()
    )
  );

-- Admin can insert and select
CREATE POLICY volunteer_activities_admin_insert ON public.volunteer_activities
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY volunteer_activities_admin_select ON public.volunteer_activities
  FOR SELECT USING (is_admin());

-- =============================================================================
-- mission_submissions
-- =============================================================================
-- Anyone (anon or authenticated) can submit a mission
CREATE POLICY mission_submissions_insert_public ON public.mission_submissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Volunteers can view their own submissions
CREATE POLICY mission_submissions_select_own ON public.mission_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.volunteers
      WHERE volunteers.id = mission_submissions.volunteer_id
        AND volunteers.user_id = auth.uid()
    )
  );

-- Admin can select and update all submissions
CREATE POLICY mission_submissions_admin_select ON public.mission_submissions
  FOR SELECT USING (is_admin());

CREATE POLICY mission_submissions_admin_update ON public.mission_submissions
  FOR UPDATE USING (is_admin());

-- =============================================================================
-- subscribers
-- =============================================================================
-- Anyone can subscribe
CREATE POLICY subscribers_insert_public ON public.subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Admin can view subscribers
CREATE POLICY subscribers_admin_select ON public.subscribers
  FOR SELECT USING (is_admin());

-- =============================================================================
-- sent_emails (admin only)
-- =============================================================================
CREATE POLICY sent_emails_admin_insert ON public.sent_emails
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY sent_emails_admin_select ON public.sent_emails
  FOR SELECT USING (is_admin());

-- =============================================================================
-- volunteer_inquiries
-- =============================================================================
-- Anyone can submit an inquiry
CREATE POLICY volunteer_inquiries_insert_public ON public.volunteer_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Admin can view inquiries
CREATE POLICY volunteer_inquiries_admin_select ON public.volunteer_inquiries
  FOR SELECT USING (is_admin());

-- =============================================================================
-- admin_audit_log (admin only — security fix #12)
-- =============================================================================
CREATE POLICY admin_audit_log_admin_insert ON public.admin_audit_log
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY admin_audit_log_admin_select ON public.admin_audit_log
  FOR SELECT USING (is_admin());

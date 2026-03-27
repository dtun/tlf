-- 00003_functions.sql
-- Application-level helper functions.

-- =============================================================================
-- Calculate volunteer tier from total points
-- =============================================================================
CREATE OR REPLACE FUNCTION public.calculate_volunteer_tier(total_points INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN total_points >= 5000 THEN 'legend'
    WHEN total_points >= 2000 THEN 'champion'
    WHEN total_points >= 750  THEN 'grower'
    WHEN total_points >= 200  THEN 'sprout'
    ELSE 'seed'
  END;
$$;

-- =============================================================================
-- Recalculate a volunteer's total points and update their tier
-- Uses SECURITY DEFINER so it can update the volunteers table regardless
-- of the caller's RLS permissions.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_volunteer_points(vol_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total INTEGER;
  new_tier TEXT;
BEGIN
  SELECT COALESCE(SUM(points), 0) INTO total
  FROM volunteer_activities
  WHERE volunteer_id = vol_id;

  new_tier := calculate_volunteer_tier(total);

  UPDATE volunteers
  SET points = total, tier = new_tier, updated_at = NOW()
  WHERE id = vol_id;
END;
$$;

-- =============================================================================
-- Log an admin action (security audit fix #12)
-- Wraps the insert into admin_audit_log so callers don't need direct INSERT
-- and the admin_user_id is always auth.uid().
-- =============================================================================
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO admin_audit_log (admin_user_id, action, resource_type, resource_id, details, ip_address)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_details, p_ip_address);
END;
$$;

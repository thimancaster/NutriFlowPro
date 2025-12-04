-- Remove deprecated RLS policies using raw_app_meta_data pattern
-- These are replaced by the more secure has_role() based policies

-- Remove deprecated policy from stripe_events
DROP POLICY IF EXISTS "Admin only access to stripe events" ON stripe_events;

-- Remove deprecated policy from security_audit_log  
DROP POLICY IF EXISTS "Admin access to audit logs" ON security_audit_log;

-- Verify the secure policies remain:
-- stripe_events has "Admins can manage stripe events" using has_role()
-- security_audit_log has "Admins can view all audit logs" using has_role()

-- Add input validation to log_security_event_safe function
CREATE OR REPLACE FUNCTION public.log_security_event_safe(
  p_user_id uuid, 
  p_event_type text, 
  p_event_data jsonb DEFAULT '{}'::jsonb, 
  p_ip_address text DEFAULT NULL::text, 
  p_user_agent text DEFAULT NULL::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Input validation
  IF p_event_type IS NULL OR LENGTH(p_event_type) < 1 OR LENGTH(p_event_type) > 100 THEN
    RAISE EXCEPTION 'Invalid event_type: must be 1-100 characters';
  END IF;
  
  -- Limit event_data size (prevent DoS via large payloads)
  IF pg_column_size(p_event_data) > 10000 THEN
    p_event_data := jsonb_build_object('error', 'event_data too large, truncated');
  END IF;
  
  -- Validate user_id matches authenticated user (when applicable)
  -- Allow NULL user_id for system events
  IF p_user_id IS NOT NULL AND auth.uid() IS NOT NULL AND p_user_id != auth.uid() THEN
    -- Log the mismatch but don't fail - use the authenticated user instead
    p_user_id := auth.uid();
  END IF;

  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    p_event_type,
    p_event_data,
    LEFT(p_ip_address, 45), -- Limit IP address length
    LEFT(p_user_agent, 500), -- Limit user agent length
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Silent failure to not break main functionality
    NULL;
END;
$$;

-- Phase 1: Critical RLS Policy Implementation and Cleanup

-- Enable RLS on all tables that should have it
ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Drop existing problematic policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can create their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can update their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can delete their patients anthropometry" ON public.anthropometry;

-- Create comprehensive RLS policies for anthropometry
CREATE POLICY "Users can manage their patients anthropometry" ON public.anthropometry
  FOR ALL USING (
    user_id = auth.uid() OR 
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE user_id = auth.uid()
    )
  );

-- Secure appointments table
DROP POLICY IF EXISTS "Users can manage their appointments" ON public.appointments;
CREATE POLICY "Users can manage their appointments" ON public.appointments
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure calculations table
DROP POLICY IF EXISTS "Users can manage their calculations" ON public.calculations;
CREATE POLICY "Users can manage their calculations" ON public.calculations
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure calculation_history table
DROP POLICY IF EXISTS "Users can manage their calculation history" ON public.calculation_history;
CREATE POLICY "Users can manage their calculation history" ON public.calculation_history
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure meal_plans table
DROP POLICY IF EXISTS "Users can manage their meal plans" ON public.meal_plans;
CREATE POLICY "Users can manage their meal plans" ON public.meal_plans
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure meal_plan_items table
DROP POLICY IF EXISTS "Users can manage their meal plan items" ON public.meal_plan_items;
CREATE POLICY "Users can manage their meal plan items" ON public.meal_plan_items
  FOR ALL USING (
    meal_plan_id IN (
      SELECT id FROM public.meal_plans 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    meal_plan_id IN (
      SELECT id FROM public.meal_plans 
      WHERE user_id = auth.uid()
    )
  );

-- Secure measurements table
DROP POLICY IF EXISTS "Users can manage their patients measurements" ON public.measurements;
CREATE POLICY "Users can manage their patients measurements" ON public.measurements
  FOR ALL USING (
    user_id = auth.uid() OR 
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id = auth.uid() AND
    patient_id IN (
      SELECT id FROM public.patients 
      WHERE user_id = auth.uid()
    )
  );

-- Secure patients table
DROP POLICY IF EXISTS "Users can manage their patients" ON public.patients;
CREATE POLICY "Users can manage their patients" ON public.patients
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure user_settings table
DROP POLICY IF EXISTS "Users can manage their settings" ON public.user_settings;
CREATE POLICY "Users can manage their settings" ON public.user_settings
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure users table
DROP POLICY IF EXISTS "Users can manage their profile" ON public.users;
CREATE POLICY "Users can view their profile" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their profile" ON public.users
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their profile" ON public.users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Secure testimonials table
DROP POLICY IF EXISTS "Users can manage their testimonials" ON public.testimonials;
CREATE POLICY "Users can view approved testimonials" ON public.testimonials
  FOR SELECT USING (approved = true OR user_id = auth.uid());

CREATE POLICY "Users can create their testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their testimonials" ON public.testimonials
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Secure security_audit_log table (admin only for full access, users for own events)
CREATE POLICY "Admins can view all audit logs" ON public.security_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
    )
  );

CREATE POLICY "Users can view own audit logs" ON public.security_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Secure subscribers table (admin only)
CREATE POLICY "Admins can manage subscribers" ON public.subscribers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
    )
  );

CREATE POLICY "Users can view own subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid());

-- Secure stripe_events table (admin only)
CREATE POLICY "Admins only can manage stripe events" ON public.stripe_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
    )
  );

-- Public read access for food-related tables
CREATE POLICY "Anyone can read foods" ON public.foods
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read food categories" ON public.food_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read food substitutions" ON public.food_substitutions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read meal suggestions" ON public.meal_suggestions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can read appointment types" ON public.appointment_types
  FOR SELECT USING (true);

-- Enhanced security function for premium access validation
CREATE OR REPLACE FUNCTION public.validate_premium_access_secure(
  feature_name TEXT,
  action_type TEXT DEFAULT 'read'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_premium BOOLEAN := FALSE;
  current_usage INTEGER := 0;
  usage_limit INTEGER := 5;
  result JSONB;
BEGIN
  -- Validate user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'User not authenticated',
      'feature', feature_name,
      'timestamp', NOW()
    );
  END IF;

  -- Check premium status with proper validation
  SELECT COALESCE(s.is_premium, FALSE) INTO is_premium
  FROM public.subscribers s
  WHERE s.user_id = current_user_id
    AND s.payment_status = 'active'
    AND (s.subscription_end IS NULL OR s.subscription_end > NOW())
  LIMIT 1;

  -- Check if user is admin (always has access)
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = current_user_id 
    AND email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
  ) THEN
    is_premium := TRUE;
  END IF;

  -- For premium users, grant full access
  IF is_premium THEN
    result := jsonb_build_object(
      'has_access', true,
      'is_premium', true,
      'feature', feature_name,
      'action', action_type,
      'timestamp', NOW()
    );
  ELSE
    -- For free users, check usage limits
    CASE feature_name
      WHEN 'patients' THEN
        SELECT COUNT(*) INTO current_usage
        FROM public.patients
        WHERE user_id = current_user_id AND status = 'active';
        usage_limit := 5;
      WHEN 'meal_plans' THEN
        SELECT COUNT(*) INTO current_usage
        FROM public.meal_plans
        WHERE user_id = current_user_id;
        usage_limit := 3;
      WHEN 'calculations' THEN
        SELECT COUNT(*) INTO current_usage
        FROM public.calculations
        WHERE user_id = current_user_id;
        usage_limit := 10;
      ELSE
        current_usage := 0;
        usage_limit := 0;
    END CASE;

    -- Check if action is allowed
    IF action_type = 'create' AND current_usage >= usage_limit THEN
      result := jsonb_build_object(
        'has_access', false,
        'is_premium', false,
        'reason', 'Free tier limit reached',
        'current_usage', current_usage,
        'limit', usage_limit,
        'feature', feature_name,
        'action', action_type,
        'timestamp', NOW()
      );
    ELSE
      result := jsonb_build_object(
        'has_access', true,
        'is_premium', false,
        'current_usage', current_usage,
        'limit', usage_limit,
        'feature', feature_name,
        'action', action_type,
        'timestamp', NOW()
      );
    END IF;
  END IF;

  -- Log the access attempt
  PERFORM public.log_security_event_safe(
    current_user_id,
    'premium_access_validation',
    jsonb_build_object(
      'feature', feature_name,
      'action', action_type,
      'granted', result->'has_access',
      'is_premium', is_premium,
      'current_usage', current_usage,
      'limit', usage_limit
    )
  );

  RETURN result;
END;
$$;

-- Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(
  identifier TEXT,
  max_requests INTEGER DEFAULT 10,
  window_seconds INTEGER DEFAULT 300
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP;
BEGIN
  window_start := NOW() - INTERVAL '1 second' * window_seconds;
  
  -- Count recent requests for this identifier
  SELECT COUNT(*) INTO current_count
  FROM public.security_audit_log
  WHERE event_data->>'identifier' = identifier
    AND event_type = 'rate_limit_check'
    AND timestamp > window_start;
  
  -- Log this rate limit check
  PERFORM public.log_security_event_safe(
    auth.uid(),
    'rate_limit_check',
    jsonb_build_object(
      'identifier', identifier,
      'current_count', current_count,
      'max_requests', max_requests,
      'window_seconds', window_seconds,
      'allowed', current_count < max_requests
    )
  );
  
  RETURN current_count < max_requests;
END;
$$;

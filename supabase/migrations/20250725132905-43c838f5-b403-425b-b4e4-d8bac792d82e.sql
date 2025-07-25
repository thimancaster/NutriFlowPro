
-- Fix database function search paths for security
-- This prevents search path manipulation attacks

-- Update search_foods_secure function with proper search path
CREATE OR REPLACE FUNCTION public.search_foods_secure(search_query text, search_category text DEFAULT NULL::text, search_limit integer DEFAULT 20)
RETURNS TABLE(id uuid, name text, category text, calories_per_100g numeric, protein_per_100g numeric, carbs_per_100g numeric, fat_per_100g numeric, portion_size numeric, portion_unit text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Validar parâmetros de entrada
  IF LENGTH(search_query) < 2 OR LENGTH(search_query) > 100 THEN
    RAISE EXCEPTION 'Query de busca deve ter entre 2 e 100 caracteres';
  END IF;
  
  search_limit := LEAST(GREATEST(search_limit, 1), 100);
  
  -- Log da busca para auditoria
  PERFORM public.log_security_event_safe(
    auth.uid(),
    'food_search',
    jsonb_build_object(
      'query', search_query,
      'category', search_category,
      'limit', search_limit
    )
  );
  
  -- Busca parametrizada segura
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.category,
    f.calories,
    f.protein,
    f.carbs,
    f.fats,
    f.portion_size,
    f.portion_unit
  FROM public.foods f
  WHERE f.name ILIKE '%' || search_query || '%'
    AND (search_category IS NULL OR f.category = search_category)
  ORDER BY f.name
  LIMIT search_limit;
END;
$$;

-- Update validate_premium_access_secure function with proper search path
CREATE OR REPLACE FUNCTION public.validate_premium_access_secure(feature_name text, action_type text DEFAULT 'read'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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
  IF public.is_admin_user() THEN
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

-- Update check_premium_access_secure function with proper search path
CREATE OR REPLACE FUNCTION public.check_premium_access_secure(feature_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  is_premium BOOLEAN := FALSE;
  current_user_id UUID := auth.uid();
BEGIN
  -- Verificar se usuário tem acesso premium
  SELECT COALESCE(subscribers.is_premium, FALSE) INTO is_premium
  FROM public.subscribers
  WHERE subscribers.user_id = current_user_id
    AND payment_status = 'active'
    AND (subscription_end IS NULL OR subscription_end > NOW())
  LIMIT 1;
  
  -- Check if user is admin
  IF public.is_admin_user() THEN
    is_premium := TRUE;
  END IF;
  
  -- Log da tentativa de acesso
  PERFORM public.log_security_event_safe(
    current_user_id,
    'premium_access_check',
    jsonb_build_object(
      'feature', feature_name,
      'granted', is_premium
    )
  );
  
  RETURN jsonb_build_object(
    'has_access', is_premium,
    'feature', feature_name,
    'timestamp', NOW()
  );
END;
$$;

-- Update check_rate_limit_secure function with proper search path
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(identifier text, max_requests integer DEFAULT 10, window_seconds integer DEFAULT 300)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
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

-- Enhanced is_admin_user function with better security
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  user_email TEXT;
  admin_role TEXT;
BEGIN
  -- Get current user email
  SELECT email INTO user_email
  FROM auth.users 
  WHERE id = auth.uid();
  
  -- Check if user has admin role in subscribers table
  SELECT role INTO admin_role
  FROM public.subscribers
  WHERE user_id = auth.uid() AND role = 'admin';
  
  -- Return true if user has admin role or is a developer
  RETURN (admin_role = 'admin') OR 
         (user_email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com'));
END;
$$;

-- Create enhanced admin role management
CREATE OR REPLACE FUNCTION public.set_user_admin_role(target_user_id UUID, is_admin BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  -- Only existing admins can set admin roles
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required';
  END IF;
  
  -- Update or insert subscriber record with admin role
  INSERT INTO public.subscribers (user_id, email, role, is_premium)
  SELECT target_user_id, 
         (SELECT email FROM auth.users WHERE id = target_user_id),
         CASE WHEN is_admin THEN 'admin' ELSE 'user' END,
         is_admin
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = CASE WHEN is_admin THEN 'admin' ELSE 'user' END,
    is_premium = is_admin,
    updated_at = NOW();
  
  -- Log the admin role change
  PERFORM public.log_security_event_safe(
    auth.uid(),
    'admin_role_change',
    jsonb_build_object(
      'target_user_id', target_user_id,
      'is_admin', is_admin,
      'changed_by', auth.uid()
    )
  );
END;
$$;

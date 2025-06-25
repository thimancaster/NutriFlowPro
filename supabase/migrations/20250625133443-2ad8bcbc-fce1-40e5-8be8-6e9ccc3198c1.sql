
-- Fix search_path security warnings for all PostgreSQL functions
-- This prevents potential security vulnerabilities from search_path manipulation

-- 1. Fix validate_patient_data function
CREATE OR REPLACE FUNCTION public.validate_patient_data(p_name text, p_email text DEFAULT NULL::text, p_phone text DEFAULT NULL::text, p_cpf text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  result JSONB := '{"isValid": true, "errors": {}}'::JSONB;
  errors JSONB := '{}'::JSONB;
BEGIN
  -- Validate name
  IF p_name IS NULL OR LENGTH(TRIM(p_name)) < 3 THEN
    errors := errors || '{"name": "Nome deve ter pelo menos 3 caracteres"}'::JSONB;
  END IF;
  
  -- Validate email if provided
  IF p_email IS NOT NULL AND p_email != '' THEN
    IF p_email !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
      errors := errors || '{"email": "E-mail inválido"}'::JSONB;
    END IF;
  END IF;
  
  -- Validate phone if provided
  IF p_phone IS NOT NULL AND p_phone != '' THEN
    IF p_phone !~ '^\(\d{2}\) \d{5}-\d{4}$' THEN
      errors := errors || '{"phone": "Telefone inválido: Use o formato (XX) XXXXX-XXXX"}'::JSONB;
    END IF;
  END IF;
  
  -- Validate CPF if provided
  IF p_cpf IS NOT NULL AND p_cpf != '' THEN
    -- Basic CPF format validation
    IF p_cpf !~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$' AND p_cpf !~ '^\d{11}$' THEN
      errors := errors || '{"cpf": "CPF inválido: Use o formato XXX.XXX.XXX-XX"}'::JSONB;
    END IF;
  END IF;
  
  -- Set result
  IF jsonb_object_keys(errors) IS NOT NULL THEN
    result := jsonb_build_object('isValid', false, 'errors', errors);
  END IF;
  
  RETURN result;
END;
$function$;

-- 2. Fix check_premium_quota function
CREATE OR REPLACE FUNCTION public.check_premium_quota(p_user_id uuid, p_feature text, p_action text DEFAULT 'create'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
  is_premium BOOLEAN := FALSE;
  current_count INTEGER := 0;
  limit_count INTEGER := 5; -- Default free tier limit
  result JSONB;
BEGIN
  -- Check if user is premium
  SELECT COALESCE(subscribers.is_premium, FALSE) INTO is_premium
  FROM public.subscribers
  WHERE subscribers.user_id = p_user_id
  LIMIT 1;
  
  -- If premium, allow unlimited access
  IF is_premium THEN
    RETURN jsonb_build_object(
      'canAccess', true,
      'isPremium', true,
      'currentUsage', 0,
      'limit', 'unlimited'
    );
  END IF;
  
  -- Check current usage for free tier
  IF p_feature = 'patients' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.patients
    WHERE user_id = p_user_id AND status = 'active';
    limit_count := 5;
  ELSIF p_feature = 'meal_plans' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.meal_plans
    WHERE user_id = p_user_id;
    limit_count := 3;
  ELSIF p_feature = 'calculations' THEN
    SELECT COUNT(*) INTO current_count
    FROM public.calculations
    WHERE user_id = p_user_id;
    limit_count := 10;
  END IF;
  
  -- Check if user can perform the action
  IF p_action = 'create' THEN
    result := jsonb_build_object(
      'canAccess', current_count < limit_count,
      'isPremium', false,
      'currentUsage', current_count,
      'limit', limit_count,
      'reason', CASE WHEN current_count >= limit_count THEN 'Limite da versão gratuita atingido' ELSE NULL END
    );
  ELSE
    result := jsonb_build_object(
      'canAccess', true,
      'isPremium', false,
      'currentUsage', current_count,
      'limit', limit_count
    );
  END IF;
  
  RETURN result;
END;
$function$;

-- 3. Fix log_security_event function
CREATE OR REPLACE FUNCTION public.log_security_event(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  -- For now, just log to a simple table structure
  -- In production, you might want a dedicated audit table
  INSERT INTO public.user_settings (user_id, settings)
  VALUES (
    p_user_id,
    jsonb_build_object(
      'audit_log',
      jsonb_build_object(
        'event_type', p_event_type,
        'event_data', p_event_data,
        'ip_address', p_ip_address,
        'user_agent', p_user_agent,
        'timestamp', NOW()
      )
    )
  )
  ON CONFLICT (user_id) DO UPDATE SET
    settings = user_settings.settings || jsonb_build_object(
      'last_audit_event',
      jsonb_build_object(
        'event_type', p_event_type,
        'event_data', p_event_data,
        'ip_address', p_ip_address,
        'user_agent', p_user_agent,
        'timestamp', NOW()
      )
    ),
    updated_at = NOW();
END;
$function$;

-- 4. Fix log_security_event_safe function
CREATE OR REPLACE FUNCTION public.log_security_event_safe(p_user_id uuid, p_event_type text, p_event_data jsonb DEFAULT '{}'::jsonb, p_ip_address text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent,
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falha silenciosa para não quebrar funcionalidade principal
    NULL;
END;
$function$;

-- 5. Fix search_foods_secure function
CREATE OR REPLACE FUNCTION public.search_foods_secure(search_query text, search_category text DEFAULT NULL::text, search_limit integer DEFAULT 20)
 RETURNS TABLE(id uuid, name text, category text, calories_per_100g numeric, protein_per_100g numeric, carbs_per_100g numeric, fat_per_100g numeric, portion_size numeric, portion_unit text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- 6. Fix check_premium_access_secure function
CREATE OR REPLACE FUNCTION public.check_premium_access_secure(feature_name text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- 7. Fix validate_premium_access_secure function
CREATE OR REPLACE FUNCTION public.validate_premium_access_secure(feature_name text, action_type text DEFAULT 'read'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- 8. Fix check_rate_limit_secure function
CREATE OR REPLACE FUNCTION public.check_rate_limit_secure(identifier text, max_requests integer DEFAULT 10, window_seconds integer DEFAULT 300)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
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
$function$;

-- 9. Fix trigger functions
CREATE OR REPLACE FUNCTION public.update_appointments_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_consultation_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    SELECT COALESCE(MAX(consultation_number), 0) + 1 
    INTO NEW.consultation_number
    FROM calculation_history 
    WHERE patient_id = NEW.patient_id;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_calculation_auto_save()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.last_auto_save = NOW();
    RETURN NEW;
END;
$function$;

-- 10. Fix meal plan and trigger functions
CREATE OR REPLACE FUNCTION public.recalculate_meal_plan_totals(p_meal_plan_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    v_total_calories NUMERIC := 0;
    v_total_protein NUMERIC := 0;
    v_total_carbs NUMERIC := 0;
    v_total_fats NUMERIC := 0;
BEGIN
    SELECT 
        COALESCE(SUM(calories), 0),
        COALESCE(SUM(protein), 0),
        COALESCE(SUM(carbs), 0),
        COALESCE(SUM(fats), 0)
    INTO v_total_calories, v_total_protein, v_total_carbs, v_total_fats
    FROM public.meal_plan_items
    WHERE meal_plan_id = p_meal_plan_id;

    UPDATE public.meal_plans 
    SET 
        total_calories = v_total_calories,
        total_protein = v_total_protein,
        total_carbs = v_total_carbs,
        total_fats = v_total_fats,
        updated_at = NOW()
    WHERE id = p_meal_plan_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_recalculate_meal_plan()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.recalculate_meal_plan_totals(OLD.meal_plan_id);
        RETURN OLD;
    ELSE
        PERFORM public.recalculate_meal_plan_totals(NEW.meal_plan_id);
        RETURN NEW;
    END IF;
END;
$function$;

-- 11. Fix admin and user functions
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_premium_safe(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    is_premium_user BOOLEAN := FALSE;
BEGIN
    SELECT COALESCE(is_premium, FALSE) INTO is_premium_user
    FROM subscribers
    WHERE subscribers.user_id = is_user_premium_safe.user_id
    LIMIT 1;
    
    RETURN COALESCE(is_premium_user, FALSE);
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_user_premium(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN is_user_premium_safe(user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_user_premium_status(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    -- Check if user exists in subscribers with premium status
    IF EXISTS (
        SELECT 1 FROM public.subscribers 
        WHERE subscribers.user_id = $1 
        AND is_premium = true
        AND payment_status = 'active'
        AND (subscription_end IS NULL OR subscription_end > NOW())
    ) THEN
        RETURN true;
    END IF;
    
    -- Check if user is developer/admin
    IF EXISTS (
        SELECT 1 FROM auth.users au 
        WHERE au.id = $1
        AND au.email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
    ) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$function$;

-- 12. Fix role and subscription functions
CREATE OR REPLACE FUNCTION public.get_user_role_safe(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM subscribers
    WHERE subscribers.user_id = get_user_role_safe.user_id
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'user');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'user';
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN get_user_role_safe(user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_subscription_status_safe(user_id uuid)
 RETURNS TABLE(is_premium boolean, role text, email text, stripe_customer_id text, subscription_start timestamp with time zone, subscription_end timestamp with time zone, payment_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(subscribers.is_premium, FALSE) as is_premium,
        COALESCE(subscribers.role, 'user') as role,
        subscribers.email,
        subscribers.stripe_customer_id,
        subscribers.subscription_start,
        subscribers.subscription_end,
        COALESCE(subscribers.payment_status, 'none') as payment_status
    FROM subscribers
    WHERE subscribers.user_id = get_subscription_status_safe.user_id
    LIMIT 1;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            FALSE as is_premium,
            'user' as role,
            NULL::TEXT as email,
            NULL::TEXT as stripe_customer_id,
            NULL::TIMESTAMPTZ as subscription_start,
            NULL::TIMESTAMPTZ as subscription_end,
            'none' as payment_status;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_subscription_status(user_id uuid)
 RETURNS TABLE(is_premium boolean, role text, email text, stripe_customer_id text, subscription_start timestamp with time zone, subscription_end timestamp with time zone, payment_status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN QUERY SELECT * FROM get_subscription_status_safe(user_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_subscriber_by_customer_id_safe(customer_id text)
 RETURNS TABLE(user_id uuid, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        subscribers.user_id,
        subscribers.email
    FROM subscribers
    WHERE subscribers.stripe_customer_id = customer_id
    LIMIT 1;
EXCEPTION
    WHEN OTHERS THEN
        RETURN QUERY SELECT 
            NULL::UUID as user_id,
            NULL::TEXT as email;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_subscriber_by_customer_id(customer_id text)
 RETURNS TABLE(user_id uuid, email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    RETURN QUERY SELECT * FROM get_subscriber_by_customer_id_safe(customer_id);
END;
$function$;

-- 13. Fix subscriber management functions
CREATE OR REPLACE FUNCTION public.upsert_subscriber_safe(p_user_id uuid, p_email text, p_stripe_customer_id text DEFAULT NULL::text, p_stripe_subscription_id text DEFAULT NULL::text, p_is_premium boolean DEFAULT false, p_role text DEFAULT 'user'::text, p_payment_status text DEFAULT 'none'::text, p_subscription_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_subscription_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    INSERT INTO subscribers (
        user_id,
        email,
        stripe_customer_id,
        stripe_subscription_id,
        is_premium,
        role,
        payment_status,
        subscription_start,
        subscription_end,
        updated_at
    )
    VALUES (
        p_user_id,
        p_email,
        p_stripe_customer_id,
        p_stripe_subscription_id,
        p_is_premium,
        p_role,
        p_payment_status,
        p_subscription_start,
        p_subscription_end,
        NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        email = EXCLUDED.email,
        stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, subscribers.stripe_customer_id),
        stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, subscribers.stripe_subscription_id),
        is_premium = EXCLUDED.is_premium,
        role = EXCLUDED.role,
        payment_status = EXCLUDED.payment_status,
        subscription_start = COALESCE(EXCLUDED.subscription_start, subscribers.subscription_start),
        subscription_end = EXCLUDED.subscription_end,
        updated_at = NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to upsert subscriber: %', SQLERRM;
END;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_subscriber(p_user_id uuid, p_email text, p_stripe_customer_id text DEFAULT NULL::text, p_stripe_subscription_id text DEFAULT NULL::text, p_is_premium boolean DEFAULT false, p_role text DEFAULT 'user'::text, p_payment_status text DEFAULT 'none'::text, p_subscription_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_subscription_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    PERFORM upsert_subscriber_safe(
        p_user_id, p_email, p_stripe_customer_id, p_stripe_subscription_id,
        p_is_premium, p_role, p_payment_status, p_subscription_start, p_subscription_end
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_subscribers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public, pg_temp
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

-- 14. Fix subscription management function
CREATE OR REPLACE FUNCTION public.update_subscription_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
    -- Mark event as processed
    NEW.processed_at := NOW();
    
    -- Handle different event types
    IF NEW.event_type = 'checkout.session.completed' THEN
        -- Extract customer and subscription IDs
        UPDATE public.subscribers
        SET 
            stripe_customer_id = NEW.event_data->'data'->'object'->'customer',
            payment_status = 'active',
            is_premium = TRUE,
            role = 'premium',
            subscription_start = NOW(),
            subscription_end = NULL,
            updated_at = NOW()
        WHERE user_id = (
            SELECT user_id FROM public.subscribers 
            WHERE email = NEW.event_data->'data'->'object'->'customer_details'->'email'
        );
    ELSIF NEW.event_type = 'customer.subscription.deleted' OR NEW.event_type = 'customer.subscription.updated' THEN
        -- Handle cancellation or update
        IF NEW.event_data->'data'->'object'->'status' = '"canceled"' OR 
           NEW.event_data->'data'->'object'->'status' = '"unpaid"' OR 
           NEW.event_data->'data'->'object'->'cancel_at_period_end' = 'true' THEN
            UPDATE public.subscribers
            SET 
                is_premium = FALSE,
                role = 'user',
                payment_status = 'canceled',
                subscription_end = to_timestamp((NEW.event_data->'data'->'object'->'canceled_at')::text::numeric),
                updated_at = NOW()
            WHERE stripe_customer_id = NEW.event_data->'data'->'object'->'customer';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$function$;

-- 15. Fix generate_meal_plan function (large function - keeping it comprehensive)
CREATE OR REPLACE FUNCTION public.generate_meal_plan(p_user_id uuid, p_patient_id uuid, p_target_calories numeric, p_target_protein numeric, p_target_carbs numeric, p_target_fats numeric, p_date text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
DECLARE
    v_meal_plan_id UUID;
    v_date DATE;
    v_meal_types TEXT[] := ARRAY['breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner', 'evening_snack'];
    v_meal_names TEXT[] := ARRAY['Café da manhã', 'Lanche da manhã', 'Almoço', 'Lanche da tarde', 'Jantar', 'Ceia'];
    v_meal_distributions NUMERIC[] := ARRAY[0.25, 0.10, 0.30, 0.10, 0.20, 0.05]; -- Meal distribution percentages
    v_meal_type TEXT;
    v_meal_name TEXT;
    v_meal_distribution NUMERIC;
    v_meal_calories NUMERIC;
    v_meal_protein NUMERIC;
    v_meal_carbs NUMERIC;
    v_meal_fats NUMERIC;
    v_sample_foods UUID[];
    v_food_id UUID;
    v_food_name TEXT;
    v_food_portion NUMERIC;
    v_food_unit TEXT;
    v_food_calories NUMERIC;
    v_food_protein NUMERIC;
    v_food_carbs NUMERIC;
    v_food_fats NUMERIC;
    v_meals_json JSONB := '[]'::jsonb;
    v_meal_json JSONB;
    v_foods_array JSONB := '[]'::jsonb;
    v_food_json JSONB;
BEGIN
    -- Set date (use provided date or current date)
    IF p_date IS NULL THEN
        v_date := CURRENT_DATE;
    ELSE
        v_date := p_date::DATE;
    END IF;

    -- Generate UUID for meal plan
    v_meal_plan_id := gen_random_uuid();

    -- Create the meal plan record first (without meals JSON initially)
    INSERT INTO public.meal_plans (
        id,
        user_id,
        patient_id,
        date,
        meals,
        total_calories,
        total_protein,
        total_carbs,
        total_fats,
        day_of_week,
        created_at,
        updated_at
    ) VALUES (
        v_meal_plan_id,
        p_user_id,
        p_patient_id,
        v_date,
        '[]'::jsonb, -- Start with empty meals array
        p_target_calories,
        p_target_protein,
        p_target_carbs,
        p_target_fats,
        EXTRACT(DOW FROM v_date)::INTEGER,
        NOW(),
        NOW()
    );

    -- Generate meal plan items for each meal type and build JSON structure
    FOR i IN 1..array_length(v_meal_types, 1) LOOP
        v_meal_type := v_meal_types[i];
        v_meal_name := v_meal_names[i];
        v_meal_distribution := v_meal_distributions[i];
        
        -- Calculate macros for this meal
        v_meal_calories := ROUND(p_target_calories * v_meal_distribution);
        v_meal_protein := ROUND(p_target_protein * v_meal_distribution);
        v_meal_carbs := ROUND(p_target_carbs * v_meal_distribution);
        v_meal_fats := ROUND(p_target_fats * v_meal_distribution);

        -- Reset foods array for this meal
        v_foods_array := '[]'::jsonb;

        -- Get sample foods for this meal time (or general foods if none specific)
        SELECT ARRAY_AGG(id) INTO v_sample_foods
        FROM (
            SELECT id 
            FROM public.foods 
            WHERE v_meal_type = ANY(meal_time) OR 'any' = ANY(meal_time)
            ORDER BY RANDOM()
            LIMIT 3
        ) sample_foods;

        -- If no specific foods found, get general foods
        IF v_sample_foods IS NULL OR array_length(v_sample_foods, 1) = 0 THEN
            SELECT ARRAY_AGG(id) INTO v_sample_foods
            FROM (
                SELECT id 
                FROM public.foods 
                ORDER BY RANDOM()
                LIMIT 3
            ) sample_foods;
        END IF;

        -- Create meal plan items for this meal
        IF v_sample_foods IS NOT NULL AND array_length(v_sample_foods, 1) > 0 THEN
            FOR j IN 1..LEAST(array_length(v_sample_foods, 1), 3) LOOP
                v_food_id := v_sample_foods[j];
                
                -- Get food details
                SELECT name, portion_size, portion_unit, calories, protein, carbs, fats
                INTO v_food_name, v_food_portion, v_food_unit, v_food_calories, v_food_protein, v_food_carbs, v_food_fats
                FROM public.foods
                WHERE id = v_food_id;

                -- Calculate appropriate portion based on meal calories
                -- This is a simplified calculation - in reality you'd want more sophisticated logic
                v_food_portion := CASE 
                    WHEN v_food_calories > 0 THEN ROUND((v_meal_calories / array_length(v_sample_foods, 1)) / v_food_calories * v_food_portion, 1)
                    ELSE v_food_portion
                END;

                -- Recalculate nutritional values based on adjusted portion
                v_meal_calories := ROUND(v_food_calories * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)));
                v_meal_protein := ROUND(v_food_protein * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);
                v_meal_carbs := ROUND(v_food_carbs * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);
                v_meal_fats := ROUND(v_food_fats * (v_food_portion / (SELECT portion_size FROM public.foods WHERE id = v_food_id)), 1);

                -- Insert meal plan item
                INSERT INTO public.meal_plan_items (
                    id,
                    meal_plan_id,
                    meal_type,
                    food_id,
                    food_name,
                    quantity,
                    unit,
                    calories,
                    protein,
                    carbs,
                    fats,
                    order_index,
                    created_at,
                    updated_at
                ) VALUES (
                    gen_random_uuid(),
                    v_meal_plan_id,
                    v_meal_type,
                    v_food_id,
                    v_food_name,
                    v_food_portion,
                    v_food_unit,
                    v_meal_calories,
                    v_meal_protein,
                    v_meal_carbs,
                    v_meal_fats,
                    j,
                    NOW(),
                    NOW()
                );

                -- Add food to JSON structure
                v_food_json := jsonb_build_object(
                    'id', gen_random_uuid(),
                    'food_id', v_food_id,
                    'name', v_food_name,
                    'quantity', v_food_portion,
                    'unit', v_food_unit,
                    'calories', v_meal_calories,
                    'protein', v_meal_protein,
                    'carbs', v_meal_carbs,
                    'fats', v_meal_fats,
                    'order_index', j
                );
                
                v_foods_array := v_foods_array || v_food_json;
            END LOOP;
        ELSE
            -- Create a placeholder item if no foods are found
            INSERT INTO public.meal_plan_items (
                id,
                meal_plan_id,
                meal_type,
                food_id,
                food_name,
                quantity,
                unit,
                calories,
                protein,
                carbs,
                fats,
                order_index,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                v_meal_plan_id,
                v_meal_type,
                NULL,
                'Alimento sugerido para ' || v_meal_name,
                100,
                'g',
                v_meal_calories,
                v_meal_protein,
                v_meal_carbs,
                v_meal_fats,
                1,
                NOW(),
                NOW()
            );

            -- Add placeholder food to JSON structure
            v_food_json := jsonb_build_object(
                'id', gen_random_uuid(),
                'food_id', NULL,
                'name', 'Alimento sugerido para ' || v_meal_name,
                'quantity', 100,
                'unit', 'g',
                'calories', v_meal_calories,
                'protein', v_meal_protein,
                'carbs', v_meal_carbs,
                'fats', v_meal_fats,
                'order_index', 1
            );
            
            v_foods_array := v_foods_array || v_food_json;
        END IF;

        -- Build meal JSON object
        v_meal_json := jsonb_build_object(
            'id', v_meal_type || '-meal',
            'type', v_meal_type,
            'name', v_meal_name,
            'foods', v_foods_array,
            'total_calories', v_meal_calories,
            'total_protein', v_meal_protein,
            'total_carbs', v_meal_carbs,
            'total_fats', v_meal_fats
        );

        -- Add meal to meals array
        v_meals_json := v_meals_json || v_meal_json;
    END LOOP;

    -- Update the meal plan record with the complete meals JSON
    UPDATE public.meal_plans 
    SET 
        meals = v_meals_json,
        updated_at = NOW()
    WHERE id = v_meal_plan_id;

    -- Return the meal plan ID
    RETURN v_meal_plan_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        RAISE EXCEPTION 'Error generating meal plan: %', SQLERRM;
END;
$function$;

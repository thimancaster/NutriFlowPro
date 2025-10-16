-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy: Users can view their own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- RLS policy: Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update is_admin_user function to use role table
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Update security_audit_log policies to use role-based checks
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.security_audit_log;
CREATE POLICY "Admins can view all audit logs"
  ON public.security_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Update stripe_events policies
DROP POLICY IF EXISTS "Admins only can manage stripe events" ON public.stripe_events;
CREATE POLICY "Admins can manage stripe events"
  ON public.stripe_events
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Update subscribers policies
DROP POLICY IF EXISTS "Admins can manage subscribers" ON public.subscribers;
CREATE POLICY "Admins can manage subscribers"
  ON public.subscribers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policies to users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.users
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Implement server-side patient validation
CREATE OR REPLACE FUNCTION public.validate_patient_data(
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_cpf TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  result JSONB := '{"isValid": true, "errors": {}}'::JSONB;
  errors JSONB := '{}'::JSONB;
BEGIN
  -- Validate name
  IF p_name IS NULL OR LENGTH(TRIM(p_name)) < 3 THEN
    errors := errors || '{"name": "Nome deve ter pelo menos 3 caracteres"}'::JSONB;
  END IF;
  
  IF LENGTH(TRIM(p_name)) > 255 THEN
    errors := errors || '{"name": "Nome não pode exceder 255 caracteres"}'::JSONB;
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
$$;

-- Create trigger function for patient validation
CREATE OR REPLACE FUNCTION public.validate_patient_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  validation_result JSONB;
BEGIN
  validation_result := public.validate_patient_data(NEW.name, NEW.email, NEW.phone, NEW.cpf);
  
  IF NOT (validation_result->>'isValid')::BOOLEAN THEN
    RAISE EXCEPTION 'Invalid patient data: %', validation_result->>'errors';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for patient validation
DROP TRIGGER IF EXISTS validate_patient_before_insert ON public.patients;
CREATE TRIGGER validate_patient_before_insert
  BEFORE INSERT OR UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_patient_trigger();

-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.check_premium_access_secure(feature_name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  is_premium BOOLEAN := FALSE;
  current_user_id UUID := auth.uid();
BEGIN
  SELECT COALESCE(subscribers.is_premium, FALSE) INTO is_premium
  FROM public.subscribers
  WHERE subscribers.user_id = current_user_id
    AND payment_status = 'active'
    AND (subscription_end IS NULL OR subscription_end > NOW())
  LIMIT 1;
  
  IF public.is_admin_user() THEN
    is_premium := TRUE;
  END IF;
  
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

-- Migrate existing admin users to role table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email IN ('thimancaster@hotmail.com', 'thiago@nutriflowpro.com')
ON CONFLICT (user_id, role) DO NOTHING;
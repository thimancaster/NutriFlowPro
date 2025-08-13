
-- Create calculation_attempts table to track user calculation usage
CREATE TABLE IF NOT EXISTS public.calculation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  calculation_data JSONB NOT NULL DEFAULT '{}',
  attempt_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_successful BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_calculation_attempts_user_id ON calculation_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_calculation_attempts_date ON calculation_attempts(attempt_date);

-- Enable RLS
ALTER TABLE calculation_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own calculation attempts" ON calculation_attempts
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own calculation attempts" ON calculation_attempts
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Function to register calculation attempt and check quota
CREATE OR REPLACE FUNCTION public.register_calculation_attempt(
  p_patient_id UUID DEFAULT NULL,
  p_calculation_data JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_premium BOOLEAN := FALSE;
  attempt_count INTEGER := 0;
  max_free_attempts INTEGER := 10;
  result JSONB;
BEGIN
  -- Validate user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated',
      'quota_exceeded', false
    );
  END IF;

  -- Check if user is premium
  SELECT COALESCE(check_user_premium_status(current_user_id), FALSE) INTO is_premium;

  -- For premium users, allow unlimited attempts
  IF is_premium THEN
    -- Insert attempt record
    INSERT INTO calculation_attempts (user_id, patient_id, calculation_data)
    VALUES (current_user_id, p_patient_id, p_calculation_data);
    
    RETURN jsonb_build_object(
      'success', true,
      'is_premium', true,
      'attempts_used', 0,
      'attempts_remaining', 'unlimited',
      'quota_exceeded', false
    );
  END IF;

  -- For free users, check quota
  SELECT COUNT(*) INTO attempt_count
  FROM calculation_attempts
  WHERE user_id = current_user_id
    AND attempt_date >= CURRENT_DATE - INTERVAL '30 days';

  -- Check if quota exceeded
  IF attempt_count >= max_free_attempts THEN
    RETURN jsonb_build_object(
      'success', false,
      'is_premium', false,
      'attempts_used', attempt_count,
      'attempts_remaining', 0,
      'quota_exceeded', true,
      'error', 'Free calculation limit reached. Upgrade to premium for unlimited calculations.'
    );
  END IF;

  -- Register the attempt
  INSERT INTO calculation_attempts (user_id, patient_id, calculation_data)
  VALUES (current_user_id, p_patient_id, p_calculation_data);

  RETURN jsonb_build_object(
    'success', true,
    'is_premium', false,
    'attempts_used', attempt_count + 1,
    'attempts_remaining', max_free_attempts - (attempt_count + 1),
    'quota_exceeded', false
  );
END;
$$;

-- Function to get current calculation quota status
CREATE OR REPLACE FUNCTION public.get_calculation_quota_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  is_premium BOOLEAN := FALSE;
  attempt_count INTEGER := 0;
  max_free_attempts INTEGER := 10;
BEGIN
  -- Validate user is authenticated
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'is_premium', false,
      'attempts_used', 0,
      'attempts_remaining', 0,
      'quota_exceeded', true,
      'error', 'User not authenticated'
    );
  END IF;

  -- Check if user is premium
  SELECT COALESCE(check_user_premium_status(current_user_id), FALSE) INTO is_premium;

  -- For premium users
  IF is_premium THEN
    RETURN jsonb_build_object(
      'is_premium', true,
      'attempts_used', 0,
      'attempts_remaining', 'unlimited',
      'quota_exceeded', false
    );
  END IF;

  -- For free users, get current usage
  SELECT COUNT(*) INTO attempt_count
  FROM calculation_attempts
  WHERE user_id = current_user_id
    AND attempt_date >= CURRENT_DATE - INTERVAL '30 days';

  RETURN jsonb_build_object(
    'is_premium', false,
    'attempts_used', attempt_count,
    'attempts_remaining', GREATEST(0, max_free_attempts - attempt_count),
    'quota_exceeded', attempt_count >= max_free_attempts
  );
END;
$$;

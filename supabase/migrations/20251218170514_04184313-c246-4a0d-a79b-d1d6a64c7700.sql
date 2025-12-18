-- Add RLS policies to enforce premium access server-side
-- This ensures premium features are protected at the database level, not just client-side

-- Helper function to check if user has premium access
CREATE OR REPLACE FUNCTION public.user_has_premium_access()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM subscribers
    WHERE user_id = auth.uid()
      AND is_premium = true
      AND (subscription_end IS NULL OR subscription_end > now())
  );
$$;

-- Free tier limits
-- Patients: 5 active patients
-- Meal plans: 3 total
-- Calculations: 10 total

-- Function to count user's active patients
CREATE OR REPLACE FUNCTION public.count_user_active_patients()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM patients
  WHERE user_id = auth.uid() AND status = 'active';
$$;

-- Function to count user's meal plans
CREATE OR REPLACE FUNCTION public.count_user_meal_plans()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM meal_plans
  WHERE user_id = auth.uid();
$$;

-- Function to count user's calculations
CREATE OR REPLACE FUNCTION public.count_user_calculations()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM calculations
  WHERE user_id = auth.uid();
$$;

-- Drop existing permissive insert policies for patients, meal_plans, calculations
DROP POLICY IF EXISTS "Users can create their own patients" ON patients;
DROP POLICY IF EXISTS "Users can insert their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can insert their own calculations" ON calculations;

-- New INSERT policy for patients with premium check
CREATE POLICY "Users can create patients with quota check"
ON patients FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_has_premium_access()
    OR count_user_active_patients() < 5
  )
);

-- New INSERT policy for meal_plans with premium check
CREATE POLICY "Users can create meal plans with quota check"
ON meal_plans FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_has_premium_access()
    OR count_user_meal_plans() < 3
  )
);

-- New INSERT policy for calculations with premium check
CREATE POLICY "Users can create calculations with quota check"
ON calculations FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND (
    user_has_premium_access()
    OR count_user_calculations() < 10
  )
);
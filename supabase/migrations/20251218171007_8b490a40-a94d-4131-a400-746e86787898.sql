-- Add explicit authentication checks to RLS policies for better security
-- This ensures auth.uid() IS NOT NULL before checking other conditions

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() IS NOT NULL AND (id = auth.uid() OR public.has_role(auth.uid(), 'admin')));

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() IS NOT NULL AND id = auth.uid());

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND id = auth.uid());

-- Patients table policies
DROP POLICY IF EXISTS "Users can view their own patients" ON patients;
DROP POLICY IF EXISTS "Users can update their own patients" ON patients;
DROP POLICY IF EXISTS "Users can delete their own patients" ON patients;

CREATE POLICY "Users can view their own patients"
ON patients FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own patients"
ON patients FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own patients"
ON patients FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- User settings table policies
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;

CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert their own settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Calculations table policies
DROP POLICY IF EXISTS "Users can view their own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can update their own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON calculations;

CREATE POLICY "Users can view their own calculations"
ON calculations FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own calculations"
ON calculations FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own calculations"
ON calculations FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Meal plans table policies
DROP POLICY IF EXISTS "Users can view their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can update their own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can delete their own meal plans" ON meal_plans;

CREATE POLICY "Users can view their own meal plans"
ON meal_plans FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own meal plans"
ON meal_plans FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own meal plans"
ON meal_plans FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Appointments table policies  
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can insert their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON appointments;

CREATE POLICY "Users can view their own appointments"
ON appointments FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own appointments"
ON appointments FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert their own appointments"
ON appointments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own appointments"
ON appointments FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Anthropometry table policies
DROP POLICY IF EXISTS "Users can view their own anthropometry" ON anthropometry;
DROP POLICY IF EXISTS "Users can insert their own anthropometry" ON anthropometry;
DROP POLICY IF EXISTS "Users can update their own anthropometry" ON anthropometry;
DROP POLICY IF EXISTS "Users can delete their own anthropometry" ON anthropometry;

CREATE POLICY "Users can view their own anthropometry"
ON anthropometry FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert their own anthropometry"
ON anthropometry FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own anthropometry"
ON anthropometry FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own anthropometry"
ON anthropometry FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Measurements table policies
DROP POLICY IF EXISTS "Users can view their own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can insert their own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can update their own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can delete their own measurements" ON measurements;

CREATE POLICY "Users can view their own measurements"
ON measurements FOR SELECT
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can insert their own measurements"
ON measurements FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can update their own measurements"
ON measurements FOR UPDATE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can delete their own measurements"
ON measurements FOR DELETE
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());
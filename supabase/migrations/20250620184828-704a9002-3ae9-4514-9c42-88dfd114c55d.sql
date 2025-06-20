
-- Create appointment_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.appointment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default appointment types only if table is empty
INSERT INTO public.appointment_types (name, description, duration_minutes, color) 
SELECT * FROM (VALUES
  ('Consulta Inicial', 'Primeira consulta com avaliação completa', 90, '#10B981'),
  ('Retorno', 'Consulta de acompanhamento', 60, '#3B82F6'),
  ('Reavaliação', 'Reavaliação nutricional completa', 75, '#F59E0B'),
  ('Consulta Online', 'Consulta por videochamada', 45, '#8B5CF6'),
  ('Orientação Nutricional', 'Orientação específica sobre alimentação', 30, '#EF4444')
) AS v(name, description, duration_minutes, color)
WHERE NOT EXISTS (SELECT 1 FROM public.appointment_types LIMIT 1);

-- Enable RLS for appointment_types
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy for appointment_types
DROP POLICY IF EXISTS "All users can view appointment types" ON public.appointment_types;
CREATE POLICY "All users can view appointment types" 
  ON public.appointment_types 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Update appointments table to add missing columns and improve structure
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount NUMERIC,
ADD COLUMN IF NOT EXISTS patient_notes TEXT,
ADD COLUMN IF NOT EXISTS private_notes TEXT;

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones for appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

CREATE POLICY "Users can view their own appointments" 
  ON public.appointments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own appointments" 
  ON public.appointments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments" 
  ON public.appointments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments" 
  ON public.appointments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger for appointments if it doesn't exist
DROP TRIGGER IF EXISTS appointments_updated_at_trigger ON public.appointments;
DROP FUNCTION IF EXISTS update_appointments_updated_at();

CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at_trigger
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION update_appointments_updated_at();

-- Update user_settings table to include more professional settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_reminders": true,
  "sms_reminders": false,
  "appointment_confirmations": true,
  "payment_notifications": true,
  "marketing_emails": false
}'::jsonb,
ADD COLUMN IF NOT EXISTS business_settings JSONB DEFAULT '{
  "clinic_address": "",
  "clinic_phone": "",
  "clinic_website": "",
  "consultation_fee": 0,
  "payment_methods": ["cash", "card", "pix"],
  "cancellation_policy": "24h",
  "auto_confirm_appointments": false
}'::jsonb;

-- Enable RLS for user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and create new ones for user_settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create updated_at trigger for user_settings if it doesn't exist
DROP TRIGGER IF EXISTS user_settings_updated_at_trigger ON public.user_settings;
DROP FUNCTION IF EXISTS update_user_settings_updated_at();

CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_settings_updated_at_trigger
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

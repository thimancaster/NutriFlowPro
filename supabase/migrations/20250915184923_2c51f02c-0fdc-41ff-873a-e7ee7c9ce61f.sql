-- Create clinical_sessions table for unified clinical workflow
CREATE TABLE IF NOT EXISTS public.clinical_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
    session_type TEXT NOT NULL DEFAULT 'consultation' CHECK (session_type IN ('consultation', 'follow_up')),
    consultation_data JSONB NOT NULL DEFAULT '{}',
    nutritional_results JSONB DEFAULT '{}',
    meal_plan_draft JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.clinical_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own clinical sessions"
ON public.clinical_sessions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_clinical_sessions_patient_id ON public.clinical_sessions(patient_id);
CREATE INDEX idx_clinical_sessions_user_patient ON public.clinical_sessions(user_id, patient_id);
CREATE INDEX idx_clinical_sessions_created_at ON public.clinical_sessions(created_at DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_clinical_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_clinical_sessions_updated_at
    BEFORE UPDATE ON public.clinical_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_clinical_sessions_updated_at();
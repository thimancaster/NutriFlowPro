-- Adicionar campos para onboarding e testimonials na tabela user_settings
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS testimonial_reminder_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS testimonial_reminder_date TIMESTAMPTZ;

-- Criar índice para busca rápida de usuários que não completaram onboarding
CREATE INDEX IF NOT EXISTS idx_user_settings_onboarding 
ON user_settings(user_id) 
WHERE onboarding_completed = false;
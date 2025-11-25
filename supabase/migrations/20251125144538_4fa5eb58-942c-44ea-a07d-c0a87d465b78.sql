-- ============================================
-- MIGRATION: Patient Evolution Metrics Table
-- Tabela dedicada para rastreamento histórico de métricas de evolução
-- ============================================

-- Criar tabela de métricas de evolução
CREATE TABLE IF NOT EXISTS public.patient_evolution_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  calculation_id UUID REFERENCES public.calculation_history(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  
  -- Métricas de Composição Corporal
  weight NUMERIC NOT NULL,
  height NUMERIC,
  bmi NUMERIC,
  body_fat_percentage NUMERIC,
  lean_mass_percentage NUMERIC,
  muscle_mass_kg NUMERIC,
  water_percentage NUMERIC,
  
  -- Circunferências (cm)
  waist_circumference NUMERIC,
  hip_circumference NUMERIC,
  arm_circumference NUMERIC,
  thigh_circumference NUMERIC,
  
  -- Métricas Nutricionais (snapshot do cálculo)
  vet NUMERIC,
  tmb NUMERIC,
  get_value NUMERIC,
  protein_target_g NUMERIC,
  carbs_target_g NUMERIC,
  fat_target_g NUMERIC,
  
  -- Metadados
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_evolution_metrics_patient 
  ON public.patient_evolution_metrics(patient_id);
CREATE INDEX IF NOT EXISTS idx_evolution_metrics_date 
  ON public.patient_evolution_metrics(measurement_date DESC);
CREATE INDEX IF NOT EXISTS idx_evolution_metrics_user 
  ON public.patient_evolution_metrics(user_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_evolution_metrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evolution_metrics_updated_at
    BEFORE UPDATE ON public.patient_evolution_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_evolution_metrics_updated_at();

-- Habilitar RLS
ALTER TABLE public.patient_evolution_metrics ENABLE ROW LEVEL SECURITY;

-- Política RLS: Usuários podem gerenciar métricas de seus próprios pacientes
CREATE POLICY "Users can manage their patient evolution metrics"
  ON public.patient_evolution_metrics
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comentários para documentação
COMMENT ON TABLE public.patient_evolution_metrics IS 'Métricas históricas de evolução de pacientes para gráficos e análises';
COMMENT ON COLUMN public.patient_evolution_metrics.weight IS 'Peso em kg';
COMMENT ON COLUMN public.patient_evolution_metrics.bmi IS 'Índice de Massa Corporal calculado';
COMMENT ON COLUMN public.patient_evolution_metrics.vet IS 'Valor Energético Total (kcal/dia)';
COMMENT ON COLUMN public.patient_evolution_metrics.tmb IS 'Taxa Metabólica Basal (kcal/dia)';
COMMENT ON COLUMN public.patient_evolution_metrics.measurement_date IS 'Data da medição/consulta';
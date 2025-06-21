
-- Remove a coluna measurements da tabela patients
ALTER TABLE public.patients DROP COLUMN IF EXISTS measurements;

-- Verifica se a tabela anthropometry já existe com as colunas necessárias
-- Se não existir ou estiver incompleta, vamos garantir que tenha todas as colunas necessárias

-- Adiciona colunas que podem estar faltando na tabela anthropometry
ALTER TABLE public.anthropometry 
ADD COLUMN IF NOT EXISTS muscle_mass_percentage NUMERIC,
ADD COLUMN IF NOT EXISTS water_percentage NUMERIC;

-- Garantir que measurement_date seja chamado de 'date' na tabela anthropometry
-- (baseado no schema atual que já tem a coluna 'date')

-- Criar políticas RLS para a tabela anthropometry se não existirem
DROP POLICY IF EXISTS "Users can view their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can create their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can update their patients anthropometry" ON public.anthropometry;
DROP POLICY IF EXISTS "Users can delete their patients anthropometry" ON public.anthropometry;

-- Habilitar RLS na tabela anthropometry
ALTER TABLE public.anthropometry ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuário pode ver medições dos seus próprios pacientes
CREATE POLICY "Users can view their patients anthropometry" 
ON public.anthropometry FOR SELECT 
USING (
  user_id = auth.uid() OR 
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE user_id = auth.uid()
  )
);

-- Política para INSERT: usuário pode criar medições para seus próprios pacientes
CREATE POLICY "Users can create their patients anthropometry" 
ON public.anthropometry FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE user_id = auth.uid()
  )
);

-- Política para UPDATE: usuário pode atualizar medições dos seus próprios pacientes
CREATE POLICY "Users can update their patients anthropometry" 
ON public.anthropometry FOR UPDATE 
USING (
  user_id = auth.uid() AND
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE user_id = auth.uid()
  )
);

-- Política para DELETE: usuário pode deletar medições dos seus próprios pacientes
CREATE POLICY "Users can delete their patients anthropometry" 
ON public.anthropometry FOR DELETE 
USING (
  user_id = auth.uid() AND
  patient_id IN (
    SELECT id FROM public.patients 
    WHERE user_id = auth.uid()
  )
);

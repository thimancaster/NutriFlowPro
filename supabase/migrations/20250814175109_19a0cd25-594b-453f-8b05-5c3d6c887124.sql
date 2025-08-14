
-- Criar tabela ParametrosGETPlanilha para replicar exatamente a lógica da planilha
CREATE TABLE public.parametros_get_planilha (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  perfil TEXT NOT NULL, -- 'magro', 'obeso_sobrepeso', 'atleta_musculoso'
  sexo TEXT NOT NULL, -- 'masculino', 'feminino', 'ambos'
  tmb_base_valor NUMERIC NOT NULL, -- valor fixo da TMB conforme a planilha
  fa_valor NUMERIC NOT NULL, -- valor fixo do Fator de Atividade
  formula_tmb_detalhe TEXT NOT NULL, -- descrição da fórmula TMB
  formula_get_detalhe TEXT NOT NULL, -- descrição da fórmula GET
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir os parâmetros conforme a lógica da planilha
INSERT INTO public.parametros_get_planilha (perfil, sexo, tmb_base_valor, fa_valor, formula_tmb_detalhe, formula_get_detalhe)
VALUES
  -- PERFIL MAGROS - Harris-Benedict
  ('magro', 'feminino', 655, 1.6, '655 + (9.6 * peso) + (1.9 * altura) - (4.7 * idade)', 'TMB * 1.6'),
  ('magro', 'masculino', 66, 1.6, '66 + (13.8 * peso) + (5 * altura) - (6.8 * idade)', 'TMB * 1.6'),
  
  -- PERFIL OBESOS/SOBREPESO - Mifflin-St Jeor
  ('obeso_sobrepeso', 'feminino', -161, 1.5, '(10 * peso) + (6.25 * altura) - (5 * idade) - 161', 'TMB * 1.5'),
  ('obeso_sobrepeso', 'masculino', 5, 1.5, '(10 * peso) + (6.25 * altura) - (5 * idade) + 5', 'TMB * 1.5'),
  
  -- PERFIL ATLETAS/MUSCULOSOS - Fórmula específica
  ('atleta_musculoso', 'ambos', 10, 1.3, '24.8 * peso + 10', 'TMB * 1.3');

-- Adicionar RLS (Row Level Security)
ALTER TABLE public.parametros_get_planilha ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler parâmetros GET"
  ON public.parametros_get_planilha
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_parametros_get_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parametros_get_planilha_updated_at
    BEFORE UPDATE ON public.parametros_get_planilha
    FOR EACH ROW
    EXECUTE FUNCTION public.update_parametros_get_updated_at();

-- Atualizar tabela calculations para incluir superavit_deficit_calorico
ALTER TABLE public.calculations 
ADD COLUMN IF NOT EXISTS superavit_deficit_calorico NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS perfil_get TEXT DEFAULT 'magro',
ADD COLUMN IF NOT EXISTS vet NUMERIC;

-- Adicionar comentários para documentação
COMMENT ON TABLE public.parametros_get_planilha IS 'Tabela de parâmetros para cálculo de GET conforme planilha original';
COMMENT ON COLUMN public.parametros_get_planilha.perfil IS 'Perfil do usuário: magro, obeso_sobrepeso, atleta_musculoso';
COMMENT ON COLUMN public.parametros_get_planilha.sexo IS 'Sexo: masculino, feminino, ambos (para atletas)';
COMMENT ON COLUMN public.parametros_get_planilha.tmb_base_valor IS 'Valor base para cálculo TMB (655, 66, -161, 5, 10)';
COMMENT ON COLUMN public.parametros_get_planilha.fa_valor IS 'Fator de Atividade (1.6, 1.5, 1.3)';

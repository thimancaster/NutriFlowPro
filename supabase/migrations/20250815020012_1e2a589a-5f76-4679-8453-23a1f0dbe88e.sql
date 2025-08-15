
-- Fase 2: Sistema de Macronutrientes Diários
CREATE TABLE public.plano_nutricional_diario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL DEFAULT auth.uid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- VET base
  vet_kcal NUMERIC NOT NULL,
  
  -- Proteína (pode ser definida por g/kg ou g/dia)
  ptn_tipo_definicao TEXT NOT NULL DEFAULT 'g_kg' CHECK (ptn_tipo_definicao IN ('g_kg', 'g_dia')),
  ptn_valor NUMERIC NOT NULL, -- valor inserido pelo usuário
  ptn_g_dia NUMERIC NOT NULL, -- valor final em gramas/dia
  ptn_kcal NUMERIC NOT NULL, -- calorias da proteína (ptn_g_dia * 4)
  
  -- Lipídio (pode ser definido por g/kg ou g/dia)
  lip_tipo_definicao TEXT NOT NULL DEFAULT 'g_kg' CHECK (lip_tipo_definicao IN ('g_kg', 'g_dia')),
  lip_valor NUMERIC NOT NULL, -- valor inserido pelo usuário
  lip_g_dia NUMERIC NOT NULL, -- valor final em gramas/dia
  lip_kcal NUMERIC NOT NULL, -- calorias do lipídio (lip_g_dia * 9)
  
  -- Carboidrato (calculado automaticamente por diferença)
  cho_g_dia NUMERIC NOT NULL, -- (vet_kcal - ptn_kcal - lip_kcal) / 4
  cho_kcal NUMERIC NOT NULL, -- cho_g_dia * 4
  
  -- Percentuais calculados
  ptn_percentual NUMERIC NOT NULL, -- (ptn_kcal / vet_kcal) * 100
  lip_percentual NUMERIC NOT NULL, -- (lip_kcal / vet_kcal) * 100
  cho_percentual NUMERIC NOT NULL, -- (cho_kcal / vet_kcal) * 100
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fase 3: Sistema de 6 Refeições
CREATE TABLE public.refeicoes_distribuicao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plano_nutricional_id UUID REFERENCES public.plano_nutricional_diario(id) ON DELETE CASCADE,
  
  -- Identificação da refeição (1 a 6)
  numero_refeicao INTEGER NOT NULL CHECK (numero_refeicao BETWEEN 1 AND 6),
  nome_refeicao TEXT NOT NULL, -- 'Café da manhã', 'Lanche manhã', etc.
  horario_sugerido TIME,
  
  -- Distribuição percentual dos macros para esta refeição
  ptn_percentual NUMERIC NOT NULL DEFAULT 0 CHECK (ptn_percentual >= 0 AND ptn_percentual <= 100),
  lip_percentual NUMERIC NOT NULL DEFAULT 0 CHECK (lip_percentual >= 0 AND lip_percentual <= 100),
  cho_percentual NUMERIC NOT NULL DEFAULT 0 CHECK (cho_percentual >= 0 AND cho_percentual <= 100),
  
  -- Valores calculados em gramas para esta refeição
  ptn_g NUMERIC NOT NULL DEFAULT 0,
  lip_g NUMERIC NOT NULL DEFAULT 0,
  cho_g NUMERIC NOT NULL DEFAULT 0,
  kcal_total NUMERIC NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(plano_nutricional_id, numero_refeicao)
);

-- Fase 4: Reestruturação do Banco de Alimentos
-- Primeiro, criar nova estrutura de alimentos com medida padrão de referência
CREATE TABLE public.alimentos_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Identificação do alimento
  nome TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  
  -- Medida padrão de referência (coluna K da planilha)
  medida_padrao_referencia TEXT NOT NULL, -- Ex: '100g', '1 xícara', '1 fatia'
  peso_referencia_g NUMERIC NOT NULL, -- peso em gramas da medida padrão
  
  -- Informações nutricionais por medida padrão de referência
  kcal_por_referencia NUMERIC NOT NULL,
  ptn_g_por_referencia NUMERIC NOT NULL,
  cho_g_por_referencia NUMERIC NOT NULL,
  lip_g_por_referencia NUMERIC NOT NULL,
  
  -- Informações adicionais
  fibra_g_por_referencia NUMERIC DEFAULT 0,
  sodio_mg_por_referencia NUMERIC DEFAULT 0,
  
  -- Metadados
  fonte TEXT, -- TACO, IBGE, etc.
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para itens específicos de cada refeição (cardápio detalhado)
CREATE TABLE public.itens_refeicao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  refeicao_id UUID REFERENCES public.refeicoes_distribuicao(id) ON DELETE CASCADE,
  alimento_id UUID REFERENCES public.alimentos_v2(id) ON DELETE RESTRICT,
  
  -- Quantidade do alimento
  quantidade NUMERIC NOT NULL DEFAULT 1, -- multiplicador da medida padrão
  medida_utilizada TEXT NOT NULL, -- cópia da medida padrão para referência
  peso_total_g NUMERIC NOT NULL, -- quantidade * peso_referencia_g
  
  -- Valores nutricionais calculados (quantidade * valores_por_referencia)
  kcal_calculado NUMERIC NOT NULL,
  ptn_g_calculado NUMERIC NOT NULL,
  cho_g_calculado NUMERIC NOT NULL,
  lip_g_calculado NUMERIC NOT NULL,
  
  -- Ordem no cardápio
  ordem INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.plano_nutricional_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refeicoes_distribuicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alimentos_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_refeicao ENABLE ROW LEVEL SECURITY;

-- Policies para plano_nutricional_diario
CREATE POLICY "Users can manage their nutritional plans"
  ON public.plano_nutricional_diario
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policies para refeicoes_distribuicao
CREATE POLICY "Users can manage their meal distributions"
  ON public.refeicoes_distribuicao
  FOR ALL
  USING (plano_nutricional_id IN (
    SELECT id FROM public.plano_nutricional_diario WHERE user_id = auth.uid()
  ))
  WITH CHECK (plano_nutricional_id IN (
    SELECT id FROM public.plano_nutricional_diario WHERE user_id = auth.uid()
  ));

-- Policies para alimentos_v2 (leitura pública, apenas admins podem editar)
CREATE POLICY "Anyone can read foods v2"
  ON public.alimentos_v2
  FOR SELECT
  USING (ativo = true);

-- Policies para itens_refeicao
CREATE POLICY "Users can manage their meal items"
  ON public.itens_refeicao
  FOR ALL
  USING (refeicao_id IN (
    SELECT rd.id FROM public.refeicoes_distribuicao rd
    JOIN public.plano_nutricional_diario pnd ON rd.plano_nutricional_id = pnd.id
    WHERE pnd.user_id = auth.uid()
  ))
  WITH CHECK (refeicao_id IN (
    SELECT rd.id FROM public.refeicoes_distribuicao rd
    JOIN public.plano_nutricional_diario pnd ON rd.plano_nutricional_id = pnd.id
    WHERE pnd.user_id = auth.uid()
  ));

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plano_nutricional_diario_updated_at
    BEFORE UPDATE ON public.plano_nutricional_diario
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refeicoes_distribuicao_updated_at
    BEFORE UPDATE ON public.refeicoes_distribuicao
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alimentos_v2_updated_at
    BEFORE UPDATE ON public.alimentos_v2
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_itens_refeicao_updated_at
    BEFORE UPDATE ON public.itens_refeicao
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais para as 6 refeições padrão
INSERT INTO public.alimentos_v2 (nome, categoria, medida_padrao_referencia, peso_referencia_g, kcal_por_referencia, ptn_g_por_referencia, cho_g_por_referencia, lip_g_por_referencia, fonte)
VALUES
  ('Arroz branco cozido', 'Cereais', '100g', 100, 130, 2.7, 28.1, 0.3, 'TACO'),
  ('Feijão carioca cozido', 'Leguminosas', '100g', 100, 132, 8.7, 24.0, 0.5, 'TACO'),
  ('Frango grelhado (peito)', 'Carnes', '100g', 100, 165, 31.0, 0.0, 3.6, 'TACO'),
  ('Pão francês', 'Cereais', '1 unidade (50g)', 50, 150, 4.9, 29.7, 1.4, 'TACO'),
  ('Leite integral', 'Laticínios', '200ml', 200, 124, 6.8, 9.0, 6.2, 'TACO'),
  ('Banana nanica', 'Frutas', '1 unidade média (86g)', 86, 87, 1.3, 22.3, 0.1, 'TACO'),
  ('Ovo de galinha cozido', 'Proteínas', '1 unidade (50g)', 50, 75, 6.0, 0.6, 5.0, 'TACO'),
  ('Batata doce cozida', 'Tubérculos', '100g', 100, 77, 0.6, 18.4, 0.1, 'TACO'),
  ('Azeite de oliva', 'Óleos', '1 colher de sopa (13g)', 13, 117, 0, 0, 13.0, 'TACO'),
  ('Aveia em flocos', 'Cereais', '30g', 30, 117, 4.2, 19.8, 2.4, 'TACO');

-- Comentários para documentação
COMMENT ON TABLE public.plano_nutricional_diario IS 'Plano nutricional diário com macronutrientes definidos por g/kg ou g/dia';
COMMENT ON TABLE public.refeicoes_distribuicao IS 'Distribuição percentual dos macronutrientes nas 6 refeições diárias';
COMMENT ON TABLE public.alimentos_v2 IS 'Nova estrutura de alimentos com medida padrão de referência';
COMMENT ON TABLE public.itens_refeicao IS 'Itens específicos de cada refeição para montagem do cardápio';

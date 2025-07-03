-- Verificar se todas as colunas necessárias existem na tabela calculations
-- Adicionar colunas que podem estar faltando

-- Adicionar coluna updated_at se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'calculations' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE calculations ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Adicionar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_calculations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_calculations_updated_at ON calculations;
CREATE TRIGGER trigger_update_calculations_updated_at
    BEFORE UPDATE ON calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_calculations_updated_at();

-- Verificar e ajustar constraints para permitir valores zero
ALTER TABLE calculations ALTER COLUMN weight TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN height TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN bmr TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN tdee TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN protein TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN carbs TYPE NUMERIC;
ALTER TABLE calculations ALTER COLUMN fats TYPE NUMERIC;
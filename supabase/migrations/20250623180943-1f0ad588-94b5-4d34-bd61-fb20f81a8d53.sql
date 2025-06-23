
-- 1. Criar tabela de auditoria de segurança
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON public.security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON public.security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON public.security_audit_log(timestamp);

-- 3. Ativar RLS na tabela de auditoria
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. Política para administradores acessarem logs de auditoria
CREATE POLICY "Admin access to audit logs" ON public.security_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- 5. Política para usuários verem apenas seus próprios eventos
CREATE POLICY "Users can view own security events" ON public.security_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- 6. Função para logging seguro de eventos
CREATE OR REPLACE FUNCTION public.log_security_event_safe(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.security_audit_log (
    user_id,
    event_type,
    event_data,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    p_user_id,
    p_event_type,
    p_event_data,
    p_ip_address,
    p_user_agent,
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Falha silenciosa para não quebrar funcionalidade principal
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Corrigir RLS crítico para stripe_events
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- 8. Política restritiva para stripe_events (apenas admins)
CREATE POLICY "Admin only access to stripe events" ON public.stripe_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- 9. Função RPC segura para busca de alimentos (previne SQL injection)
CREATE OR REPLACE FUNCTION public.search_foods_secure(
  search_query TEXT,
  search_category TEXT DEFAULT NULL,
  search_limit INTEGER DEFAULT 20
) RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  calories_per_100g NUMERIC,
  protein_per_100g NUMERIC,
  carbs_per_100g NUMERIC,
  fat_per_100g NUMERIC,
  portion_size NUMERIC,
  portion_unit TEXT
) AS $$
BEGIN
  -- Validar parâmetros de entrada
  IF LENGTH(search_query) < 2 OR LENGTH(search_query) > 100 THEN
    RAISE EXCEPTION 'Query de busca deve ter entre 2 e 100 caracteres';
  END IF;
  
  search_limit := LEAST(GREATEST(search_limit, 1), 100);
  
  -- Log da busca para auditoria
  PERFORM public.log_security_event_safe(
    auth.uid(),
    'food_search',
    jsonb_build_object(
      'query', search_query,
      'category', search_category,
      'limit', search_limit
    )
  );
  
  -- Busca parametrizada segura
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.category,
    f.calories,
    f.protein,
    f.carbs,
    f.fats,
    f.portion_size,
    f.portion_unit
  FROM public.foods f
  WHERE f.name ILIKE '%' || search_query || '%'
    AND (search_category IS NULL OR f.category = search_category)
  ORDER BY f.name
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para verificar status premium de forma segura
CREATE OR REPLACE FUNCTION public.check_premium_access_secure(
  feature_name TEXT
) RETURNS JSONB AS $$
DECLARE
  is_premium BOOLEAN := FALSE;
  current_user_id UUID := auth.uid();
BEGIN
  -- Verificar se usuário tem acesso premium
  SELECT COALESCE(subscribers.is_premium, FALSE) INTO is_premium
  FROM public.subscribers
  WHERE subscribers.user_id = current_user_id
    AND payment_status = 'active'
    AND (subscription_end IS NULL OR subscription_end > NOW())
  LIMIT 1;
  
  -- Log da tentativa de acesso
  PERFORM public.log_security_event_safe(
    current_user_id,
    'premium_access_check',
    jsonb_build_object(
      'feature', feature_name,
      'granted', is_premium
    )
  );
  
  RETURN jsonb_build_object(
    'has_access', is_premium,
    'feature', feature_name,
    'timestamp', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

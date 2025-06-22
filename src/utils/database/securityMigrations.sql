
-- Security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_timestamp ON security_audit_log(timestamp);

-- RLS policies for security_audit_log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only system admins can view audit logs
CREATE POLICY "Admin access to audit logs" ON security_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Users can only view their own security events
CREATE POLICY "Users can view own security events" ON security_audit_log
  FOR SELECT USING (user_id = auth.uid());

-- Function to check premium access server-side
CREATE OR REPLACE FUNCTION check_premium_access(user_id UUID, feature_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_premium BOOLEAN DEFAULT FALSE;
  current_subscription RECORD;
BEGIN
  -- Check if user has active premium subscription
  SELECT * INTO current_subscription
  FROM user_subscriptions 
  WHERE user_subscriptions.user_id = check_premium_access.user_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  LIMIT 1;
  
  IF FOUND THEN
    is_premium := TRUE;
  END IF;
  
  -- Log the access attempt
  INSERT INTO security_audit_log (
    user_id, 
    event_type, 
    details
  ) VALUES (
    check_premium_access.user_id,
    'premium_access_check',
    jsonb_build_object(
      'feature', feature_name,
      'granted', is_premium
    )
  );
  
  RETURN is_premium;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for secure food search with logging
CREATE OR REPLACE FUNCTION secure_food_search(
  search_query TEXT,
  search_category TEXT DEFAULT NULL,
  search_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  category TEXT,
  calories_per_100g DECIMAL,
  protein_per_100g DECIMAL,
  carbs_per_100g DECIMAL,
  fat_per_100g DECIMAL
) AS $$
BEGIN
  -- Validate input parameters
  IF LENGTH(search_query) < 2 OR LENGTH(search_query) > 100 THEN
    RAISE EXCEPTION 'Search query must be between 2 and 100 characters';
  END IF;
  
  search_limit := LEAST(GREATEST(search_limit, 1), 100);
  
  -- Log the search
  INSERT INTO security_audit_log (
    user_id,
    event_type,
    details
  ) VALUES (
    auth.uid(),
    'secure_food_search',
    jsonb_build_object(
      'query', search_query,
      'category', search_category,
      'limit', search_limit
    )
  );
  
  -- Perform the search
  RETURN QUERY
  SELECT 
    f.id,
    f.name,
    f.category,
    f.calories_per_100g,
    f.protein_per_100g,
    f.carbs_per_100g,
    f.fat_per_100g
  FROM foods f
  WHERE f.name ILIKE '%' || search_query || '%'
    AND (search_category IS NULL OR f.category = search_category)
  ORDER BY f.name
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced RLS policies for stripe_events (Critical Fix)
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

-- Only system admins can access stripe events
CREATE POLICY "Admin only access to stripe events" ON stripe_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Secure user subscriptions access
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

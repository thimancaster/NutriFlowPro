-- Fix: Remove hardcoded developer emails and use the existing user_roles system
CREATE OR REPLACE FUNCTION public.check_user_premium_status(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    -- Check if user exists in subscribers with premium status
    IF EXISTS (
        SELECT 1 FROM public.subscribers 
        WHERE subscribers.user_id = $1 
        AND is_premium = true
        AND payment_status = 'active'
        AND (subscription_end IS NULL OR subscription_end > NOW())
    ) THEN
        RETURN true;
    END IF;
    
    -- Check if user has admin role using the secure has_role function
    IF public.has_role($1, 'admin') THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$function$;
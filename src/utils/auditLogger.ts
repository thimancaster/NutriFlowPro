
import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  eventType: string;
  eventData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log security events to the server
 */
export const logSecurityEvent = async (
  userId: string,
  event: SecurityEvent
): Promise<void> => {
  try {
    // Get client IP and user agent
    const userAgent = navigator.userAgent;
    
    await supabase.rpc('log_security_event', {
      p_user_id: userId,
      p_event_type: event.eventType,
      p_event_data: event.eventData || {},
      p_ip_address: event.ipAddress || null,
      p_user_agent: userAgent
    });
  } catch (error) {
    console.warn('Failed to log security event:', error);
    // Don't throw error to avoid disrupting user flow
  }
};

/**
 * Common security events
 */
export const SecurityEvents = {
  PATIENT_CREATED: 'patient_created',
  PATIENT_UPDATED: 'patient_updated',
  PATIENT_DELETED: 'patient_deleted',
  MEAL_PLAN_CREATED: 'meal_plan_created',
  CALCULATION_PERFORMED: 'calculation_performed',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  QUOTA_EXCEEDED: 'quota_exceeded',
  PREMIUM_FEATURE_ACCESSED: 'premium_feature_accessed'
} as const;


import { supabase } from '@/integrations/supabase/client';

export interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at: string;
}

export interface LoginAttempt {
  user_id: string;
  email: string;
  success: boolean;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
}

class AuditLogService {
  /**
   * Log a security event
   */
  async logEvent(event: {
    user_id: string;
    event_type: string;
    event_data?: any;
    ip_address?: string;
    user_agent?: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_event_safe', {
        p_user_id: event.user_id,
        p_event_type: event.event_type,
        p_event_data: event.event_data || {},
        p_ip_address: event.ip_address,
        p_user_agent: event.user_agent
      });

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Log a login attempt
   */
  async logLoginAttempt(
    userId: string,
    email: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    try {
      await this.logEvent({
        user_id: userId,
        event_type: success ? 'login_success' : 'login_failed',
        event_data: {
          email,
          success,
          error: errorMessage,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  /**
   * Get security events for admins
   */
  async getSecurityEvents(limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }

  /**
   * Get security events for a specific user
   */
  async getUserEvents(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }

  /**
   * Get failed login attempts for monitoring
   */
  async getFailedLoginAttempts(timeWindow: number = 24): Promise<SecurityEvent[]> {
    try {
      const timeLimit = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('event_type', 'login_failed')
        .gte('created_at', timeLimit.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching failed login attempts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching failed login attempts:', error);
      return [];
    }
  }
}

export const auditLogService = new AuditLogService();

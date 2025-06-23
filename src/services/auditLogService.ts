
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at?: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class AuditLogService {
  /**
   * Log a security/audit event using the secure database function
   */
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('log_security_event_safe', {
        p_user_id: entry.user_id,
        p_event_type: entry.event_type,
        p_event_data: entry.event_data || {},
        p_ip_address: entry.ip_address || await this.getClientIP(),
        p_user_agent: entry.user_agent || navigator.userAgent
      });

      if (error) {
        console.warn('Failed to log security event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in logEvent:', error);
      return false;
    }
  }

  /**
   * Log premium access attempt
   */
  async logPremiumAccess(userId: string, feature: string, action: string, allowed: boolean, reason?: string) {
    return this.logEvent({
      user_id: userId,
      event_type: allowed ? 'premium_access_granted' : 'premium_access_denied',
      event_data: {
        feature,
        action,
        reason,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log rate limiting event
   */
  async logRateLimit(userId: string, endpoint: string, attemptCount: number) {
    return this.logEvent({
      user_id: userId,
      event_type: 'rate_limit_exceeded',
      event_data: {
        endpoint,
        attempt_count: attemptCount,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log login attempt
   */
  async logLoginAttempt(userId: string, email: string, success: boolean, errorMessage?: string) {
    return this.logEvent({
      user_id: userId,
      event_type: success ? 'login_success' : 'login_failed',
      event_data: {
        email,
        timestamp: new Date().toISOString(),
        ...(errorMessage && { error: errorMessage })
      }
    });
  }

  /**
   * Get recent security events from database
   */
  async getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
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
      console.error('Error in getSecurityEvents:', error);
      return [];
    }
  }

  /**
   * Get events by user
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
      console.error('Error in getUserEvents:', error);
      return [];
    }
  }

  /**
   * Get client IP address
   */
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const auditLogService = new AuditLogService();

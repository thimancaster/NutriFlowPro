
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  user_id?: string;
  event_type: string;
  event_data?: any;
  ip_address?: string;
  user_agent?: string;
}

interface SecurityEvent {
  user_id: string;
  event_type: string;
  event_data: any;
  timestamp?: string;
}

/**
 * Service for logging audit events and security activities
 */
export class AuditLogService {
  /**
   * Log a general audit event
   */
  async logEvent(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert({
          user_id: entry.user_id,
          event_type: entry.event_type,
          event_data: entry.event_data || {},
          ip_address: entry.ip_address,
          user_agent: entry.user_agent || navigator.userAgent,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log audit event:', error);
      }
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  }

  /**
   * Log a security-specific event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await this.logEvent({
        user_id: event.user_id,
        event_type: event.event_type,
        event_data: {
          ...event.event_data,
          timestamp: event.timestamp || new Date().toISOString(),
          security_event: true
        }
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

  /**
   * Log rate limit events
   */
  async logRateLimit(userId: string, action: string, allowed: boolean): Promise<void> {
    try {
      await this.logEvent({
        user_id: userId,
        event_type: 'rate_limit',
        event_data: {
          action,
          allowed,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging rate limit event:', error);
    }
  }

  /**
   * Get user events for analysis
   */
  async getUserEvents(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch user events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }

  /**
   * Get recent security events
   */
  async getRecentSecurityEvents(limit: number = 100): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch security events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();

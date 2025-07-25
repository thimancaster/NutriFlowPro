
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  timestamp: string;
  ip_address?: string;
}

export class AuditLogService {
  async logEvent(event: Omit<AuditLogEvent, 'id' | 'created_at'>): Promise<void> {
    try {
      // Use security_audit_log table for security events
      const { error } = await supabase
        .from('security_audit_log')
        .insert([event]);

      if (error) {
        console.error('Error logging event:', error);
      }
    } catch (error) {
      console.error('Error logging event:', error);
    }
  }

  async getUserEvents(userId: string, limit: number = 50): Promise<AuditLogEvent[]> {
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

      return data?.map(event => ({
        id: event.id,
        user_id: event.user_id,
        event_type: event.event_type,
        event_data: event.event_data,
        created_at: event.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  }

  async logLoginAttempt(userId: string, success: boolean, additionalData?: any): Promise<void> {
    try {
      await this.logEvent({
        user_id: userId,
        event_type: success ? 'login_success' : 'login_failed',
        event_data: {
          success,
          timestamp: new Date().toISOString(),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }

  async logRateLimit(identifier: string, allowed: boolean, additionalData?: any): Promise<void> {
    try {
      await this.logEvent({
        user_id: identifier,
        event_type: 'rate_limit_check',
        event_data: {
          allowed,
          identifier,
          timestamp: new Date().toISOString(),
          ...additionalData
        }
      });
    } catch (error) {
      console.error('Error logging rate limit:', error);
    }
  }

  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'created_at' | 'timestamp'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('security_audit_log')
        .insert([{
          user_id: event.user_id,
          event_type: event.event_type,
          event_data: event.event_data,
          ip_address: event.ip_address
        }]);

      if (error) {
        console.error('Error logging security event:', error);
      }
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  }

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

      return data?.map(event => ({
        id: event.id,
        user_id: event.user_id,
        event_type: event.event_type,
        event_data: event.event_data,
        created_at: event.created_at,
        timestamp: event.created_at,
        ip_address: event.ip_address
      })) || [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }
}

export const auditLogService = new AuditLogService();

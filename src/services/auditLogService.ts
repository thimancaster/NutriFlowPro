// Enhanced audit service with better security logging
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
  private events: SecurityEvent[] = [];
  private maxMemoryEvents = 1000;

  /**
   * Log a security/audit event
   */
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const event: SecurityEvent = {
        id: crypto.randomUUID(),
        ...entry,
        ip_address: entry.ip_address || await this.getClientIP(),
        user_agent: entry.user_agent || navigator.userAgent,
        created_at: new Date().toISOString()
      };

      // Store in memory for immediate access
      this.events.unshift(event);
      
      // Keep only recent events in memory
      if (this.events.length > this.maxMemoryEvents) {
        this.events = this.events.slice(0, this.maxMemoryEvents);
      }

      // Try to persist to Supabase (Edge Function)
      try {
        await this.persistToDatabase(event);
      } catch (dbError) {
        console.warn('Failed to persist audit log to database:', dbError);
        // Continue with in-memory logging
      }

      // Console log for development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔒 Security Event:', event);
      }

      return true;
    } catch (error) {
      console.error('Error in logEvent:', error);
      return false;
    }
  }

  /**
   * Persist audit log to database via Edge Function
   */
  private async persistToDatabase(event: SecurityEvent): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('audit-logger', {
        body: { event }
      });
      
      if (error) throw error;
    } catch (error) {
      // Fail silently for audit logs to not break main functionality
      console.warn('Audit log persistence failed:', error);
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
   * Log quota violation attempt
   */
  async logQuotaViolation(userId: string, quotaType: string, current: number, limit: number) {
    return this.logEvent({
      user_id: userId,
      event_type: 'quota_violation',
      event_data: {
        quota_type: quotaType,
        current_usage: current,
        limit,
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
   * Log suspicious activity
   */
  async logSuspiciousActivity(userId: string, activity: string, details: any) {
    return this.logEvent({
      user_id: userId,
      event_type: 'suspicious_activity',
      event_data: {
        activity,
        details,
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
   * Log data access
   */
  async logDataAccess(userId: string, resourceType: string, resourceId: string, action: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'data_access',
      event_data: {
        resource_type: resourceType,
        resource_id: resourceId,
        action,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log patient data modification
   */
  async logPatientDataChange(userId: string, patientId: string, changeType: string, changes: any) {
    return this.logEvent({
      user_id: userId,
      event_type: 'patient_data_change',
      event_data: {
        patient_id: patientId,
        change_type: changeType,
        changes,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log meal plan generation
   */
  async logMealPlanGeneration(userId: string, patientId: string, mealPlanId: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'meal_plan_generated',
      event_data: {
        patient_id: patientId,
        meal_plan_id: mealPlanId,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Log consultation creation/update
   */
  async logConsultationActivity(userId: string, patientId: string, consultationId: string, activity: string) {
    return this.logEvent({
      user_id: userId,
      event_type: 'consultation_activity',
      event_data: {
        patient_id: patientId,
        consultation_id: consultationId,
        activity,
        timestamp: new Date().toISOString()
      }
    });
  }

  /**
   * Get recent security events (from memory)
   */
  async getSecurityEvents(limit: number = 100): Promise<SecurityEvent[]> {
    return this.events.slice(0, limit);
  }

  /**
   * Get events by user (from memory)
   */
  async getUserEvents(userId: string, limit: number = 50): Promise<SecurityEvent[]> {
    return this.events
      .filter(event => event.user_id === userId)
      .slice(0, limit);
  }

  /**
   * Get events by type
   */
  async getEventsByType(eventType: string, limit: number = 50): Promise<SecurityEvent[]> {
    return this.events
      .filter(event => event.event_type === eventType)
      .slice(0, limit);
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

  /**
   * Clear memory events (for testing or privacy)
   */
  clearMemoryEvents(): void {
    this.events = [];
  }

  /**
   * Get statistics about security events
   */
  getSecurityStats(): {
    totalEvents: number;
    eventTypes: Record<string, number>;
    recentActivity: SecurityEvent[];
  } {
    const eventTypes: Record<string, number> = {};
    
    this.events.forEach(event => {
      eventTypes[event.event_type] = (eventTypes[event.event_type] || 0) + 1;
    });

    return {
      totalEvents: this.events.length,
      eventTypes,
      recentActivity: this.events.slice(0, 10)
    };
  }
}

export const auditLogService = new AuditLogService();
